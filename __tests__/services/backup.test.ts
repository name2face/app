/** @jest-environment node */
import { randomBytes, pbkdf2Sync, createDecipheriv } from "node:crypto";
import { encryptBackup, decryptBackup } from "../../src/services/backupCodec";
import { Library } from "../../src/types";
const data: Library = {
  version: 1,
  groups: [{ id: "empty", name: "Empty group" }],
  people: [
    {
      id: "p",
      fullName: "José 李",
      notes: "Dog: Max 🐕",
      tags: ["red glasses"],
      groupIds: [],
      createdAt: "2026-09-22T12:00:00Z",
      updatedAt: "2026-09-22T12:00:00Z",
    },
  ],
};
let encrypted: string;
beforeAll(async () => {
  encrypted = await encryptBackup(data, "a strong test password", randomBytes);
}, 30000);
test("encrypted backup round-trips unicode, empty groups, and relations", async () => {
  expect(encrypted).not.toContain("José");
  expect(encrypted).not.toContain("Max");
  expect(await decryptBackup(encrypted, "a strong test password")).toEqual(
    data,
  );
}, 30000);
test("backup uses interoperable authenticated encryption", () => {
  const file = JSON.parse(encrypted);
  const key = pbkdf2Sync(
    "a strong test password",
    Buffer.from(file.salt, "hex"),
    file.iterations,
    32,
    "sha256",
  );
  const cipher = Buffer.from(file.ciphertext, "hex");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(file.nonce, "hex"),
  );
  decipher.setAuthTag(cipher.subarray(-16));
  const clear = Buffer.concat([
    decipher.update(cipher.subarray(0, -16)),
    decipher.final(),
  ]);
  expect(JSON.parse(clear.toString()).people).toEqual(data.people);
});
test("wrong passwords and tampering cannot produce restorable data", async () => {
  await expect(decryptBackup(encrypted, "incorrect password")).rejects.toThrow(
    "password is incorrect",
  );
  const damaged = JSON.parse(encrypted);
  damaged.ciphertext =
    (damaged.ciphertext.startsWith("00") ? "01" : "00") +
    damaged.ciphertext.slice(2);
  await expect(
    decryptBackup(JSON.stringify(damaged), "a strong test password"),
  ).rejects.toThrow("damaged");
}, 30000);
test("rejects unsupported versions and hostile KDF work factors", async () => {
  await expect(decryptBackup("{bad json", "pass")).rejects.toThrow(
    "valid JSON",
  );
  const file = JSON.parse(encrypted);
  file.iterations = 999999999;
  await expect(decryptBackup(JSON.stringify(file), "pass")).rejects.toThrow(
    "supported",
  );
});
