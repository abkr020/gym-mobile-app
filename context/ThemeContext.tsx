import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { darkTheme, lightTheme, ThemeColors, ThemeMode } from "../constants/colors";

const THEME_STORAGE_KEY = "appThemeMode";

type ThemeContextValue = {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => Promise<void>;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedValue === "dark" || storedValue === "light") {
          setThemeMode(storedValue);
        } else {
          const systemPreference = Appearance.getColorScheme();
          setThemeMode(systemPreference === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("ThemeProvider: failed to load theme", error);
      } finally {
        setIsReady(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("ThemeProvider: failed to save theme", error);
    }
  };

  const theme = useMemo(() => (themeMode === "dark" ? darkTheme : lightTheme), [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, isReady }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
