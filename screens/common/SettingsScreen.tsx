import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { List } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", label: "English" },
    { code: "tr", label: "Türkçe" },
    { code: "es", label: "Español" },
  ];

  const currentLang = i18n.language;

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader style={styles.subheader}>
            {t("language")}
          </List.Subheader>

          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => changeLanguage(lang.code)}
            >
              <List.Item
                title={lang.label}
                titleStyle={[
                  styles.title,
                  lang.code === currentLang && styles.selectedLang,
                ]}
                left={() => (
                  <List.Icon
                    icon={
                      lang.code === currentLang
                        ? "check-circle"
                        : "circle-outline"
                    }
                    color={lang.code === currentLang ? "#FFD700" : "#A0A0A0"}
                  />
                )}
              />
            </TouchableOpacity>
          ))}
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  },
  subheader: {
    color: "#FFD700",
    fontSize: 16,
    marginBottom: 5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  selectedLang: {
    fontWeight: "bold",
    color: "#FFD700",
  },
});
