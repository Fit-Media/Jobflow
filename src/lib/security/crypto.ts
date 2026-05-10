import crypto from "crypto";

const algorithm = "aes-256-gcm";

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY is required before storing OAuth tokens.");
  }

  const key = Buffer.from(raw, raw.length === 64 ? "hex" : "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to 32 bytes. Use `openssl rand -base64 32`.");
  }
  return key;
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(payload: string) {
  const [ivRaw, tagRaw, encryptedRaw] = payload.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("Invalid encrypted payload.");
  const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function redactSecret(value?: string | null) {
  if (!value) return "";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
