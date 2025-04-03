import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import { Category } from "../../../domain/category";

interface CategorySelectionProps {
  categories: Category[];
  onEdit: () => void;
  isOwn: boolean;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  onEdit,
  isOwn,
}) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("categories")}</Text>
        {isOwn ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      {categories?.map((category, index) => (
        <Text key={index} style={styles.listItem}>
          • {t(`${category.localizationCode}`)}
        </Text>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    margin: 15,
    marginBottom: 0,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  listItem: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 5,
  },
});

export default CategorySelection;
