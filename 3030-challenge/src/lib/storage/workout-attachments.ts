"use client";

import type { WorkoutAttachment } from "@/types";

const dbName = "3030-workout-attachments";
const dbVersion = 1;
const attachmentStore = "attachments";
const blobStore = "videoBlobs";
export const maxWorkoutVideoBytes = 25 * 1024 * 1024;

type StoredVideoAttachment = WorkoutAttachment & { blob: Blob; objectUrl: string };

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(attachmentStore)) db.createObjectStore(attachmentStore, { keyPath: "fieldKey" });
      if (!db.objectStoreNames.contains(blobStore)) db.createObjectStore(blobStore, { keyPath: "localBlobKey" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction<T>(mode: IDBTransactionMode, run: (stores: { attachments: IDBObjectStore; blobs: IDBObjectStore }) => IDBRequest<T> | void) {
  return new Promise<T | undefined>(async (resolve, reject) => {
    const db = await openDb();
    const tx = db.transaction([attachmentStore, blobStore], mode);
    const stores = { attachments: tx.objectStore(attachmentStore), blobs: tx.objectStore(blobStore) };
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

export function validateVideoSize(file: File) {
  return file.size <= maxWorkoutVideoBytes;
}

// Privacy rule: workout videos are stored only in IndexedDB on this device.
// Do not upload these blobs, file names, exact sizes, or video content to analytics or any backend.
export async function saveVideoAttachment(fieldKey: string, file: File) {
  if (!validateVideoSize(file)) throw new Error("video-too-large");
  const now = new Date().toISOString();
  const localBlobKey = `${fieldKey}:${crypto.randomUUID()}`;
  const attachment: WorkoutAttachment = {
    id: crypto.randomUUID(),
    fieldKey,
    type: "video",
    fileName: file.name,
    mimeType: file.type || "video/mp4",
    size: file.size,
    createdAt: now,
    localBlobKey,
  };
  await transaction("readwrite", ({ attachments, blobs }) => {
    blobs.put({ localBlobKey, blob: file });
    return attachments.put(attachment);
  });
  return attachment;
}

export async function getVideoAttachment(fieldKey: string): Promise<StoredVideoAttachment | null> {
  const attachment = await transaction<WorkoutAttachment>("readonly", ({ attachments }) => attachments.get(fieldKey));
  if (!attachment) return null;
  const blobRecord = await transaction<{ localBlobKey: string; blob: Blob }>("readonly", ({ blobs }) => blobs.get(attachment.localBlobKey));
  if (!blobRecord?.blob) return null;
  return { ...attachment, blob: blobRecord.blob, objectUrl: URL.createObjectURL(blobRecord.blob) };
}

export async function deleteVideoAttachment(fieldKey: string) {
  const attachment = await transaction<WorkoutAttachment>("readonly", ({ attachments }) => attachments.get(fieldKey));
  await transaction("readwrite", ({ attachments, blobs }) => {
    attachments.delete(fieldKey);
    if (attachment?.localBlobKey) blobs.delete(attachment.localBlobKey);
  });
}

export async function listWorkoutAttachments(): Promise<WorkoutAttachment[]> {
  const attachments = await transaction<WorkoutAttachment[]>("readonly", ({ attachments }) => attachments.getAll());
  return attachments ?? [];
}

export async function clearWorkoutAttachments() {
  await transaction("readwrite", ({ attachments, blobs }) => {
    attachments.clear();
    blobs.clear();
  });
}
