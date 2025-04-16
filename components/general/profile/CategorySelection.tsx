import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text, IconButton, ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import { Category } from "../../../domain/category";
import Animated, { FadeInDown } from "react-native-reanimated";
import { defaultTheme } from "../../../theme/defaultTheme";
import userService from "../../../services/user-service";
import menteeService from "../../../services/mentee-service";
import mentorService from "../../../services/mentor-service";
import communityUserService from "../../../services/community-user-service";
import { useTranslation } from "react-i18next";
import toastrService from "../../../services/toastr-service";

interface CategoryListProps {
  userId?: string;
  categories: Category[];
  isOwn: boolean;
  onEdit?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  userId,
  categories,
  isOwn,
  onEdit,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === defaultTheme;

  const CardBackground = Platform.OS === "ios" ? BlurView : View;
  const cardProps =
    Platform.OS === "ios"
      ? {
          intensity: isDarkMode ? 20 : 40,
          tint: isDarkMode ? "dark" : ("light" as BlurTint),
        }
      : {
          style: {
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
          },
        };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IconButton
            icon="folder"
            size={24}
            iconColor={theme.colors.primary.main}
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t("categories")}
          </Text>
        </View>
        {isOwn && (
          <IconButton
            icon="pencil"
            size={20}
            iconColor={theme.colors.text.secondary}
            onPress={onEdit}
          />
        )}
      </View>

      <View style={styles.categoriesContainer}>
        {categories.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.text.secondary }]}
          >
            {t("noCategoriesYet")}
          </Text>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay(index * 100)}
                style={styles.categoryItemContainer}
              >
                <CardBackground
                  {...cardProps}
                  style={[
                    styles.categoryItem,
                    Platform.OS === "ios" ? {} : cardProps.style,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: theme.colors.text.primary },
                    ]}
                  >
                    {t(`${category.localizationCode}`)}
                  </Text>
                </CardBackground>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  categoriesContainer: {
    minHeight: 50,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryItemContainer: {
    padding: 4,
    width: "50%",
  },
  categoryItem: {
    borderRadius: 12,
    padding: 12,
    overflow: "hidden",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default CategoryList;
