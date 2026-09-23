import React, { useState } from "react";
import { Platform, View } from "react-native";
import { getRandomValues } from "expo-crypto";
import { useLibrary } from "../contexts/LibraryContext";
import { emptyLibrary } from "../types";
import {
  Button,
  Copy,
  ErrorText,
  Field,
  Panel,
  Screen,
  useConfirm,
} from "../components/ui";
import { encryptBackup, decryptBackup } from "../services/backupCodec";
import { exportFile, importFile } from "../services/backupFiles";
export default function SettingsScreen() {
  const { data, replace } = useLibrary();
  const ask = useConfirm();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [wipe, setWipe] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const run = async (task: string, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(task);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e: any) {
      setError(e.message || "The operation could not be completed.");
    } finally {
      setBusy("");
    }
  };
  const backup = () =>
    run("backup", async () => {
      if (password !== repeat)
        throw new Error("The backup passwords do not match.");
      await exportFile(
        await encryptBackup(data, password, (length) =>
          getRandomValues(new Uint8Array(length)),
        ),
      );
      setMessage(
        Platform.OS === "web"
          ? "Encrypted backup downloaded. Keep it and your password somewhere safe."
          : "Backup prepared. Keep the saved file and your password somewhere safe.",
      );
      setPassword("");
      setRepeat("");
    });
  const restore = () =>
    run("restore", async () => {
      const raw = await importFile();
      if (raw === null) return;
      const next = await decryptBackup(raw, password);
      if (
        (await ask({
          title: "Replace this library?",
          message: `This backup contains ${next.people.length} names and ${next.groups.length} groups. Restoring replaces all ${data.people.length} current names and all groups. This cannot be undone.`,
          options: [{ label: "Replace & restore", value: "yes", danger: true }],
        })) !== "yes"
      )
        return;
      await replace(next);
      setMessage("Your backup has been restored.");
      setPassword("");
      setRepeat("");
    });
  const reset = () =>
    run("reset", async () => {
      if (wipe !== "DELETE") return;
      if (
        (await ask({
          title: "Delete all data?",
          message:
            "Every name, memory hook, note, and group on this device will be removed. Export a backup first if you want to keep a copy.",
          options: [
            { label: "Yes, delete everything", value: "yes", danger: true },
          ],
        })) !== "yes"
      )
        return;
      await replace(emptyLibrary());
      setWipe("");
      setMessage("All local names and groups have been deleted.");
    });
  return (
    <Screen
      title="Your data. Your choice."
      subtitle="A few simple controls to keep your library in your hands."
    >
      <Panel>
        <Copy style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
          Made to stay with you
        </Copy>
        <Copy muted>
          Names, hooks, notes, and groups are stored on this{" "}
          {Platform.OS === "web" ? "browser" : "device"}. There is no account,
          cloud sync, or app analytics. You choose where exported backups go.
        </Copy>
        <Copy muted style={{ marginTop: 10 }}>
          {Platform.OS === "web"
            ? "Clearing browser data removes your library. Use a backup before switching browsers or devices."
            : "Uninstalling the app or losing this device can remove your library. Your operating system may include app data in its own device backups."}
        </Copy>
      </Panel>
      <Panel>
        <Copy style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
          Backup & restore
        </Copy>
        <Copy muted style={{ marginBottom: 20 }}>
          Backups are encrypted with your password. We cannot recover a
          forgotten password. Restoring replaces your current library.
        </Copy>
        <Field
          label="Backup password"
          hint="At least 10 characters for a new backup. For restore, enter the original password."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
        <Field
          label="Confirm password for export"
          value={repeat}
          onChangeText={setRepeat}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
        <View style={{ gap: 12 }}>
          <Button
            title="Export encrypted backup"
            icon="download"
            onPress={backup}
            disabled={!!busy || password.length < 10 || password !== repeat}
            busy={busy === "backup"}
          />
          <Button
            secondary
            title="Choose backup to restore"
            icon="upload"
            onPress={restore}
            disabled={!!busy || !password}
            busy={busy === "restore"}
          />
        </View>
      </Panel>
      <ErrorText message={error} />
      {!!message && (
        <Copy accessibilityLiveRegion="polite" style={{ marginBottom: 20 }}>
          {message}
        </Copy>
      )}
      <Panel>
        <Copy style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
          Start fresh
        </Copy>
        <Copy muted style={{ marginBottom: 20 }}>
          Remove all names and groups from this app. Your exported backup files
          will not be deleted.
        </Copy>
        <Field
          label="Type DELETE to enable reset"
          value={wipe}
          onChangeText={setWipe}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!busy}
        />
        <Button
          secondary
          danger
          title="Delete all data"
          onPress={reset}
          disabled={!!busy || wipe !== "DELETE"}
          busy={busy === "reset"}
        />
      </Panel>
      <Copy muted style={{ textAlign: "center", fontSize: 12 }}>
        Name2Face · A little help remembering
      </Copy>
    </Screen>
  );
}
