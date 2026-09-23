import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { randomUUID } from "expo-crypto";
import { Library, Person, emptyLibrary } from "../types";
import { loadLibrary, saveLibrary } from "../database/storage";
import {
  normalizeTags,
  removeGroup,
  validateLibrary,
} from "../services/library";

type LibraryContextValue = {
  data: Library;
  loading: boolean;
  error: string;
  retry: () => void;
  savePerson: (p: Person) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  saveGroup: (
    name: string,
    id?: string,
    memberIds?: string[],
  ) => Promise<string>;
  deleteGroup: (id: string) => Promise<void>;
  replace: (data: Library) => Promise<void>;
};
const Context = createContext<LibraryContextValue | null>(null);
export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(emptyLibrary);
  const current = useRef(data);
  const queue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const retry = () => {
    setLoading(true);
    setError("");
    loadLibrary()
      .then((next) => {
        current.current = next;
        setData(next);
      })
      .catch((e) => setError(e.message || "Unable to open local storage."))
      .finally(() => setLoading(false));
  };
  useEffect(retry, []);
  const mutate = (change: (previous: Library) => Library) => {
    const task = queue.current.then(async () => {
      const next = validateLibrary(change(current.current));
      await saveLibrary(next);
      current.current = next;
      setData(next);
    });
    queue.current = task.catch(() => {});
    return task;
  };
  const value: LibraryContextValue = {
    data,
    loading,
    error,
    retry,
    savePerson: (p) =>
      mutate((d) => ({
        ...d,
        people: [
          ...d.people.filter((x) => x.id !== p.id),
          {
            ...p,
            fullName: p.fullName.trim(),
            tags: normalizeTags(p.tags),
            updatedAt: new Date().toISOString(),
          },
        ],
      })),
    deletePerson: (id) =>
      mutate((d) => ({ ...d, people: d.people.filter((p) => p.id !== id) })),
    saveGroup: async (name, existingId, memberIds) => {
      const id = existingId || randomUUID();
      await mutate((d) => {
        if (!name.trim()) throw new Error("Give your group a name.");
        if (
          d.groups.some(
            (g) =>
              g.id !== id && g.name.toLowerCase() === name.trim().toLowerCase(),
          )
        )
          throw new Error("A group with this name already exists.");
        return {
          ...d,
          groups: [
            ...d.groups.filter((g) => g.id !== id),
            { id, name: name.trim() },
          ],
          people: memberIds
            ? d.people.map((p) => ({
                ...p,
                groupIds: memberIds.includes(p.id)
                  ? [...new Set([...p.groupIds, id])]
                  : p.groupIds.filter((g) => g !== id),
              }))
            : d.people,
        };
      });
      return id;
    },
    deleteGroup: (id) => mutate((d) => removeGroup(d, id)),
    replace: (next) => mutate(() => next),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLibrary() {
  const value = useContext(Context);
  if (!value) throw new Error("LibraryProvider is missing");
  return value;
}
