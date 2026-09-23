import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import {
  Button,
  Chip,
  Copy,
  Empty,
  ErrorText,
  Field,
  Icon,
  Panel,
  Screen,
  s,
  useConfirm,
  useTheme,
} from "../components/ui";
import { alphabetic } from "../services/library";
export default function GroupsScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Groups">) {
  const { data, saveGroup, deleteGroup } = useLibrary();
  const t = useTheme();
  const ask = useConfirm();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string>();
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const edit = (groupId?: string) => {
    setId(groupId);
    setName(data.groups.find((g) => g.id === groupId)?.name || "");
    setMembers(
      data.people
        .filter((p) => groupId && p.groupIds.includes(groupId))
        .map((p) => p.id),
    );
    setError("");
    setQuery("");
    setOpen(true);
  };
  useEffect(() => {
    if (route.params?.groupId) {
      edit(route.params.groupId);
      navigation.setParams({ groupId: undefined });
    }
  }, [route.params?.groupId]);
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await saveGroup(name, id, members);
      setOpen(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (groupId: string, groupName: string) => {
    if (
      (await ask({
        title: `Delete ${groupName}?`,
        message:
          "Only this group is removed. All names, notes, and other group memberships stay saved.",
        options: [{ label: "Delete group", value: "yes", danger: true }],
      })) !== "yes"
    )
      return;
    try {
      await deleteGroup(groupId);
    } catch (e: any) {
      setError(e.message);
    }
  };
  return (
    <Screen
      title="Your circles."
      subtitle="Organize names around the places and people in your life."
    >
      <View style={{ marginBottom: 24 }}>
        <Button title="Create a group" icon="plus" onPress={() => edit()} />
      </View>
      {!open && <ErrorText message={error} />}
      {!data.groups.length && (
        <Empty
          icon="grid"
          title="A place for every connection"
          message="Create a group like Work, Neighbors, or Book Club. A person can belong to more than one."
        />
      )}
      {[...data.groups]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((g) => (
          <Panel key={g.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${g.name}`}
              onPress={() => navigation.navigate("AllNames", { groupId: g.id })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Icon name="folder" />
              <View style={{ flex: 1 }}>
                <Copy style={{ fontSize: 20, fontWeight: "700" }}>
                  {g.name}
                </Copy>
                <Copy muted>
                  {data.people.filter((p) => p.groupIds.includes(g.id)).length}{" "}
                  names
                </Copy>
              </View>
              <Icon name="chevron-right" />
            </Pressable>
            <View style={s.row}>
              <Chip title="Edit & add members" onPress={() => edit(g.id)} />
              <Chip title="Delete group" onPress={() => remove(g.id, g.name)} />
            </View>
          </Panel>
        ))}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => !busy && setOpen(false)}
      >
        <View style={s.scrim}>
          <View
            accessibilityViewIsModal
            style={[s.dialog, { backgroundColor: t.bg }]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <Copy
                style={{ fontSize: 24, fontWeight: "700", marginBottom: 22 }}
              >
                {id ? "Edit group" : "A new circle"}
              </Copy>
              <Field
                label="Group name"
                value={name}
                onChangeText={setName}
                maxLength={100}
                placeholder="e.g. Book Club"
              />
              <Field
                label="Add existing names"
                value={query}
                onChangeText={setQuery}
                placeholder="Find a person"
              />
              <Copy muted style={{ marginBottom: 12 }}>
                {members.length} selected
              </Copy>
              <View style={[s.row, { marginBottom: 22 }]}>
                {[...data.people]
                  .sort(alphabetic)
                  .filter((p) =>
                    p.fullName.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((p) => (
                    <Chip
                      key={p.id}
                      title={p.fullName}
                      selected={members.includes(p.id)}
                      onPress={() =>
                        setMembers((m) =>
                          m.includes(p.id)
                            ? m.filter((id) => id !== p.id)
                            : [...m, p.id],
                        )
                      }
                    />
                  ))}
              </View>
              <ErrorText message={error} />
              <View style={{ gap: 10 }}>
                <Button
                  title="Save group"
                  disabled={!name.trim()}
                  busy={busy}
                  onPress={save}
                />
                <Button
                  secondary
                  title="Cancel"
                  disabled={busy}
                  onPress={() => setOpen(false)}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
