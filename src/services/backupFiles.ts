import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { MAX_BACKUP_BYTES } from "./backupCodec";
export async function exportFile(content: string) {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("File sharing is not available on this device.");
  const file = new File(Paths.cache, `name2face-${Date.now()}.json`);
  try {
    file.write(content);
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      UTI: "public.json",
      dialogTitle: "Save your encrypted Name2Face backup",
    });
  } finally {
    if (file.exists) file.delete();
  }
}
export async function importFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "application/octet-stream"],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size || file.size || 0) > MAX_BACKUP_BYTES)
      throw new Error("The backup exceeds the 20 MB limit.");
    return await file.text();
  } finally {
    if (file.exists) file.delete();
  }
}
