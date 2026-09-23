import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLibrary } from "../contexts/LibraryContext";
import { Person } from "../types";
import { clueFor, gamePool, shuffle } from "../services/library";
import { Button, Copy, Empty, Panel, Screen, useTheme } from "../components/ui";
import { GroupPicker } from "../components/EntryFields";
export default function GameScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Game">) {
  const { data } = useLibrary();
  const t = useTheme();
  const [group, setGroup] = useState("ALL");
  const [round, setRound] = useState<Person[]>([]);
  const [clues, setClues] = useState<Person[]>([]);
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [solved, setSolved] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);
  const pool = gamePool(
    data.people.filter(
      (p) =>
        group === "ALL" ||
        (group === "NONE" ? !p.groupIds.length : p.groupIds.includes(group)),
    ),
  );
  const start = () => {
    const next = shuffle(pool).slice(0, 5);
    setRound(next);
    setClues(shuffle(next));
    setSolved([]);
    setLeft("");
    setRight("");
    setFeedback("");
    setAttempts(0);
  };
  const select = (side: "name" | "clue", id: string) => {
    const a = side === "name" ? id : left;
    const b = side === "clue" ? id : right;
    setLeft(a);
    setRight(b);
    setFeedback("");
    if (a && b) {
      setAttempts((n) => n + 1);
      if (a === b) {
        setSolved((s) => [...s, a]);
        setFeedback("That’s the one!");
      } else setFeedback("Not quite. Try another match.");
      setLeft("");
      setRight("");
    }
  };
  const finished = round.length > 0 && solved.length === round.length;
  const card = (p: Person, side: "name" | "clue") => {
    const done = solved.includes(p.id);
    const selected = (side === "name" ? left : right) === p.id;
    return (
      <Pressable
        key={p.id}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: done }}
        accessibilityLabel={`${side === "name" ? p.fullName : clueFor(p)}${done ? ", matched" : ""}`}
        disabled={done}
        onPress={() => select(side, p.id)}
        style={{
          padding: 14,
          minHeight: 84,
          borderRadius: 14,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? t.primary : t.line,
          backgroundColor: done || selected ? t.tint : t.surface,
          opacity: done ? 0.6 : 1,
        }}
      >
        <Copy
          style={{ fontSize: 15, fontWeight: side === "name" ? "700" : "400" }}
        >
          {done ? "✓ " : ""}
          {side === "name" ? p.fullName : clueFor(p)}
        </Copy>
      </Pressable>
    );
  };
  return (
    <Screen title="Name Game" subtitle="A little practice for your next hello.">
      {!round.length ? (
        <>
          <GroupPicker filter={group} onFilterChange={setGroup} />
          <Panel>
            <Copy style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
              Put names to clues.
            </Copy>
            <Copy muted>
              Tap a name, then its matching memory hook or note. Each round has
              up to five pairs.
            </Copy>
            <Copy muted style={{ marginTop: 12 }}>
              {pool.length} names ready to play. People need a distinct name and
              clue to make a fair match.
            </Copy>
          </Panel>
          {pool.length < 2 ? (
            <>
              <Empty
                icon="shuffle"
                title="A couple more clues…"
                message="Add at least two people with different names and memory hooks or notes to play in this group."
              />
              <Button
                secondary
                title="All Names"
                onPress={() => navigation.navigate("AllNames", {})}
              />
            </>
          ) : (
            <Button title="Let’s play" icon="play" onPress={start} />
          )}
        </>
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Copy style={{ fontWeight: "700" }}>
              {solved.length} / {round.length} matched
            </Copy>
            <Copy muted>{attempts} attempts</Copy>
          </View>
          <Copy
            accessibilityLiveRegion="polite"
            style={{
              color: feedback.startsWith("Not") ? t.accent : t.primary,
              minHeight: 30,
              marginBottom: 12,
            }}
          >
            {feedback || "Choose a name and a clue, in either order."}
          </Copy>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, gap: 10 }}>
              <Copy muted style={{ fontSize: 12, letterSpacing: 1 }}>
                NAMES
              </Copy>
              {round.map((p) => card(p, "name"))}
            </View>
            <View style={{ flex: 1, gap: 10 }}>
              <Copy muted style={{ fontSize: 12, letterSpacing: 1 }}>
                HOOKS & NOTES
              </Copy>
              {clues.map((p) => card(p, "clue"))}
            </View>
          </View>
          {finished && (
            <Panel style={{ marginTop: 24 }}>
              <Copy
                style={{ fontSize: 23, fontWeight: "700", marginBottom: 8 }}
              >
                Look at you, remembering!
              </Copy>
              <Copy muted style={{ marginBottom: 18 }}>
                All {round.length} pairs matched in {attempts} attempts.
              </Copy>
              <Button title="Play another round" onPress={start} />
            </Panel>
          )}
          <View style={{ marginTop: 20, gap: 10 }}>
            <Button
              secondary
              title="Choose another group"
              onPress={() => setRound([])}
            />
            <Button
              secondary
              title="Back to Home"
              onPress={() => navigation.popToTop()}
            />
          </View>
        </>
      )}
    </Screen>
  );
}
