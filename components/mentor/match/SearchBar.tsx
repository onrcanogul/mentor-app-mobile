import React from "react";
import { useTranslation } from "react-i18next";
import { View, TextInput, StyleSheet } from "react-native";

const SearchBar = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (val: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t("searchMentee")}
        placeholderTextColor="#A0A0A0"
        value={query}
        onChangeText={setQuery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
});

export default SearchBar;
