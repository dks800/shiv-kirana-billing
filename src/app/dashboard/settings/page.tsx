"use client";

import { useState } from "react";

import { AppSettings, MutableAppSettings } from "@/types/settings.types";
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
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
type SettingsUpdate = Partial<MutableAppSettings>;
type BankAccountErrors = Partial<
  Record<keyof MutableAppSettings["bankAccount"], string>
>;

function validateBankAccount(bankAccount: MutableAppSettings["bankAccount"]) {
  const nextErrors: BankAccountErrors = {};

  if (!bankAccount.bankName.trim()) {
    nextErrors.bankName = "Bank name is required.";
  }

  if (!bankAccount.accountNumber.trim()) {
    nextErrors.accountNumber = "Account number is required.";
  }

  const ifscCode = bankAccount.ifscCode.trim().toUpperCase();

  if (!ifscCode) {
    nextErrors.ifscCode = "IFSC code is required.";
  } else if (!IFSC_PATTERN.test(ifscCode)) {
    nextErrors.ifscCode = "Enter a valid IFSC code, for example SBIN0001234.";
  }

  if (!bankAccount.branch.trim()) {
    nextErrors.branch = "Branch is required.";
  }

  return nextErrors;
}

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
  const { settings: activeSettings, loading, updateSettings } = useSettings();

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
  updateSettings: (updates: SettingsUpdate) => Promise<AppSettings>;
}) {
  const [settings, setSettings] = useState<MutableAppSettings>({
    bankAccount: activeSettings.bankAccount,
    pdf: activeSettings.pdf,
    preferences: activeSettings.preferences,
  });
  const [appliedSettings, setAppliedSettings] = useState<MutableAppSettings>({
    bankAccount: activeSettings.bankAccount,
    pdf: activeSettings.pdf,
    preferences: activeSettings.preferences,
  });
  const [bankAccountErrors, setBankAccountErrors] =
    useState<BankAccountErrors>({});
  const [saving, setSaving] = useState(false);
  const [savingBankAccount, setSavingBankAccount] = useState(false);
  const { setTheme } = useTheme();

  async function handleSave() {
    try {
      setSaving(true);
      const savedSettings = await updateSettings({
        pdf: settings.pdf,
        preferences: settings.preferences,
      });
      const nextMutableSettings = {
        bankAccount: settings.bankAccount,
        pdf: savedSettings.pdf,
        preferences: savedSettings.preferences,
      };
      setSettings(nextMutableSettings);
      setAppliedSettings({
        bankAccount: savedSettings.bankAccount,
        pdf: savedSettings.pdf,
        preferences: savedSettings.preferences,
      });
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

  async function handleSaveBankAccount() {
    const nextBankAccount = {
      bankName: settings.bankAccount.bankName.trim(),
      accountNumber: settings.bankAccount.accountNumber.trim(),
      ifscCode: settings.bankAccount.ifscCode.trim().toUpperCase(),
      branch: settings.bankAccount.branch.trim(),
    };
    const nextErrors = validateBankAccount(nextBankAccount);

    setBankAccountErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the bank account details before saving.");
      return;
    }

    try {
      setSavingBankAccount(true);
      const savedSettings = await updateSettings({
        bankAccount: nextBankAccount,
      });
      const nextMutableSettings = {
        bankAccount: savedSettings.bankAccount,
        pdf: savedSettings.pdf,
        preferences: savedSettings.preferences,
      };
      setSettings(nextMutableSettings);
      setAppliedSettings(nextMutableSettings);
      toast.success("Bank account information saved successfully!");
    } catch (error) {
      toast.error(
        `Failed to save bank account information - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setSavingBankAccount(false);
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
            value={activeSettings.businessProfile.businessName}
            disabled
          />

          <Input
            placeholder="Proprietor Name"
            value={activeSettings.businessProfile.proprietorName}
            disabled
          />

          <Input
            placeholder="GSTIN"
            value={activeSettings.businessProfile.gstin}
            disabled
          />

          <Input
            placeholder="Phone"
            value={activeSettings.businessProfile.phone}
            disabled
          />

          <Input
            placeholder="Email"
            value={activeSettings.businessProfile.email}
            disabled
          />

          <Input
            placeholder="City"
            value={activeSettings.businessProfile.city}
            disabled
          />

          <Input
            placeholder="State"
            value={activeSettings.businessProfile.state}
            disabled
          />

          <Input
            placeholder="Pincode"
            value={activeSettings.businessProfile.pincode}
            disabled
          />
        </div>

        <Textarea
          className="mt-4"
          placeholder="Business Address"
          value={activeSettings.businessProfile.address}
          disabled
        />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground p-4 md:p-6">
        <p className="text-2xl font-bold my-2">Bank Account Information</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Bank Name</Label>
            <Input
              placeholder="Bank Name"
              value={settings.bankAccount.bankName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankAccount: {
                    ...settings.bankAccount,
                    bankName: e.target.value,
                  },
                })
              }
            />
            {bankAccountErrors.bankName ? (
              <p className="mt-1 text-sm text-destructive">
                {bankAccountErrors.bankName}
              </p>
            ) : null}
          </div>

          <div>
            <Label>Account Number</Label>
            <Input
              placeholder="Account Number"
              value={settings.bankAccount.accountNumber}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankAccount: {
                    ...settings.bankAccount,
                    accountNumber: e.target.value,
                  },
                })
              }
            />
            {bankAccountErrors.accountNumber ? (
              <p className="mt-1 text-sm text-destructive">
                {bankAccountErrors.accountNumber}
              </p>
            ) : null}
          </div>

          <div>
            <Label>IFSC Code</Label>
            <Input
              placeholder="IFSC Code"
              value={settings.bankAccount.ifscCode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankAccount: {
                    ...settings.bankAccount,
                    ifscCode: e.target.value.toUpperCase(),
                  },
                })
              }
            />
            {bankAccountErrors.ifscCode ? (
              <p className="mt-1 text-sm text-destructive">
                {bankAccountErrors.ifscCode}
              </p>
            ) : null}
          </div>

          <div>
            <Label>Branch</Label>
            <Input
              placeholder="Branch"
              value={settings.bankAccount.branch}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankAccount: {
                    ...settings.bankAccount,
                    branch: e.target.value,
                  },
                })
              }
            />
            {bankAccountErrors.branch ? (
              <p className="mt-1 text-sm text-destructive">
                {bankAccountErrors.branch}
              </p>
            ) : null}
          </div>
        </div>

        <ChangeNote
          show={hasSectionChanges(
            settings.bankAccount,
            appliedSettings.bankAccount,
          )}
        />
        <button
          onClick={handleSaveBankAccount}
          disabled={savingBankAccount}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-primary-foreground cursor-pointer hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingBankAccount ? "Saving..." : "Save Bank Account"}
        </button>
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
        <ChangeNote
          show={hasSectionChanges(settings.pdf, appliedSettings.pdf)}
        />
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
