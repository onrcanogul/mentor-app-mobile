import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";

interface EmptyStateProps {
  activeTab: "pending" | "accepted" | "rejected";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.text.disabled }]}>
        {t(`match.empty.${activeTab}`)}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
