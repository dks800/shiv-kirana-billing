"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  const applyTheme = (theme: Theme) => {
    setThemeState(theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    Promise.resolve().then(() => applyTheme(savedTheme || "light"));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: applyTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
