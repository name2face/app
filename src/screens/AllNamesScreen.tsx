import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import { Button, Chip, Copy, Empty, Field, Screen, s } from "../components/ui";
import { PersonCard } from "../components/PersonCard";
import { alphabetic } from "../services/library";
export default function AllNamesScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "AllNames">) {
  const { data } = useLibrary();
  const [recent, setRecent] = useState(false);
  const [query, setQuery] = useState("");
  const group = data.groups.find((g) => g.id === route.params.groupId);
  const members = data.people.filter(
    (p) => !route.params.groupId || p.groupIds.includes(route.params.groupId),
  );
  const people = useMemo(
    () =>
      members
        .filter((p) =>
          `${p.fullName} ${p.tags.join(" ")} ${p.notes}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .sort(
          recent
            ? (a, b) => b.createdAt.localeCompare(a.createdAt)
            : alphabetic,
        ),
    [data, query, recent, route.params.groupId],
  );
  return (
    <Screen scroll={false}>
      <FlatList
        data={people}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Copy style={s.title}>{group?.name || "All Names"}</Copy>
            <Copy muted style={{ marginTop: 8, marginBottom: 24 }}>
              {members.length} saved {members.length === 1 ? "name" : "names"}
            </Copy>
            <Field
              label="Find in this list"
              placeholder="Search names or details"
              value={query}
              onChangeText={setQuery}
            />
            <View style={[s.row, { marginBottom: 20 }]}>
              <Chip
                title="A–Z"
                selected={!recent}
                onPress={() => setRecent(false)}
              />
              <Chip
                title="Recently added"
                selected={recent}
                onPress={() => setRecent(true)}
              />
            </View>
            {group && (
              <View style={{ marginBottom: 18 }}>
                <Button
                  secondary
                  title="Manage this group"
                  onPress={() =>
                    navigation.navigate("Groups", { groupId: group.id })
                  }
                />
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <>
            {!recent &&
              (index === 0 ||
                people[index - 1].fullName[0].toUpperCase() !==
                  item.fullName[0].toUpperCase()) && (
                <Copy muted style={{ marginBottom: 10, fontWeight: "700" }}>
                  {item.fullName[0].toUpperCase()}
                </Copy>
              )}
            <PersonCard
              person={item}
              onPress={() => navigation.navigate("Person", { id: item.id })}
            />
          </>
        )}
        ListEmptyComponent={
          <>
            <Empty
              title={query ? "No matching names" : "No names here yet"}
              message={
                query
                  ? "Try a different name or detail."
                  : group
                    ? "Add existing people using Manage this group, or create a new name."
                    : "Tap Add a Name to make your first connection."
              }
            />
            {!query && (
              <Button
                title="Add a Name"
                onPress={() => navigation.navigate("AddName", {})}
              />
            )}
          </>
        }
      />
    </Screen>
  );
}
