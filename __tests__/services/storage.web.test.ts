/** @jest-environment node */
import { loadLibrary, saveLibrary } from "../../src/database/storage.web";
import { emptyLibrary } from "../../src/types";
let values: Map<string, string>;
beforeEach(() => {
  values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
  });
});
test("migrates legacy browser contacts once, preserving notes and old categories as groups", async () => {
  values.set(
    "name2face_offline_persons",
    JSON.stringify([
      {
        id: "old",
        name: "Alex",
        tags: ["Work"],
        notes: [{ content: "Dog: Max" }],
        memoryHooks: " Red Glasses, Tennis ",
      },
    ]),
  );
  const data = await loadLibrary();
  expect(data.people[0]).toEqual(
    expect.objectContaining({
      fullName: "Alex",
      notes: "Dog: Max",
      tags: ["red glasses", "tennis"],
    }),
  );
  expect(data.groups[0].name).toBe("Work");
  expect(values.has("name2face_offline_persons")).toBe(false);
  await saveLibrary(emptyLibrary());
  expect((await loadLibrary()).people).toEqual([]);
});
test("failed persistence leaves previous data untouched", async () => {
  await saveLibrary(emptyLibrary());
  const previous = values.get("name2face_library_v1");
  localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  await expect(
    saveLibrary({ version: 1, people: [], groups: [{ id: "x", name: "New" }] }),
  ).rejects.toThrow("Quota");
  expect(values.get("name2face_library_v1")).toBe(previous);
});
test("malformed prior data is preserved instead of silently reset", async () => {
  values.set("name2face_offline_persons", "{corrupt");
  await expect(loadLibrary()).rejects.toThrow();
  expect(values.get("name2face_offline_persons")).toBe("{corrupt");
  expect(values.has("name2face_library_v1")).toBe(false);
});
