import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import { Button, Copy, Empty, Field, Screen } from "../components/ui";
import { GroupPicker, TagInput } from "../components/EntryFields";
import { PersonCard } from "../components/PersonCard";
import { hasFilters, searchPeople } from "../services/library";
export default function RecallScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Recall">) {
  const { data } = useLibrary();
  const [name, setName] = useState("");
  const [group, setGroup] = useState("ALL");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const filter = {
    name,
    group,
    notes,
    tags: [...tags, ...(draft.trim() ? [draft] : [])],
  };
  const active = hasFilters(filter);
  const results = useMemo(
    () => searchPeople(data.people, filter),
    [data.people, name, group, notes, tags, draft],
  );
  return (
    <Screen
      title="A clue is all it takes."
      subtitle="Fill in anything you remember. Each clue narrows the list."
    >
      <Field
        label="Name or partial name"
        placeholder="First name, last name, or a few letters"
        value={name}
        onChangeText={setName}
        maxLength={200}
      />
      <GroupPicker filter={group} onFilterChange={setGroup} />
      <TagInput
        search
        tags={tags}
        onChange={setTags}
        draft={draft}
        onDraftChange={setDraft}
      />
      <Field
        label="Notes & Reminders"
        placeholder="A pet’s name, a place, a conversation…"
        value={notes}
        onChangeText={setNotes}
        maxLength={10000}
      />
      {active && (
        <View style={{ marginBottom: 24 }}>
          <Button
            secondary
            title="Clear clues"
            onPress={() => {
              setName("");
              setGroup("ALL");
              setTags([]);
              setDraft("");
              setNotes("");
            }}
          />
        </View>
      )}
      {!active ? (
        <Empty
          icon="search"
          title="Who comes to mind?"
          message="Type a name, hook, or note above, or choose a group to find your people."
        />
      ) : (
        <>
          <Copy
            accessibilityLiveRegion="polite"
            style={{ fontWeight: "700", marginBottom: 14 }}
          >
            {results.length} {results.length === 1 ? "match" : "matches"}
          </Copy>
          {!results.length && (
            <Empty
              icon="search"
              title="No matches just yet"
              message="Try a shorter clue or remove a filter to widen your search."
            />
          )}
          {results.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              onPress={() => navigation.navigate("Person", { id: p.id })}
            />
          ))}
        </>
      )}
    </Screen>
  );
}
