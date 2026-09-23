import React, { createContext, useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const light = {
  bg: "#F6F5F0",
  surface: "#FFFFFF",
  ink: "#183C36",
  muted: "#63736D",
  line: "#DDE3DC",
  primary: "#286655",
  tint: "#E8F0E7",
  accent: "#A04B2B",
  accentTint: "#F8E8DD",
  danger: "#B4323F",
};
const dark = {
  bg: "#121D1A",
  surface: "#1D2B26",
  ink: "#EDF4EC",
  muted: "#A9BBB1",
  line: "#38483F",
  primary: "#9BCFB5",
  tint: "#2A4035",
  accent: "#F0B18F",
  accentTint: "#423026",
  danger: "#FFA0AA",
};
export const useTheme = () => (useColorScheme() === "dark" ? dark : light);
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
}) {
  const t = useTheme();
  return <Feather name={name} size={size} color={color || t.primary} />;
}
export function Copy({
  children,
  muted = false,
  style,
  ...props
}: React.ComponentProps<typeof Text> & { muted?: boolean }) {
  const t = useTheme();
  return (
    <Text
      {...props}
      style={[
        { color: muted ? t.muted : t.ink, fontSize: 16, lineHeight: 24 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const content = (
    <>
      {title && (
        <View style={{ marginBottom: 26 }}>
          <Copy style={s.title}>{title}</Copy>
          {subtitle && (
            <Copy muted style={{ marginTop: 8 }}>
              {subtitle}
            </Copy>
          )}
        </View>
      )}
      {children}
    </>
  );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={96}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.page,
            { paddingBottom: Math.max(32, insets.bottom + 20) },
          ]}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[s.page, { flex: 1 }]}>{content}</View>
      )}
    </KeyboardAvoidingView>
  );
}
export function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.ComponentProps<typeof View>["style"];
}) {
  const t = useTheme();
  return (
    <View
      style={[
        s.panel,
        { backgroundColor: t.surface, borderColor: t.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary,
  danger,
  disabled,
  busy,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  busy?: boolean;
  icon?: React.ComponentProps<typeof Feather>["name"];
}) {
  const t = useTheme();
  const fg = secondary ? (danger ? t.danger : t.primary) : t.bg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary ? t.tint : danger ? t.danger : t.primary,
          opacity: disabled || busy ? 0.45 : pressed ? 0.75 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : (
        icon && <Icon name={icon} color={fg} size={18} />
      )}
      <Text
        style={{
          color: fg,
          fontSize: 16,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 7, marginBottom: 18 }}>
      <Copy style={s.label}>{label}</Copy>
      {hint && (
        <Copy muted style={{ fontSize: 13, lineHeight: 19 }}>
          {hint}
        </Copy>
      )}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.muted}
        {...props}
        style={[
          s.input,
          { color: t.ink, backgroundColor: t.surface, borderColor: t.line },
          props.multiline && { minHeight: 110, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Chip({
  title,
  selected,
  onPress,
  remove,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
  remove?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={remove ? `Remove ${title}` : title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        s.chip,
        {
          borderColor: selected ? t.primary : t.line,
          backgroundColor: selected ? t.tint : t.surface,
        },
      ]}
    >
      <Copy style={{ fontSize: 14, color: selected ? t.primary : t.muted }}>
        {title}
        {remove ? " ×" : ""}
      </Copy>
    </Pressable>
  );
}
export function Empty({
  icon = "users",
  title,
  message,
}: {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  message: string;
}) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 36, gap: 12 }}>
      <Icon name={icon} size={32} />
      <Copy style={{ fontSize: 20, fontWeight: "700", textAlign: "center" }}>
        {title}
      </Copy>
      <Copy muted style={{ textAlign: "center", maxWidth: 340 }}>
        {message}
      </Copy>
    </View>
  );
}
export function ErrorText({ message }: { message: string }) {
  const t = useTheme();
  return message ? (
    <Copy
      accessibilityRole="alert"
      style={{ color: t.danger, marginBottom: 16 }}
    >
      {message}
    </Copy>
  ) : null;
}

type Question = {
  title: string;
  message: string;
  options?: { label: string; value: string; danger?: boolean }[];
};
const ConfirmContext = createContext<(q: Question) => Promise<string>>(
  async () => "cancel",
);
export const useConfirm = () => useContext(ConfirmContext);
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const resolve = useRef<(value: string) => void>(() => {});
  const t = useTheme();
  const answer = (value: string) => {
    setQuestion(null);
    resolve.current(value);
  };
  return (
    <ConfirmContext.Provider
      value={(q) =>
        new Promise((done) => {
          resolve.current = done;
          setQuestion(q);
        })
      }
    >
      {children}
      <Modal
        visible={!!question}
        transparent
        animationType="fade"
        onRequestClose={() => answer("cancel")}
      >
        <View style={s.scrim}>
          <View
            accessibilityViewIsModal
            style={[s.dialog, { backgroundColor: t.surface }]}
          >
            <ScrollView>
              <Copy style={{ fontSize: 23, lineHeight: 30, fontWeight: "700" }}>
                {question?.title}
              </Copy>
              <Copy muted style={{ marginVertical: 18 }}>
                {question?.message}
              </Copy>
              <View style={{ gap: 10 }}>
                {(
                  question?.options || [{ label: "Continue", value: "yes" }]
                ).map((o) => (
                  <Button
                    key={o.value}
                    title={o.label}
                    danger={o.danger}
                    onPress={() => answer(o.value)}
                  />
                ))}
                <Button
                  secondary
                  title="Cancel"
                  onPress={() => answer("cancel")}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}
export const s = StyleSheet.create({
  page: { width: "100%", maxWidth: 760, alignSelf: "center", padding: 24 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: "700", letterSpacing: -1 },
  label: { fontSize: 15, fontWeight: "600" },
  panel: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    minHeight: 50,
  },
  button: {
    minHeight: 50,
    borderRadius: 13,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  chip: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  scrim: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000088",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "85%",
    borderRadius: 22,
    padding: 24,
  },
});
