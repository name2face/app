import React, { useState } from "react";
import { View } from "react-native";
import { useLibrary } from "../contexts/LibraryContext";
import { normalizeTags } from "../services/library";
import { Button, Chip, Copy, ErrorText, Field, s } from "./ui";
export function TagInput({
  tags,
  onChange,
  draft,
  onDraftChange,
  search = false,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  search?: boolean;
}) {
  const commit = () => {
    onChange(normalizeTags([...tags, draft]));
    onDraftChange("");
  };
  return (
    <View style={{ marginBottom: 18 }}>
      <Field
        label="Memory hooks"
        hint={
          search
            ? "Add clues to narrow your matches. Partial words work too."
            : "A trait, hobby, or anything that will bring them to mind."
        }
        placeholder="e.g. red glasses, plays tennis"
        value={draft}
        maxLength={100}
        returnKeyType="done"
        onChangeText={(value) => {
          if (value.includes(",")) {
            const parts = value.split(",");
            onDraftChange(parts.pop() || "");
            onChange(normalizeTags([...tags, ...parts]));
          } else onDraftChange(value);
        }}
        onSubmitEditing={commit}
      />
      <View style={s.row}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            title={tag}
            selected
            remove
            onPress={() => onChange(tags.filter((t) => t !== tag))}
          />
        ))}
        {!!draft.trim() && <Chip title="+ Add hook" onPress={commit} />}
      </View>
    </View>
  );
}
export function GroupPicker({
  selected,
  onChange,
  filter,
  onFilterChange,
}: {
  selected?: string[];
  onChange?: (ids: string[]) => void;
  filter?: string;
  onFilterChange?: (id: string) => void;
}) {
  const { data, saveGroup } = useLibrary();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const add = async () => {
    setBusy(true);
    setError("");
    try {
      const id = await saveGroup(name);
      onChange?.([...(selected || []), id]);
      setName("");
      setAdding(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ marginBottom: 24, gap: 10 }}>
      <Copy style={s.label}>
        {filter !== undefined ? "Group" : "Groups · optional"}
      </Copy>
      <View style={s.row}>
        {filter !== undefined ? (
          <>
            <Chip
              title="All"
              selected={filter === "ALL"}
              onPress={() => onFilterChange?.("ALL")}
            />
            <Chip
              title="None"
              selected={filter === "NONE"}
              onPress={() => onFilterChange?.("NONE")}
            />
          </>
        ) : (
          <Chip
            title="None"
            selected={!selected?.length}
            onPress={() => onChange?.([])}
          />
        )}
        {[...data.groups]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((g) => (
            <Chip
              key={g.id}
              title={g.name}
              selected={
                filter !== undefined
                  ? filter === g.id
                  : selected?.includes(g.id)
              }
              onPress={() =>
                filter !== undefined
                  ? onFilterChange?.(g.id)
                  : onChange?.(
                      selected?.includes(g.id)
                        ? selected.filter((id) => id !== g.id)
                        : [...(selected || []), g.id],
                    )
              }
            />
          ))}
        {filter === undefined && (
          <Chip title="+ New group" onPress={() => setAdding(!adding)} />
        )}
      </View>
      {adding && (
        <View>
          <Field
            label="New group name"
            value={name}
            maxLength={100}
            onChangeText={setName}
            onSubmitEditing={add}
          />
          <ErrorText message={error} />
          <Button
            title="Create group"
            onPress={add}
            disabled={!name.trim()}
            busy={busy}
          />
        </View>
      )}
    </View>
  );
}
