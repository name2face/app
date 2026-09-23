import * as SQLite from "expo-sqlite";
import { Library, Person } from "../types";
import { validateLibrary } from "../services/library";
import { SCHEMA, SCHEMA_VERSION } from "./schema";

let opening: Promise<SQLite.SQLiteDatabase> | undefined;
async function database() {
  if (!opening)
    opening = (async () => {
      const db = await SQLite.openDatabaseAsync("name2face-local.db");
      await db.execAsync(
        "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;",
      );
      const row = await db.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version",
      );
      if ((row?.user_version || 0) > SCHEMA_VERSION)
        throw new Error("This library needs a newer version of Name2Face.");
      if (!row?.user_version)
        await db.withExclusiveTransactionAsync(async (tx) => {
          await tx.execAsync(SCHEMA);
        });
      return db;
    })().catch((error) => {
      opening = undefined;
      throw error;
    });
  return opening;
}
export async function loadLibrary(): Promise<Library> {
  const db = await database();
  const rows = await db.getAllAsync<{
    id: string;
    full_name: string;
    notes: string;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM person");
  const groups = await db.getAllAsync<{ id: string; name: string }>(
    "SELECT * FROM groups ORDER BY name COLLATE NOCASE",
  );
  const links = await db.getAllAsync<{ person_id: string; group_id: string }>(
    "SELECT * FROM person_groups",
  );
  const tags = await db.getAllAsync<{ person_id: string; tag_name: string }>(
    "SELECT * FROM person_tags",
  );
  const people: Person[] = rows.map((p) => ({
    id: p.id,
    fullName: p.full_name,
    notes: p.notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    groupIds: links.filter((l) => l.person_id === p.id).map((l) => l.group_id),
    tags: tags.filter((t) => t.person_id === p.id).map((t) => t.tag_name),
  }));
  return validateLibrary({ version: 1, people, groups });
}
// A complete snapshot commits atomically, including restore and reset. The provider serializes writes.
export async function saveLibrary(input: Library) {
  const data = validateLibrary(input);
  const db = await database();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(
      "DELETE FROM person; DELETE FROM groups; DELETE FROM tags;",
    );
    for (const g of data.groups)
      await tx.runAsync("INSERT INTO groups VALUES (?, ?)", g.id, g.name);
    for (const p of data.people) {
      await tx.runAsync(
        "INSERT INTO person VALUES (?, ?, ?, ?, ?)",
        p.id,
        p.fullName,
        p.notes,
        p.createdAt,
        p.updatedAt,
      );
      for (const group of p.groupIds)
        await tx.runAsync(
          "INSERT INTO person_groups VALUES (?, ?)",
          p.id,
          group,
        );
      for (const tag of p.tags) {
        await tx.runAsync("INSERT OR IGNORE INTO tags VALUES (?)", tag);
        await tx.runAsync("INSERT INTO person_tags VALUES (?, ?)", p.id, tag);
      }
    }
  });
}
