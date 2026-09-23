import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import { Copy, Icon, Panel, Screen, useTheme } from "../components/ui";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
export default function HomeScreen({ navigation, route }: Props) {
  const { data } = useLibrary();
  const t = useTheme();
  useEffect(() => {
    if (!route.params?.savedName) return;
    const timer = setTimeout(
      () => navigation.setParams({ savedName: undefined }),
      4500,
    );
    return () => clearTimeout(timer);
  }, [route.params?.savedName]);
  const actions = [
    {
      title: "Add a Name",
      detail: "Make a new connection.",
      icon: "user-plus" as const,
      action: () => navigation.navigate("AddName", {}),
    },
    {
      title: "Recall a Name",
      detail: "Start with a little clue.",
      icon: "search" as const,
      action: () => navigation.navigate("Recall"),
    },
    {
      title: "All Names",
      detail: `${data.people.length} ${data.people.length === 1 ? "person" : "people"} to remember`,
      icon: "users" as const,
      action: () => navigation.navigate("AllNames", {}),
    },
    {
      title: "All Groups",
      detail: `${data.groups.length} circles in your life`,
      icon: "grid" as const,
      action: () => navigation.navigate("Groups"),
    },
  ];
  return (
    <Screen>
      {!!route.params?.savedName && (
        <Panel style={{ backgroundColor: t.tint }}>
          <Copy accessibilityLiveRegion="polite">
            ✓ {route.params.savedName} saved.
          </Copy>
        </Panel>
      )}
      <View style={{ marginTop: 10, marginBottom: 30 }}>
        <Copy
          style={{
            color: t.accent,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          A LITTLE HELP REMEMBERING
        </Copy>
        <Copy
          style={{
            fontSize: 37,
            lineHeight: 44,
            fontWeight: "700",
            letterSpacing: -1.3,
          }}
        >
          Familiar faces.{"\n"}Remembered names.
        </Copy>
        <Copy muted style={{ marginTop: 12, maxWidth: 410 }}>
          Keep the little details that make your connections personal.
        </Copy>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        {actions.map((a) => (
          <Pressable
            key={a.title}
            accessibilityRole="button"
            onPress={a.action}
            style={({ pressed }) => ({
              width: "46%",
              flexGrow: 1,
              padding: 20,
              minHeight: 171,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: t.line,
              backgroundColor: t.surface,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              style={{
                backgroundColor: t.tint,
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Icon name={a.icon} size={23} />
            </View>
            <Copy style={{ fontWeight: "700", fontSize: 18, lineHeight: 24 }}>
              {a.title}
            </Copy>
            <Copy muted style={{ fontSize: 13, lineHeight: 20, marginTop: 5 }}>
              {a.detail}
            </Copy>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("Game")}
        style={{ marginTop: 16 }}
      >
        <Panel
          style={{
            backgroundColor: t.accentTint,
            borderColor: t.accentTint,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Icon name="shuffle" color={t.accent} size={27} />
          <View style={{ flex: 1 }}>
            <Copy style={{ fontSize: 19, fontWeight: "700", color: t.accent }}>
              Name Game
            </Copy>
            <Copy style={{ color: t.accent, fontSize: 14 }}>
              A little practice goes a long way.
            </Copy>
          </View>
          <Icon name="arrow-right" color={t.accent} size={19} />
        </Panel>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginTop: 12,
        }}
      >
        <Icon name="lock" size={14} />
        <Copy muted style={{ fontSize: 12 }}>
          Saved on this device. Yours to keep.
        </Copy>
      </View>
    </Screen>
  );
}
