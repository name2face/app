import { Library, emptyLibrary } from "../types";
import { normalizeTags, validateLibrary } from "../services/library";
const KEY = "name2face_library_v1";
const LEGACY_KEY = "name2face_offline_persons";
export async function loadLibrary(): Promise<Library> {
  const stored = localStorage.getItem(KEY);
  if (stored !== null) return validateLibrary(JSON.parse(stored));
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy === null) return emptyLibrary();
  const entries = JSON.parse(legacy);
  if (!Array.isArray(entries))
    throw new Error(
      "The previous local library could not be read. Its data has been preserved.",
    );
  const groups = new Map<string, { id: string; name: string }>();
  const people = entries.map((p: any, index: number) => {
    const groupIds = (p.tags || []).map((name: string) => {
      const key = name.trim().toLowerCase();
      if (!groups.has(key))
        groups.set(key, {
          id: `legacy-group-${groups.size}`,
          name: name.trim(),
        });
      return groups.get(key)!.id;
    });
    const now = new Date().toISOString();
    return {
      id: String(p.id || `legacy-person-${index}`),
      fullName: p.name,
      groupIds,
      tags: normalizeTags((p.memoryHooks || "").split(",")),
      notes: Array.isArray(p.notes)
        ? p.notes.map((n: any) => n.content || "").join("\n")
        : p.notes || "",
      createdAt: typeof p.createdAt === "string" ? p.createdAt : now,
      updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : now,
    };
  });
  const migrated = validateLibrary({
    version: 1,
    people,
    groups: [...groups.values()],
  });
  await saveLibrary(migrated);
  return migrated;
}
export async function saveLibrary(data: Library) {
  // A failed/quota-exceeded write leaves the previous snapshot intact.
  localStorage.setItem(KEY, JSON.stringify(validateLibrary(data)));
  // Retire the old browser copy only after successfully persisting the replacement.
  localStorage.removeItem(LEGACY_KEY);
  localStorage.removeItem("name2face_logged_out_mode");
}
