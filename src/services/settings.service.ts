import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { AppSettings, MutableAppSettings } from "@/types/settings.types";
import { db } from "@/lib/firebase/config";
import { DEFAULT_SETTINGS } from "@/lib/settings-constants";
import { mergeSettings } from "@/lib/settings-runtime";

const SETTINGS_DOC_ID = "appSettings";
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const defaultSettings: AppSettings = DEFAULT_SETTINGS;

const settingsRef = () => doc(db, "settings", SETTINGS_DOC_ID);

type SettingsUpdate = Partial<MutableAppSettings>;

function assertCompleteBankAccount(
  bankAccount: MutableAppSettings["bankAccount"],
) {
  const nextBankAccount = {
    bankName: bankAccount.bankName.trim(),
    accountNumber: bankAccount.accountNumber.trim(),
    ifscCode: bankAccount.ifscCode.trim().toUpperCase(),
    branch: bankAccount.branch.trim(),
  };

  if (!nextBankAccount.bankName) {
    throw new Error("Bank name is required.");
  }

  if (!nextBankAccount.accountNumber) {
    throw new Error("Account number is required.");
  }

  if (!nextBankAccount.ifscCode) {
    throw new Error("IFSC code is required.");
  }

  if (!IFSC_PATTERN.test(nextBankAccount.ifscCode)) {
    throw new Error("Enter a valid IFSC code, for example SBIN0001234.");
  }

  if (!nextBankAccount.branch) {
    throw new Error("Branch is required.");
  }

  return nextBankAccount;
}

function buildWritableSettingsUpdate(
  updates: SettingsUpdate,
): SettingsUpdate {
  const payload: SettingsUpdate = {};

  if (updates.pdf) {
    payload.pdf = {
      ...DEFAULT_SETTINGS.pdf,
      ...updates.pdf,
    };
  }

  if (updates.preferences) {
    payload.preferences = {
      ...DEFAULT_SETTINGS.preferences,
      ...updates.preferences,
    };
  }

  if (updates.bankAccount) {
    payload.bankAccount = assertCompleteBankAccount(updates.bankAccount);
  }

  return payload;
}

export async function getSettings(): Promise<AppSettings> {
  const ref = settingsRef();

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.warn(
      "[settings] Missing settings/appSettings document. Returning read-only fallback without writing defaults.",
    );
    return defaultSettings;
  }

  return mergeSettings(snap.data() as Partial<AppSettings>);
}

export async function saveSettings(updates: SettingsUpdate) {
  const ref = settingsRef();
  const payload = buildWritableSettingsUpdate(updates);

  await setDoc(
    ref,
    {
      ...payload,
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
        console.warn(
          "[settings] Missing settings/appSettings document in subscription. Returning read-only fallback without writing defaults.",
        );
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
