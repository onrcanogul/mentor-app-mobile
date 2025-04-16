import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  BackHandler,
  Platform,
  ScrollView,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  Chip,
  Searchbar,
} from "react-native-paper";
import { Category } from "../../../../domain/category";
import categoryService from "../../../../services/category-service";
import menteeService from "../../../../services/mentee-service";
import toastrService from "../../../../services/toastr-service";
import * as SystemUI from "expo-system-ui";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import mentorService from "../../../../services/mentor-service";
import communityUserService from "../../../../services/community-user-service";

interface CategoryEditModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: (updatedCategories: Category[]) => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  visible,
  categories,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await categoryService.get(
          () => {},
          () => {}
        );
        setAllCategories(response);
      } catch (error) {
        toastrService.error(t("categoryFetchError"));
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  useEffect(() => {
    setSelectedCategoryIds(categories.map((c) => c.id!));
  }, [categories]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [visible]);

  useEffect(() => {
    if (visible && Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#121212");
    }
  }, [visible]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selected = allCategories.filter((cat) =>
        selectedCategoryIds.includes(cat.id!)
      );
      const user = await userService.getCurrentUser();

      if (!user) {
        toastrService.error(t("userNotFound"));
        return;
      }

      let success = false;

      switch (user.role) {
        case "Mentee":
          success = await menteeService.addCategory(user.id, selected);
          break;
        case "Mentor":
          success = await mentorService.addCategory(user.id, selected);
          break;
        case "General":
          success = await communityUserService.addCategory(user.id, selected);
          break;
        default:
          toastrService.error(t("invalidUserRole"));
          return;
      }

      if (success) {
        toastrService.success(t("categorySaveSuccess"));
        onSave(selected);
        onClose();
      } else {
        toastrService.error(t("categorySaveError"));
      }
    } catch (error) {
      toastrService.error(t("categorySaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = allCategories.filter((category) =>
    t(`${category.localizationCode}`)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.card.background },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: theme.colors.text.primary }]}
          >
            {t("categoryEditTitle")}
          </Text>

          <Searchbar
            placeholder={t("searchCategory")}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchBar,
              { backgroundColor: theme.colors.input.background },
            ]}
            inputStyle={{ color: theme.colors.text.primary }}
            iconColor={theme.colors.text.secondary}
            placeholderTextColor={theme.colors.text.disabled}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primary.main}
              />
            </View>
          ) : (
            <ScrollView
              style={styles.categoriesContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.categoryGrid}>
                {filteredCategories.map((category, index) => (
                  <Animated.View
                    key={category.id}
                    entering={FadeInDown.delay(index * 50)}
                    style={styles.categoryChipContainer}
                  >
                    <Chip
                      selected={selectedCategoryIds.includes(category.id!)}
                      onPress={() => toggleCategory(category.id!)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: selectedCategoryIds.includes(
                            category.id!
                          )
                            ? theme.colors.primary.main
                            : theme.colors.input.background,
                        },
                      ]}
                      textStyle={{
                        color: selectedCategoryIds.includes(category.id!)
                          ? theme.colors.primary.contrastText
                          : theme.colors.text.primary,
                      }}
                    >
                      {t(`${category.localizationCode}`)}
                    </Chip>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.actions}>
            <Button
              onPress={onClose}
              mode="outlined"
              style={styles.button}
              textColor={theme.colors.text.primary}
            >
              {t("cancel")}
            </Button>
            <Button
              onPress={handleSave}
              mode="contained"
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary.main },
              ]}
              loading={isSaving}
              disabled={isLoading || isSaving}
            >
              {t("save")}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 0,
    borderRadius: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    maxHeight: 400,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryChipContainer: {
    padding: 4,
    width: "50%",
  },
  categoryChip: {
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
});

export default CategoryEditModal;
