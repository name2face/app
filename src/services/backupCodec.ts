import { gcm } from "@noble/ciphers/aes.js";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import { Library } from "../types";
import { validateLibrary } from "./library";

export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
const ITERATIONS = 600000;
const FORMAT = "name2face.encrypted-backup";
async function keyFor(password: string, salt: Uint8Array) {
  return pbkdf2Async(sha256, utf8ToBytes(password), salt, {
    c: ITERATIONS,
    dkLen: 32,
    asyncTick: 10,
  });
}
export async function encryptBackup(
  data: Library,
  password: string,
  random: (length: number) => Uint8Array,
): Promise<string> {
  if (password.length < 10)
    throw new Error("Use a backup password of at least 10 characters.");
  const salt = random(16);
  const nonce = random(12);
  const key = await keyFor(password, salt);
  try {
    const plaintext = JSON.stringify({
      ...validateLibrary(data),
      exportedAt: new Date().toISOString(),
    });
    const ciphertext = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
    const result = JSON.stringify({
      format: FORMAT,
      version: 1,
      cipher: "AES-256-GCM",
      kdf: "PBKDF2-SHA256",
      iterations: ITERATIONS,
      salt: bytesToHex(salt),
      nonce: bytesToHex(nonce),
      ciphertext: bytesToHex(ciphertext),
    });
    if (result.length > MAX_BACKUP_BYTES)
      throw new Error("This library exceeds the 20 MB backup limit.");
    return result;
  } finally {
    key.fill(0);
  }
}
export async function decryptBackup(
  raw: string,
  password: string,
): Promise<Library> {
  if (raw.length > MAX_BACKUP_BYTES)
    throw new Error("The backup exceeds the 20 MB limit.");
  let envelope: any;
  try {
    envelope = JSON.parse(raw);
  } catch {
    throw new Error("This file is not a valid JSON backup.");
  }
  const hex = (v: unknown, size?: number) =>
    typeof v === "string" &&
    /^[a-f0-9]+$/i.test(v) &&
    v.length % 2 === 0 &&
    (!size || v.length === size);
  if (
    !envelope ||
    envelope.format !== FORMAT ||
    envelope.version !== 1 ||
    envelope.cipher !== "AES-256-GCM" ||
    envelope.kdf !== "PBKDF2-SHA256" ||
    envelope.iterations !== ITERATIONS ||
    !hex(envelope.salt, 32) ||
    !hex(envelope.nonce, 24) ||
    !hex(envelope.ciphertext) ||
    envelope.ciphertext.length < 32
  )
    throw new Error("This is not a supported encrypted Name2Face backup.");
  const key = await keyFor(password, hexToBytes(envelope.salt));
  let plaintext: Uint8Array;
  try {
    plaintext = gcm(key, hexToBytes(envelope.nonce)).decrypt(
      hexToBytes(envelope.ciphertext),
    );
  } catch {
    throw new Error(
      "The password is incorrect or the backup is damaged. Your data has not been changed.",
    );
  } finally {
    key.fill(0);
  }
  try {
    return validateLibrary(JSON.parse(new TextDecoder().decode(plaintext)));
  } finally {
    plaintext.fill(0);
  }
}
