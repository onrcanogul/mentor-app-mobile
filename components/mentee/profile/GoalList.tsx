import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { Goal } from "../../../domain/goal";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import { format } from "date-fns";

interface GoalListProps {
  goals: Goal[];
  onEdit: () => void;
  isOwn: boolean;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, isOwn }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const CardBackground = Platform.OS === "ios" ? BlurView : View;
  const cardProps =
    Platform.OS === "ios"
      ? { intensity: 20, tint: "dark" as BlurTint }
      : { style: { backgroundColor: "rgba(255, 255, 255, 0.05)" } };

  const formatDate = (date: Date | undefined) => {
    if (!date) return t("present");
    return format(new Date(date), "MMM yyyy");
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <IconButton
            icon="target"
            iconColor={theme.colors.primary.main}
            size={24}
          />
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
            variant="titleLarge"
          >
            {t("goals")}
          </Text>
        </View>
        {isOwn && (
          <IconButton
            icon="pencil"
            iconColor={theme.colors.text.secondary}
            onPress={onEdit}
            size={20}
          />
        )}
      </View>

      <View style={styles.goalsContainer}>
        {goals.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.text.secondary }]}
          >
            {t("noGoalsYet")}
          </Text>
        ) : (
          <View style={styles.goalsList}>
            {goals.map((goal, index) => (
              <Animated.View
                key={goal.id || index}
                entering={FadeInDown.delay(index * 100)}
                style={styles.goalItem}
              >
                <CardBackground {...cardProps} style={styles.goalCard}>
                  <Text
                    style={[
                      styles.goalText,
                      { color: theme.colors.text.primary },
                    ]}
                    variant="bodyLarge"
                  >
                    {goal.text}
                  </Text>
                  {goal.targetDate && (
                    <Text
                      style={[
                        styles.targetDate,
                        { color: theme.colors.primary.main },
                      ]}
                      variant="bodySmall"
                    >
                      {formatDate(goal.targetDate)}
                    </Text>
                  )}
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  goalsContainer: {
    minHeight: 50,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    width: "100%",
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  goalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  targetDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default GoalList;
