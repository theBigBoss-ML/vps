"use client";

import { useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark";

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const currentTheme = (resolvedTheme ?? theme) === "dark" ? "dark" : "light";

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return {
    theme: currentTheme as Theme,
    setTheme: (newTheme: Theme) => setTheme(newTheme),
    toggleTheme,
  };
}
