import { Theme } from "./types";

export const lightTheme: Theme = {
  colors: {
    primary: {
      main: "#007AFF",
      light: "#4DA2FF",
      dark: "#0055B3",
      contrastText: "#FFFFFF",
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F5F5F5",
      tertiary: "#E5E5E5",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
      accent: "#007AFF",
      disabled: "#999999",
    },
    button: {
      primary: "#007AFF",
      secondary: "#E5E5E5",
      disabled: "#CCCCCC",
      text: "#FFFFFF",
    },
    input: {
      background: "#FFFFFF",
      border: "#CCCCCC",
      text: "#000000",
      placeholder: "#999999",
    },
    card: {
      background: "#FFFFFF",
      border: "#E5E5E5",
      shadow: {
        color: "rgba(0, 0, 0, 0.1)",
        offset: {
          width: 0,
          height: 2,
        },
        opacity: 0.1,
        radius: 8,
        elevation: 4,
      },
    },
    statusBar: {
      background: "#FFFFFF",
      content: "#000000",
    },
    tabBar: {
      background: "#FFFFFF",
      active: "#007AFF",
      inactive: "#999999",
    },
    drawer: {
      background: "#FFFFFF",
      text: "#000000",
      border: "#E5E5E5",
    },
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
      contrastText: "#FFFFFF",
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
};
