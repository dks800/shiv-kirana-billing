import type { Metadata } from "next";

import { Inter } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/hooks/useAuth";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/theme-context";
import { SettingsProvider } from "@/context/settings-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Shiv Kariyana Billing",
  description: "GST Invoice Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider>
            <SettingsProvider>
              <Toaster position="top-right" />
              {children}
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
