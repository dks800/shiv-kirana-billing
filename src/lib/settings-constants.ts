import { AppSettings } from "@/types/settings.types";

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    shopName: "Shiv Kirana & Provision Stores",
  },

  businessProfile: {
    businessName: "Shiv Kariyana and Provision Store",
    proprietorName: "Magnani Manishkumar Hiralal",
    gstin: "24BGMPM9067L1ZO",
    phone: "8200881241",
    email: "",
    address:
      "Shop No. 9 TO 13, Gokul Plaza, Ground Floor, Vijapur Himatnagar Highway",
    city: "Vijapur",
    state: "Gujarat",
    pincode: "384570",
    logoUrl: "",
  },

  pdf: {
    showGSTSummary: true,
    showAmountInWords: true,
  },

  bankAccount: {
    bankName: "Uco Bank",
    accountNumber: "25290210003695",
    ifscCode: "UCBA0002529",
    branch: "Vijapur",
  },

  preferences: {
    theme: "light",
    dateFormat: "DD/MM/YYYY",
  },
};
