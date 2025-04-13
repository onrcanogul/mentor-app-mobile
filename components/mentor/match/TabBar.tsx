import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../contexts/ThemeContext";

interface TabBarProps {
  activeTab: "pending" | "accepted" | "rejected";
  onTabChange: (tab: "pending" | "accepted" | "rejected") => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const renderTabButton = (
    tab: "pending" | "accepted" | "rejected",
    label: string
  ) => (
    <TouchableOpacity
      onPress={() => onTabChange(tab)}
      style={[
        styles.tabButton,
        {
          backgroundColor:
            activeTab === tab ? theme.colors.primary.main : "transparent",
          borderColor: theme.colors.primary.main,
        },
      ]}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color:
              activeTab === tab
                ? theme.colors.primary.contrastText
                : theme.colors.primary.main,
          },
        ]}
      >
        {t(`match.tabs.${label}`)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderTabButton("pending", "pending")}
      {renderTabButton("accepted", "accepted")}
      {renderTabButton("rejected", "rejected")}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
