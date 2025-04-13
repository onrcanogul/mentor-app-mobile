import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { List, Switch, Text, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { defaultTheme } from "../../theme/defaultTheme";
import { lightTheme } from "../../theme/lightTheme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const languages = [
    { code: "en", label: "English", icon: "flag-outline" },
    { code: "tr", label: "Türkçe", icon: "flag-outline" },
    { code: "es", label: "Español", icon: "flag-outline" },
  ];

  const currentLang = i18n.language;
  const isDarkMode = theme === defaultTheme;

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? lightTheme : defaultTheme);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            {t("appearance")}
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: theme.colors.background.secondary },
            ]}
            onPress={toggleTheme}
          >
            <View style={styles.settingContent}>
              <Icon
                name={isDarkMode ? "weather-night" : "white-balance-sunny"}
                size={24}
                color={theme.colors.primary.main}
                style={styles.settingIcon}
              />
              <Text
                style={[
                  styles.settingText,
                  { color: theme.colors.text.primary },
                ]}
              >
                {t("darkMode")}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              color={theme.colors.primary.main}
            />
          </TouchableOpacity>
        </View>

        <Divider
          style={[
            styles.divider,
            { backgroundColor: theme.colors.background.tertiary },
          ]}
        />

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            {t("language")}
          </Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.settingItem,
                { backgroundColor: theme.colors.background.secondary },
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <View style={styles.settingContent}>
                <Icon
                  name={lang.icon}
                  size={24}
                  color={theme.colors.primary.main}
                  style={styles.settingIcon}
                />
                <Text
                  style={[
                    styles.settingText,
                    { color: theme.colors.text.primary },
                    lang.code === currentLang && styles.selectedLang,
                  ]}
                >
                  {lang.label}
                </Text>
              </View>
              {lang.code === currentLang && (
                <Icon
                  name="check"
                  size={24}
                  color={theme.colors.primary.main}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedLang: {
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});

export default Settings;
