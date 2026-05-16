"use client";

import type { ProgressPhotoAttachment } from "@/types";

const dbName = "3030-progress-photos";
const dbVersion = 1;
const photoStore = "photos";
const blobStore = "photoBlobs";
export const maxProgressPhotoBytes = 8 * 1024 * 1024;

export type ProgressPhotoPreview = ProgressPhotoAttachment & { objectUrl: string };

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(photoStore)) db.createObjectStore(photoStore, { keyPath: "id" });
      if (!db.objectStoreNames.contains(blobStore)) db.createObjectStore(blobStore, { keyPath: "localBlobKey" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction<T>(mode: IDBTransactionMode, run: (stores: { photos: IDBObjectStore; blobs: IDBObjectStore }) => IDBRequest<T> | void) {
  return new Promise<T | undefined>(async (resolve, reject) => {
    const db = await openDb();
    const tx = db.transaction([photoStore, blobStore], mode);
    const stores = { photos: tx.objectStore(photoStore), blobs: tx.objectStore(blobStore) };
    const request = run(stores);
    let result: T | undefined;
    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => reject(request.error);
    }
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export function validateProgressPhotoSize(file: File) {
  return file.size <= maxProgressPhotoBytes;
}

// Privacy rule: progress photos are sensitive and local-only by default.
// Do not upload blobs, file names, exact sizes, body data, or image content to analytics/backends.
export async function saveProgressPhoto(checkInId: string, angle: ProgressPhotoAttachment["angle"], file: File) {
  if (!validateProgressPhotoSize(file)) throw new Error("photo-too-large");
  const now = new Date().toISOString();
  const localBlobKey = `${checkInId}:${angle}:${crypto.randomUUID()}`;
  const photo: ProgressPhotoAttachment = {
    id: crypto.randomUUID(),
    checkInId,
    angle,
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
    size: file.size,
    createdAt: now,
    localBlobKey,
  };
  await transaction("readwrite", ({ photos, blobs }) => {
    blobs.put({ localBlobKey, blob: file });
    return photos.put(photo);
  });
  return photo;
}

export async function listProgressPhotos(checkInId?: string): Promise<ProgressPhotoPreview[]> {
  const photos = await transaction<ProgressPhotoAttachment[]>("readonly", ({ photos }) => photos.getAll());
  const filtered = (photos ?? []).filter((photo) => !checkInId || photo.checkInId === checkInId);
  const previews: ProgressPhotoPreview[] = [];
  for (const photo of filtered) {
    const blobRecord = await transaction<{ localBlobKey: string; blob: Blob }>("readonly", ({ blobs }) => blobs.get(photo.localBlobKey));
    if (blobRecord?.blob) previews.push({ ...photo, objectUrl: URL.createObjectURL(blobRecord.blob) });
  }
  return previews;
}

export async function deleteProgressPhoto(photoId: string) {
  const photo = await transaction<ProgressPhotoAttachment>("readonly", ({ photos }) => photos.get(photoId));
  await transaction("readwrite", ({ photos, blobs }) => {
    photos.delete(photoId);
    if (photo?.localBlobKey) blobs.delete(photo.localBlobKey);
  });
}

export async function clearProgressPhotos() {
  await transaction("readwrite", ({ photos, blobs }) => {
    photos.clear();
    blobs.clear();
  });
}
