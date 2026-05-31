"use client";

import { useState } from "react";

import { AppSettings } from "@/types/settings.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { Loader } from "@/components/ui/loader";
import { useTheme } from "@/context/theme-context";
import { AlertTriangle } from "lucide-react";
import { useSettings } from "@/context/settings-context";

const hasSectionChanges = <T,>(current: T, applied: T) =>
  JSON.stringify(current) !== JSON.stringify(applied);

function ChangeNote({ show }: { show: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!show) return null;

  return (
    <p
      style={{
        alignItems: "center",
        backgroundColor: isDark ? "#4a3306" : "#fff2bf",
        border: `1px solid ${isDark ? "#8a6415" : "#d6a11d"}`,
        borderLeft: `4px solid ${isDark ? "#f0c45a" : "#b77900"}`,
        borderRadius: "0.5rem",
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
        color: isDark ? "#fff3c4" : "#3d2b00",
        display: "flex",
        fontSize: "0.875rem",
        fontWeight: 500,
        gap: "0.75rem",
        lineHeight: "1.25rem",
        marginTop: "1rem",
        padding: "0.5rem 0.75rem",
      }}
    >
      <AlertTriangle
        className="h-4 w-4 shrink-0"
        style={{ color: isDark ? "#f5d47a" : "#9a6700" }}
        aria-hidden="true"
      />
      Save settings to apply
    </p>
  );
}

export default function SettingsPage() {
  const {
    settings: activeSettings,
    loading,
    updateSettings,
  } = useSettings();

  if (loading) {
    return <Loader />;
  }

  return (
    <SettingsForm
      key={JSON.stringify(activeSettings)}
      activeSettings={activeSettings}
      updateSettings={updateSettings}
    />
  );
}

function SettingsForm({
  activeSettings,
  updateSettings,
}: {
  activeSettings: AppSettings;
  updateSettings: (nextSettings: AppSettings) => Promise<AppSettings>;
}) {
  const [settings, setSettings] = useState<AppSettings>(activeSettings);
  const [appliedSettings, setAppliedSettings] =
    useState<AppSettings>(activeSettings);

  const [saving, setSaving] = useState(false);
  const { setTheme } = useTheme();

  async function handleSave() {
    try {
      setSaving(true);
      const savedSettings = await updateSettings(settings);
      setSettings(savedSettings);
      setAppliedSettings(savedSettings);
      toast.success("Settings applied successfully!");
    } catch (error) {
      toast.error(
        `Failed to save settings - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground p-4 md:p-6">
        <p className="text-2xl font-bold my-2">Business Profile</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Business Name"
            value={settings.businessProfile.businessName}
            disabled={!!settings.businessProfile.businessName}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  businessName: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="Proprietor Name"
            value={settings.businessProfile.proprietorName}
            disabled={!!settings.businessProfile.proprietorName}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  proprietorName: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="GSTIN"
            value={settings.businessProfile.gstin}
            disabled={!!settings.businessProfile.gstin}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  gstin: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="Phone"
            value={settings.businessProfile.phone}
            disabled={!!settings.businessProfile.phone}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  phone: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="Email"
            value={settings.businessProfile.email}
            disabled={true}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  email: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="City"
            value={settings.businessProfile.city}
            disabled={!!settings.businessProfile.city}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  city: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="State"
            value={settings.businessProfile.state}
            disabled={!!settings.businessProfile.state}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  state: e.target.value,
                },
              })
            }
          />

          <Input
            placeholder="Pincode"
            value={settings.businessProfile.pincode}
            disabled={!!settings.businessProfile.pincode}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessProfile: {
                  ...settings.businessProfile,
                  pincode: e.target.value,
                },
              })
            }
          />
        </div>

        <Textarea
          className="mt-4"
          placeholder="Business Address"
          value={settings.businessProfile.address}
          disabled={!!settings.businessProfile.address}
          onChange={(e) =>
            setSettings({
              ...settings,
              businessProfile: {
                ...settings.businessProfile,
                address: e.target.value,
              },
            })
          }
        />
        <ChangeNote
          show={hasSectionChanges(
            settings.businessProfile,
            appliedSettings.businessProfile,
          )}
        />
      </div>

      {/* PDF */}

      <div className="rounded-xl border bg-card text-card-foreground p-4 md:p-6">
        <p className="text-2xl font-bold my-2">PDF Settings</p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.pdf.showGSTSummary}
            onChange={(e) =>
              setSettings({
                ...settings,
                pdf: {
                  ...settings.pdf,
                  showGSTSummary: e.target.checked,
                },
              })
            }
          />
          Show GST Summary
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.pdf.showAmountInWords}
            onChange={(e) =>
              setSettings({
                ...settings,
                pdf: {
                  ...settings.pdf,
                  showAmountInWords: e.target.checked,
                },
              })
            }
          />
          Show Amount In Words
        </label>
        <ChangeNote show={hasSectionChanges(settings.pdf, appliedSettings.pdf)} />
      </div>

      {/* PREFERENCES */}

      <div className="rounded-xl border bg-card text-card-foreground p-4 md:p-6">
        <p className="text-2xl font-bold my-2">App Settings</p>
        <div className="flex gap-4 flex-wrap items-center justify-start">
          <div>
            <Label>Theme</Label>

            <Select
              value={settings.preferences.theme}
              onValueChange={(value) => {
                // setSettings({
                //   ...settings,
                //   preferences: {
                //     ...settings.preferences,
                //     theme: value as "light" | "dark",
                //   },
                // });

                const theme = value as "light" | "dark";

                setSettings({
                  ...settings,
                  preferences: {
                    ...settings.preferences,
                    theme,
                  },
                });

                setTheme(theme);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date Format</Label>

            <Select
              value={settings.preferences.dateFormat}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  preferences: {
                    ...settings.preferences,
                    dateFormat: value!,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ChangeNote
          show={hasSectionChanges(
            settings.preferences,
            appliedSettings.preferences,
          )}
        />
      </div>

      {/* ABOUT */}

      <div className="rounded-xl border bg-card text-card-foreground p-4 md:p-6">
        <p className="text-2xl font-bold my-2">About App</p>
        <h2 className="font-semibold">Shiv Kirana ERP</h2>

        <p className="text-sm text-muted-foreground">Version 1.0.0</p>

        <p className="mt-2 text-sm">Developed by Murly</p>
      </div>

      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-primary px-4 py-2 text-primary-foreground cursor-pointer hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
