export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  primary: string;
  secondary: string;
  danger: string;
  inputBorder: string;
  overlay: string;
  surface: string;
};

export const lightTheme: ThemeColors = {
  background: "#E7EDF4",
  card: "#FFFFFF",
  text: "#0D1117",
  mutedText: "#667085",
  primary: "#2563EB",
  secondary: "#14B8A6",
  danger: "#DC2626",
  inputBorder: "#CBD5E1",
  overlay: "rgba(15, 23, 42, 0.08)",
  surface: "#F8FAFC",
};

export const darkTheme: ThemeColors = {
  background: "#0D1117",
  card: "#161B22",
  text: "#E7EDF4",
  mutedText: "#94A3B8",
  primary: "#60A5FA",
  secondary: "#34D399",
  danger: "#F87171",
  inputBorder: "#334155",
  overlay: "rgba(15, 23, 42, 0.7)",
  surface: "#111827",
};

export const colors = lightTheme;
