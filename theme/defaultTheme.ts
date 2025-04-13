import { Theme } from "./types";

export const defaultTheme: Theme = {
  colors: {
    primary: {
      main: "#FFD700",
      light: "#FFE44D",
      dark: "#CCB100",
      contrastText: "#000000",
    },
    background: {
      primary: "#121212",
      secondary: "#1E1E1E",
      tertiary: "#2C2C2C",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
      accent: "#FFD700",
      disabled: "#666666",
    },
    button: {
      primary: "#FFD700",
      secondary: "#2C2C2C",
      disabled: "#666666",
      text: "#000000",
    },
    input: {
      background: "#1E1E1E",
      border: "#333333",
      text: "#FFFFFF",
      placeholder: "#666666",
    },
    card: {
      background: "#1E1E1E",
      border: "#333333",
      shadow: {
        color: "rgba(0, 0, 0, 0.3)",
        offset: {
          width: 0,
          height: 2,
        },
        opacity: 0.3,
        radius: 8,
        elevation: 4,
      },
    },
    statusBar: {
      background: "#121212",
      content: "#FFFFFF",
    },
    tabBar: {
      background: "#121212",
      active: "#FFD700",
      inactive: "#666666",
    },
    drawer: {
      background: "#121212",
      text: "#FFFFFF",
      border: "#333333",
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
