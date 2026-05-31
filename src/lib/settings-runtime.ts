import { AppSettings } from "@/types/settings.types";

export const fallbackSettings: AppSettings = {
  general: {
    shopName: "Shiv Kirana & Provision Stores",
  },

  businessProfile: {
    businessName: "",
    proprietorName: "",
    gstin: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    logoUrl: "",
  },

  pdf: {
    showGSTSummary: true,
    showAmountInWords: true,
  },

  preferences: {
    theme: "light",
    dateFormat: "DD/MM/YYYY",
  },
};

let activeSettings: AppSettings = fallbackSettings;

export function mergeSettings(settings?: Partial<AppSettings> | null): AppSettings {
  return {
    ...fallbackSettings,
    ...settings,
    general: {
      ...fallbackSettings.general,
      ...settings?.general,
    },
    businessProfile: {
      ...fallbackSettings.businessProfile,
      ...settings?.businessProfile,
    },
    pdf: {
      ...fallbackSettings.pdf,
      ...settings?.pdf,
    },
    preferences: {
      ...fallbackSettings.preferences,
      ...settings?.preferences,
    },
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
