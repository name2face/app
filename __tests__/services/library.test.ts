import {
  alphabetic,
  gamePool,
  hasFilters,
  normalizeTags,
  removeGroup,
  searchPeople,
  shuffle,
  validateLibrary,
} from "../../src/services/library";
import { Library, Person } from "../../src/types";
const now = "2026-09-22T12:00:00.000Z";
const person = (
  id: string,
  fullName: string,
  tags: string[],
  groupIds: string[],
  notes = "",
): Person => ({
  id,
  fullName,
  tags,
  groupIds,
  notes,
  createdAt: now,
  updatedAt: now,
});
const alex = person(
  "a",
  "Alex Morgan",
  ["red glasses", "tennis"],
  ["work", "gym"],
  "Wife: Sarah. Dog: Max.",
);
const ben = person(
  "b",
  "Ben Smith",
  ["red glasses"],
  ["work"],
  "Drives a Subaru",
);
const chen = person("c", "Chen Li", [], [], "Met at the bookshop");
const library: Library = {
  version: 1,
  people: [alex, ben, chen],
  groups: [
    { id: "work", name: "Work" },
    { id: "gym", name: "Gym" },
  ],
};
const filter = { name: "", notes: "", group: "ALL", tags: [] as string[] };
test("recall combines fields and requires every memory clue", () => {
  expect(
    searchPeople(library.people, {
      ...filter,
      name: "morg",
      tags: ["GLASS", "ten"],
      notes: "max",
      group: "gym",
    }),
  ).toEqual([alex]);
  expect(
    searchPeople(library.people, { ...filter, tags: ["red", "tennis"] }),
  ).toEqual([alex]);
  expect(
    searchPeople(library.people, { ...filter, notes: "max", group: "NONE" }),
  ).toEqual([]);
});
test("all includes grouped and ungrouped people; none includes only ungrouped", () => {
  expect(searchPeople(library.people, filter)).toHaveLength(3);
  expect(searchPeople(library.people, { ...filter, group: "NONE" })).toEqual([
    chen,
  ]);
  expect(hasFilters(filter)).toBe(false);
  expect(hasFilters({ ...filter, group: "work" })).toBe(true);
});
test("notes search is case insensitive and literal, including SQL wildcard characters", () => {
  expect(
    searchPeople([person("x", "Jo", [], [], "100% real")], {
      ...filter,
      notes: "%",
    }),
  ).toHaveLength(1);
  expect(searchPeople(library.people, { ...filter, notes: "%" })).toHaveLength(
    0,
  );
  expect(searchPeople(library.people, { ...filter, notes: "SUBARU" })).toEqual([
    ben,
  ]);
});
test("normalizes hooks without duplicate chips", () =>
  expect(normalizeTags([" Red Glasses ", "red glasses", "", "TENnis"])).toEqual(
    ["red glasses", "tennis"],
  ));
test("deleting one group preserves people, notes, and other memberships", () => {
  const next = removeGroup(library, "work");
  expect(next.people).toHaveLength(3);
  expect(next.people[0].groupIds).toEqual(["gym"]);
  expect(next.people[1].groupIds).toEqual([]);
  expect(next.people[0].notes).toBe(alex.notes);
  expect(library.people[0].groupIds).toEqual(["work", "gym"]);
});
test("backup validation preserves empty groups and full relationships", () =>
  expect(validateLibrary(library)).toEqual(library));
test.each([
  { ...library, version: 99 },
  { ...library, people: [alex, alex] },
  {
    ...library,
    groups: [
      { id: "work", name: "Work" },
      { id: "work", name: "Another" },
    ],
  },
  {
    ...library,
    groups: [
      { id: "work", name: "Work" },
      { id: "gym", name: " work " },
    ],
  },
  { ...library, people: [{ ...alex, groupIds: ["missing"] }] },
  { ...library, people: [{ ...alex, fullName: "   " }] },
  { ...library, people: [{ ...alex, createdAt: "not-a-date" }] },
  { ...library, people: [{ ...alex, tags: [3] }] },
  { ...library, people: [{ ...alex, notes: null }] },
])("rejects invalid backup graph %# before it can replace data", (value) =>
  expect(() => validateLibrary(value)).toThrow("valid Name2Face backup"),
);
test("game uses note-only people, excludes empty and ambiguous clues or names", () => {
  expect(gamePool([alex, chen, person("d", "Dana", [], [])])).toEqual([
    alex,
    chen,
  ]);
  expect(
    gamePool([alex, { ...alex, id: "d", fullName: "Dana" }, chen]),
  ).toEqual([chen]);
  expect(gamePool([alex, { ...ben, fullName: "Alex Morgan" }, chen])).toEqual([
    chen,
  ]);
});
test("shuffling preserves identities and does not mutate the library", () => {
  const input = [1, 2, 3, 4, 5];
  const result = shuffle(input, () => 0);
  expect(result).not.toEqual(input);
  expect([...result].sort()).toEqual(input);
  expect(input).toEqual([1, 2, 3, 4, 5]);
});
