import React, { useState } from "react";
import { View } from "react-native";
import { randomUUID } from "expo-crypto";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import { Button, ErrorText, Field, Screen, useConfirm } from "../components/ui";
import { GroupPicker, TagInput } from "../components/EntryFields";
import { normalizeTags } from "../services/library";
type Props = NativeStackScreenProps<RootStackParamList, "AddName">;
export default function AddNameScreen({ navigation, route }: Props) {
  const { data, savePerson } = useLibrary();
  const ask = useConfirm();
  const person = data.people.find((p) => p.id === route.params.id);
  const [name, setName] = useState(person?.fullName || "");
  const [notes, setNotes] = useState(person?.notes || "");
  const [groups, setGroups] = useState(person?.groupIds || []);
  const [tags, setTags] = useState(person?.tags || []);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (busy || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const duplicates = data.people.filter(
        (p) =>
          p.id !== person?.id &&
          p.fullName.toLowerCase() === name.trim().toLowerCase(),
      );
      if (duplicates.length) {
        const choice = await ask({
          title: "A familiar name",
          message: `${name.trim()} already exists. Edit an existing profile or save this person separately?`,
          options: [
            ...duplicates.map((p) => ({
              label: `Edit existing · ${p.tags[0] || p.notes.slice(0, 35) || new Date(p.createdAt).toLocaleDateString()}`,
              value: p.id,
            })),
            {
              label: person ? "Save these changes" : "Save as a new person",
              value: "save",
            },
          ],
        });
        if (choice === "cancel") return;
        if (choice !== "save") {
          navigation.replace("AddName", { id: choice });
          return;
        }
      }
      const now = new Date().toISOString();
      await savePerson({
        id: person?.id || randomUUID(),
        fullName: name,
        notes: notes.trim(),
        tags: normalizeTags([...tags, draft]),
        groupIds: groups.filter((id) => data.groups.some((g) => g.id === id)),
        createdAt: person?.createdAt || now,
        updatedAt: now,
      });
      navigation.popTo("Home", { savedName: name.trim() });
    } catch (e: any) {
      setError(e.message || "Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title={person ? "Edit a name" : "Meet someone new?"}
      subtitle="A name is all you need. Add the details you want to remember."
    >
      <Field
        label="Full name"
        placeholder="e.g. Alex Morgan"
        value={name}
        maxLength={200}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <GroupPicker selected={groups} onChange={setGroups} />
      <TagInput
        tags={tags}
        onChange={setTags}
        draft={draft}
        onDraftChange={setDraft}
      />
      <Field
        label="Notes & Reminders"
        hint="Family, a conversation, a birthday—anything worth remembering."
        placeholder="Wife: Sarah. Dog: Max. We met at the coffee shop."
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={10000}
      />
      <ErrorText message={error} />
      <View style={{ marginTop: 8 }}>
        <Button
          title={person ? "Save changes" : "Save name"}
          icon="check"
          onPress={save}
          disabled={!name.trim()}
          busy={busy}
        />
      </View>
    </Screen>
  );
}
