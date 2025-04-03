import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, IconButton, Chip } from "react-native-paper";
import { Category } from "../../../domain/category";
import { useTranslation } from "react-i18next";

interface Props {
  categories: Category[];
  onEdit: () => void;
  isOwn: boolean;
}

const CategorySelection: React.FC<Props> = ({ categories, onEdit, isOwn }) => {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🗂️ {t("categories")}</Text>
        {isOwn === true ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      <View style={styles.chipContainer}>
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
              {t(category.localizationCode)}
            </Chip>
          ))
        ) : (
          <Text style={styles.emptyText}>Kategori bilgisi eklenmemiş.</Text>
        )}
      </View>
    </Card>
  );
};

export default CategorySelection;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#3A3A3A",
    margin: 4,
  },
  chipText: {
    color: "#FFF",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 4,
  },
});
