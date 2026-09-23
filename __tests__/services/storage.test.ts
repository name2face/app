/** @jest-environment node */
import { DatabaseSync } from "node:sqlite";
import { emptyLibrary, Library } from "../../src/types";
// Exercise the actual adapter and schema against SQLite, with Expo's async API bridged to node:sqlite.
jest.mock("expo-sqlite", () => {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(":memory:");
  const adapter = {
    execAsync: async (sql: string) => db.exec(sql),
    runAsync: async (sql: string, ...args: any[]) =>
      db.prepare(sql).run(...args),
    getAllAsync: async (sql: string) => db.prepare(sql).all(),
    getFirstAsync: async (sql: string) => db.prepare(sql).get(),
    withExclusiveTransactionAsync: async (fn: (tx: any) => Promise<void>) => {
      db.exec("BEGIN");
      try {
        await fn(adapter);
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
  return { openDatabaseAsync: async () => adapter, __db: db };
});
import { loadLibrary, saveLibrary } from "../../src/database/storage";
const library: Library = {
  version: 1,
  groups: [
    { id: "g", name: "Gym" },
    { id: "empty", name: "Empty" },
  ],
  people: [
    {
      id: "p",
      fullName: "Alex",
      notes: "Dog Max",
      tags: ["tennis", "red glasses"],
      groupIds: ["g"],
      createdAt: "2026-09-22T00:00:00Z",
      updatedAt: "2026-09-22T00:00:00Z",
    },
  ],
};
test("initializes a versioned local database and persists a complete library", async () => {
  expect(await loadLibrary()).toEqual(emptyLibrary());
  await saveLibrary(library);
  const loaded = await loadLibrary();
  expect(loaded.people[0]).toEqual(
    expect.objectContaining({
      fullName: "Alex",
      groupIds: ["g"],
      notes: "Dog Max",
    }),
  );
  expect(loaded.people[0].tags.sort()).toEqual(["red glasses", "tennis"]);
  expect(loaded.groups).toHaveLength(2);
  const db: DatabaseSync = require("expo-sqlite").__db;
  expect(db.prepare("PRAGMA user_version").get()?.user_version).toBe(1);
});
test("failed writes roll back deletion and preserve the complete prior database", async () => {
  const db: DatabaseSync = require("expo-sqlite").__db;
  await saveLibrary(library);
  db.exec(
    "CREATE TRIGGER fail_insert BEFORE INSERT ON person BEGIN SELECT RAISE(ABORT, 'disk failure'); END",
  );
  await expect(
    saveLibrary({
      ...library,
      people: [{ ...library.people[0], fullName: "Changed" }],
    }),
  ).rejects.toThrow("disk failure");
  expect((await loadLibrary()).people[0].fullName).toBe("Alex");
  db.exec("DROP TRIGGER fail_insert");
});
test("invalid restore is rejected before writes, and valid reset cleans relationships", async () => {
  await expect(
    saveLibrary({
      ...library,
      people: [{ ...library.people[0], groupIds: ["missing"] }],
    }),
  ).rejects.toThrow();
  expect((await loadLibrary()).people).toHaveLength(1);
  await saveLibrary(emptyLibrary());
  expect(await loadLibrary()).toEqual(emptyLibrary());
  const db: DatabaseSync = require("expo-sqlite").__db;
  expect(db.prepare("SELECT COUNT(*) AS n FROM person_tags").get()?.n).toBe(0);
});
