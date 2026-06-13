export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | string;

export interface AppSettings {
  general: {
    shopName: string;
  };

  businessProfile: {
    businessName: string;
    proprietorName: string;
    gstin: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    logoUrl?: string;
  };

  pdf: {
    showGSTSummary: boolean;
    showAmountInWords: boolean;
  };

  bankAccount: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };

  preferences: {
    theme: "light" | "dark";
    dateFormat: DateFormat;
  };

  updatedAt?: unknown;
}

export type MutableAppSettings = Pick<
  AppSettings,
  "bankAccount" | "pdf" | "preferences"
>;
