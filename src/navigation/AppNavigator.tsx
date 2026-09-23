import React from "react";
import { Pressable } from "react-native";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import AddNameScreen from "../screens/AddNameScreen";
import RecallScreen from "../screens/RecallScreen";
import AllNamesScreen from "../screens/AllNamesScreen";
import GroupsScreen from "../screens/GroupsScreen";
import PersonScreen from "../screens/PersonScreen";
import GameScreen from "../screens/GameScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { Icon, useTheme } from "../components/ui";
export type RootStackParamList = {
  Home: { savedName?: string } | undefined;
  AddName: { id?: string };
  Recall: undefined;
  AllNames: { groupId?: string };
  Groups: { groupId?: string } | undefined;
  Person: { id: string };
  Game: undefined;
  Settings: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();
export default function AppNavigator() {
  const t = useTheme();
  const dark = useColorScheme() === "dark";
  return (
    <NavigationContainer
      theme={{
        ...(dark ? DarkTheme : DefaultTheme),
        colors: {
          ...(dark ? DarkTheme : DefaultTheme).colors,
          background: t.bg,
          card: t.bg,
          text: t.ink,
          primary: t.primary,
          border: t.line,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: t.ink,
          headerStyle: { backgroundColor: t.bg },
          headerTitleStyle: { fontWeight: "700" },
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: "Name2Face",
            headerRight: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Settings"
                hitSlop={12}
                onPress={() => navigation.navigate("Settings")}
                style={{ padding: 10 }}
              >
                <Icon name="settings" size={21} />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="AddName"
          component={AddNameScreen}
          options={({ route }) => ({
            title: route.params.id ? "Edit Name" : "Add a Name",
          })}
        />
        <Stack.Screen
          name="Recall"
          component={RecallScreen}
          options={{ title: "Recall a Name" }}
        />
        <Stack.Screen
          name="AllNames"
          component={AllNamesScreen}
          options={{ title: "All Names" }}
        />
        <Stack.Screen
          name="Groups"
          component={GroupsScreen}
          options={{ title: "All Groups" }}
        />
        <Stack.Screen
          name="Person"
          component={PersonScreen}
          options={{ title: "A familiar face" }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: "Name Game" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
