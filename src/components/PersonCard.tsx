import React from "react";
import { Pressable, View } from "react-native";
import { Person } from "../types";
import { useLibrary } from "../contexts/LibraryContext";
import { Copy, Icon, Panel, useTheme } from "./ui";
export function PersonCard({
  person,
  onPress,
}: {
  person: Person;
  onPress: () => void;
}) {
  const { data } = useLibrary();
  const t = useTheme();
  const groups = data.groups
    .filter((g) => person.groupIds.includes(g.id))
    .map((g) => g.name)
    .join(" · ");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${person.fullName}`}
      onPress={onPress}
    >
      <Panel>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              backgroundColor: t.tint,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Copy style={{ fontSize: 20, fontWeight: "700" }}>
              {person.fullName.charAt(0).toUpperCase()}
            </Copy>
          </View>
          <View style={{ flex: 1 }}>
            <Copy style={{ fontSize: 19, fontWeight: "700" }}>
              {person.fullName}
            </Copy>
            <Copy muted style={{ fontSize: 13 }}>
              {groups || "No group"}
            </Copy>
          </View>
          <Icon name="chevron-right" size={18} />
        </View>
        {person.tags.length > 0 && (
          <Copy style={{ color: t.primary, marginTop: 14, fontSize: 14 }}>
            {person.tags.join(" · ")}
          </Copy>
        )}
        {!!person.notes && (
          <Copy muted numberOfLines={2} style={{ fontSize: 14, marginTop: 6 }}>
            {person.notes}
          </Copy>
        )}
      </Panel>
    </Pressable>
  );
}
