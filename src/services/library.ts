import { Library, Person, RecallFilter } from "../types";

export const normalizeTags = (tags: string[]) => [
  ...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
];
export const alphabetic = (a: Person, b: Person) =>
  a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" });
export const hasFilters = (f: RecallFilter) =>
  !!(f.name.trim() || f.notes.trim() || f.tags.length || f.group !== "ALL");
export function searchPeople(people: Person[], filter: RecallFilter): Person[] {
  const name = filter.name.trim().toLowerCase();
  const notes = filter.notes.trim().toLowerCase();
  const tags = normalizeTags(filter.tags);
  return people
    .filter(
      (p) =>
        p.fullName.toLowerCase().includes(name) &&
        p.notes.toLowerCase().includes(notes) &&
        (filter.group === "ALL" ||
          (filter.group === "NONE"
            ? !p.groupIds.length
            : p.groupIds.includes(filter.group))) &&
        tags.every((tag) => p.tags.some((t) => t.includes(tag))),
    )
    .sort(alphabetic);
}

// Backups are untrusted input. Validate the complete graph before any storage write.
export function validateLibrary(value: unknown): Library {
  const fail = (): never => {
    throw new Error(
      "This is not a valid Name2Face backup. Your current data has not been changed.",
    );
  };
  if (!value || typeof value !== "object") return fail();
  const data = value as Library;
  if (
    data.version !== 1 ||
    !Array.isArray(data.people) ||
    !Array.isArray(data.groups) ||
    data.people.length > 50000 ||
    data.groups.length > 5000
  )
    return fail();
  const text = (v: unknown, max: number): v is string =>
    typeof v === "string" && v.length <= max;
  const id = (v: unknown): v is string => text(v, 200) && !!v.trim();
  const groupIds = new Set<string>();
  const groupNames = new Set<string>();
  const groups = data.groups.map((g) => {
    if (
      !g ||
      !id(g.id) ||
      !text(g.name, 100) ||
      !g.name.trim() ||
      groupIds.has(g.id) ||
      groupNames.has(g.name.trim().toLowerCase())
    )
      return fail();
    groupIds.add(g.id);
    groupNames.add(g.name.trim().toLowerCase());
    return { id: g.id, name: g.name.trim() };
  });
  const ids = new Set<string>();
  const people = data.people.map((p) => {
    if (
      !p ||
      !id(p.id) ||
      ids.has(p.id) ||
      !text(p.fullName, 200) ||
      !p.fullName.trim() ||
      !text(p.notes, 10000) ||
      !Array.isArray(p.tags) ||
      p.tags.length > 100 ||
      !p.tags.every((t) => text(t, 100)) ||
      !Array.isArray(p.groupIds) ||
      !p.groupIds.every((g) => typeof g === "string" && groupIds.has(g)) ||
      !text(p.createdAt, 40) ||
      !Number.isFinite(Date.parse(p.createdAt)) ||
      !text(p.updatedAt, 40) ||
      !Number.isFinite(Date.parse(p.updatedAt))
    )
      return fail();
    ids.add(p.id);
    return {
      id: p.id,
      fullName: p.fullName.trim(),
      notes: p.notes,
      tags: normalizeTags(p.tags),
      groupIds: [...new Set(p.groupIds)],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });
  return { version: 1, people, groups };
}

export function removeGroup(data: Library, id: string): Library {
  return {
    ...data,
    groups: data.groups.filter((g) => g.id !== id),
    people: data.people.map((p) => ({
      ...p,
      groupIds: p.groupIds.filter((g) => g !== id),
    })),
  };
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export const clueFor = (p: Person) =>
  p.tags.length ? p.tags.join(" · ") : p.notes.trim();
export function gamePool(people: Person[]) {
  const counts = new Map<string, number>();
  const names = new Map<string, number>();
  people.forEach((p) => {
    const clue = clueFor(p).toLowerCase();
    counts.set(clue, (counts.get(clue) || 0) + 1);
    const name = p.fullName.toLowerCase();
    names.set(name, (names.get(name) || 0) + 1);
  });
  return people.filter(
    (p) =>
      clueFor(p) &&
      counts.get(clueFor(p).toLowerCase()) === 1 &&
      names.get(p.fullName.toLowerCase()) === 1,
  );
}
