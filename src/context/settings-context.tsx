"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultSettings,
  getSettings,
  saveSettings,
  subscribeToSettings,
} from "@/services/settings.service";
import { mergeSettings, setActiveSettings } from "@/lib/settings-runtime";
import { AppSettings, MutableAppSettings } from "@/types/settings.types";
import { useTheme } from "@/context/theme-context";

type SettingsUpdate = Partial<MutableAppSettings>;

type SettingsContextType = {
  settings: AppSettings;
  loading: boolean;
  reloadSettings: () => Promise<AppSettings>;
  updateSettings: (updates: SettingsUpdate) => Promise<AppSettings>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  const applySettings = useCallback(
    (nextSettings: AppSettings) => {
      setActiveSettings(nextSettings);
      setSettings(nextSettings);
      setTheme(nextSettings.preferences.theme || "light");
      return nextSettings;
    },
    [setTheme],
  );

  const reloadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const nextSettings = await getSettings();
      return applySettings(nextSettings);
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  const updateSettings = useCallback(
    async (updates: SettingsUpdate) => {
      await saveSettings(updates);
      const nextSettings = mergeSettings({
        ...settings,
        ...updates,
        businessProfile: settings.businessProfile,
      });

      return applySettings(nextSettings);
    },
    [applySettings, settings],
  );

  useEffect(() => {
    const unsubscribe = subscribeToSettings(
      (nextSettings) => {
        applySettings(nextSettings);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to settings:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [applySettings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      reloadSettings,
      updateSettings,
    }),
    [settings, loading, reloadSettings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}
