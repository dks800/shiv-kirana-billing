import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { AppSettings } from "@/types/settings.types";
import { db } from "@/lib/firebase/config";
import { fallbackSettings, mergeSettings } from "@/lib/settings-runtime";

const SETTINGS_DOC_ID = "appSettings";

export const defaultSettings: AppSettings = fallbackSettings;

const settingsRef = () => doc(db, "settings", SETTINGS_DOC_ID);

export async function getSettings(): Promise<AppSettings> {
  const ref = settingsRef();

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await saveSettings(defaultSettings);
    return defaultSettings;
  }

  return mergeSettings(snap.data() as Partial<AppSettings>);
}

export async function saveSettings(settings: AppSettings) {
  const ref = settingsRef();

  await setDoc(
    ref,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToSettings(
  onSettings: (settings: AppSettings) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    settingsRef(),
    async (snap) => {
      if (!snap.exists()) {
        await saveSettings(defaultSettings);
        onSettings(defaultSettings);
        return;
      }

      onSettings(mergeSettings(snap.data() as Partial<AppSettings>));
    },
    (error) => {
      onError?.(error);
    },
  );
}
