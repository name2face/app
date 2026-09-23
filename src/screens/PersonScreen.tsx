import React, { useState } from "react";
import { View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import {
  Button,
  Chip,
  Copy,
  Empty,
  ErrorText,
  Panel,
  Screen,
  s,
  useConfirm,
} from "../components/ui";
export default function PersonScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Person">) {
  const { data, deletePerson } = useLibrary();
  const ask = useConfirm();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const p = data.people.find((p) => p.id === route.params.id);
  if (!p)
    return (
      <Screen>
        <Empty
          title="Name no longer available"
          message="This entry may have been deleted or replaced by a backup."
        />
      </Screen>
    );
  const remove = async () => {
    if (
      (await ask({
        title: `Delete ${p.fullName}?`,
        message: "This removes their name, hooks, and notes from this device.",
        options: [{ label: "Delete person", value: "yes", danger: true }],
      })) !== "yes"
    )
      return;
    setBusy(true);
    try {
      await deletePerson(p.id);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title={p.fullName}
      subtitle={`Added ${new Date(p.createdAt).toLocaleDateString()}`}
    >
      <Panel>
        <Copy style={s.label}>Groups</Copy>
        <View style={[s.row, { marginTop: 12 }]}>
          {data.groups
            .filter((g) => p.groupIds.includes(g.id))
            .map((g) => (
              <Chip
                key={g.id}
                title={g.name}
                selected
                onPress={() =>
                  navigation.navigate("AllNames", { groupId: g.id })
                }
              />
            ))}
          {!p.groupIds.length && <Copy muted>No group assigned</Copy>}
        </View>
      </Panel>
      <Panel>
        <Copy style={s.label}>Memory hooks</Copy>
        <Copy style={{ marginTop: 12 }}>
          {p.tags.join(" · ") || "No hooks added yet."}
        </Copy>
      </Panel>
      <Panel>
        <Copy style={s.label}>Notes & Reminders</Copy>
        <Copy selectable style={{ marginTop: 12 }}>
          {p.notes || "No notes added yet."}
        </Copy>
      </Panel>
      <ErrorText message={error} />
      <View style={{ gap: 12 }}>
        <Button
          title="Edit details"
          icon="edit-2"
          onPress={() => navigation.navigate("AddName", { id: p.id })}
        />
        <Button
          secondary
          danger
          title="Delete person"
          onPress={remove}
          busy={busy}
        />
      </View>
    </Screen>
  );
}
