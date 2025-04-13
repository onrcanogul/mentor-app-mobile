import { Theme } from "./types";

export const darkTheme: Theme = {
  colors: {
    card: {
      background: "#1E1E1E",
      border: "#2D2D2D",
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
  },
};
