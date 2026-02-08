"use client";

import React, { useEffect, useState } from "react";

const STORAGE_KEY = "assignment-app-theme";

type Theme = "light" | "dark";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("dark");
      root.dataset.theme = "dark";
      document.body.dataset.theme = "dark";
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
      root.dataset.theme = "light";
      document.body.dataset.theme = "light";
      root.style.colorScheme = "light";
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div
      data-theme={theme}
      style={{
        backgroundColor: theme === "dark" ? "#0b0f19" : "#fbf7f2",
        color: theme === "dark" ? "#f4e9dc" : "#0f172a",
        minHeight: "100vh",
      }}
      className="min-h-screen"
    >
      <ThemeToggle theme={theme} setTheme={setTheme} />
      {children}
    </div>
  );
};

const ThemeToggle = ({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}) => {
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed right-5 top-5 z-50 rounded-full border border-slate-200/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-ink-900/80 dark:text-sand-200"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
};
