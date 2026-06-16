import { AppSettings } from "@/types/settings.types";
import { DEFAULT_SETTINGS } from "@/lib/settings-constants";

export const fallbackSettings: AppSettings = DEFAULT_SETTINGS;

let activeSettings: AppSettings = fallbackSettings;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mergeSection<T extends Record<string, unknown>>(
  fallback: T,
  section?: Partial<T> | null,
): T {
  if (!section) {
    return fallback;
  }

  const result = { ...fallback };

  for (const key of Object.keys(fallback) as Array<keyof T>) {
    const nextValue = section[key];

    if (nextValue === undefined || nextValue === null) {
      continue;
    }

    if (typeof fallback[key] === "string") {
      result[key] = (isNonEmptyString(nextValue)
        ? nextValue.trim()
        : fallback[key]) as T[typeof key];
      continue;
    }

    if (typeof fallback[key] === "boolean") {
      result[key] = (typeof nextValue === "boolean"
        ? nextValue
        : fallback[key]) as T[typeof key];
      continue;
    }

    result[key] = nextValue as T[typeof key];
  }

  return result;
}

export function mergeSettings(settings?: Partial<AppSettings> | null): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    general: mergeSection(DEFAULT_SETTINGS.general, settings?.general),
    businessProfile: mergeSection(
      DEFAULT_SETTINGS.businessProfile,
      settings?.businessProfile,
    ),
    pdf: mergeSection(DEFAULT_SETTINGS.pdf, settings?.pdf),
    bankAccount: mergeSection(
      DEFAULT_SETTINGS.bankAccount,
      settings?.bankAccount,
    ),
    preferences: mergeSection(
      DEFAULT_SETTINGS.preferences,
      settings?.preferences,
    ),
  };
}

export function setActiveSettings(settings: AppSettings) {
  activeSettings = mergeSettings(settings);
}

export function getActiveSettings() {
  return activeSettings;
}

export function getActiveDateFormat() {
  return activeSettings.preferences.dateFormat || fallbackSettings.preferences.dateFormat;
}
