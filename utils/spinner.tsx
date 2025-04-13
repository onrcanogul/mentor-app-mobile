import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  visible: boolean;
  text?: string;
  size?: "small" | "large";
}

const LoadingSpinner: React.FC<Props> = ({ visible, text, size = "large" }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary + "F0" },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator
          size={size}
          color={theme.colors.primary.main}
          style={styles.spinner}
        />
        {text && (
          <Animated.Text
            entering={FadeIn.delay(200)}
            style={[styles.text, { color: theme.colors.text.primary }]}
          >
            {text}
          </Animated.Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default LoadingSpinner;
