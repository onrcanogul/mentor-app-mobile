import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, IconButton } from "react-native-paper";
import { Category } from "../../../../domain/category";
import { useTheme } from "../../../../contexts/ThemeContext";
import BaseEditModal from "../../../common/BaseEditModal";
import mentorService from "../../../../services/mentor-service";
import userService from "../../../../services/user-service";
import toastrService from "../../../../services/toastr-service";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";

interface CategoryEditModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: (updated: Category[]) => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  visible,
  categories,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [editedCategories, setEditedCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    setEditedCategories(categories);
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.trim(),
      createdBy: "USER",
    };

    setEditedCategories([...editedCategories, category]);
    setNewCategory("");
  };

  const handleDeleteCategory = (index: number) => {
    const updated = [...editedCategories];
    updated.splice(index, 1);
    setEditedCategories(updated);
  };

  const handleSave = async () => {
    const userId = (await userService.getCurrentUser()).id;
    const result = await mentorService.saveCategories(userId, editedCategories);

    if (result) {
      toastrService.success(t("categorySaveSuccess"));
      onSave(editedCategories);
      onClose();
    } else {
      toastrService.error(t("categorySaveError"));
    }
  };

  return (
    <BaseEditModal
      visible={visible}
      onClose={onClose}
      title={t("editCategories")}
      onSave={handleSave}
      saveDisabled={editedCategories.length === 0}
    >
      <View style={styles.container}>
        <View style={styles.addSection}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("enterCategoryName")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newCategory}
            onChangeText={setNewCategory}
            onSubmitEditing={handleAddCategory}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary.main },
            ]}
            onPress={handleAddCategory}
          >
            <Text style={styles.addButtonText}>{t("add")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesList}>
          {editedCategories.map((category, index) => (
            <Animated.View
              key={category.id}
              entering={FadeInDown.delay(index * 50)}
              style={[
                styles.categoryItem,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: theme.colors.text.primary },
                ]}
              >
                {category.name}
              </Text>
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.text.secondary}
                onPress={() => handleDeleteCategory(index)}
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </BaseEditModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 16,
    flex: 1,
  },
});

export default CategoryEditModal;
