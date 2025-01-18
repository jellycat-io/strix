import { type Action, useRegisterActions } from "kbar";
import { useTheme } from "next-themes";

export function useThemeSwitching() {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  const themeActions: Action[] = [
    {
      id: "toggleTheme",
      name: "Toggle Theme",
      shortcut: ["t", "t"],
      section: "Theme",
      perform: toggleTheme,
    },
    {
      id: "setLightTheme",
      name: "Set Light Theme",
      shortcut: ["t", "l"],
      section: "Theme",
      perform: () => setTheme("light"),
    },
    {
      id: "setDarkTheme",
      name: "Set Dark Theme",
      shortcut: ["t", "d"],
      section: "Theme",
      perform: () => setTheme("dark"),
    },
  ];

  useRegisterActions(themeActions, [theme]);
}
