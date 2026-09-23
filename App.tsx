import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LibraryProvider, useLibrary } from "./src/contexts/LibraryContext";
import { Button, ConfirmProvider, Copy, useTheme } from "./src/components/ui";
import AppNavigator from "./src/navigation/AppNavigator";
function Content() {
  const { loading, error, retry } = useLibrary();
  const t = useTheme();
  if (loading || error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          justifyContent: "center",
          padding: 32,
          gap: 20,
        }}
      >
        {loading ? (
          <>
            <ActivityIndicator color={t.primary} />
            <Copy style={{ textAlign: "center" }}>
              Opening your local library…
            </Copy>
          </>
        ) : (
          <>
            <Copy style={{ fontSize: 24, fontWeight: "700" }}>
              Your library couldn’t be opened.
            </Copy>
            <Copy>{error}</Copy>
            <Copy muted>
              Your saved data has not been reset. Check that local storage is
              available, then try again.
            </Copy>
            <Button title="Try again" onPress={retry} />
          </>
        )}
      </View>
    );
  return <AppNavigator />;
}
export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <ConfirmProvider>
          <Content />
          <StatusBar style="auto" />
        </ConfirmProvider>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
