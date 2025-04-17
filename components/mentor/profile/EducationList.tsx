import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useTheme } from "../../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import { Education } from "../../../domain/education";
import Animated, { FadeInDown } from "react-native-reanimated";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface EducationListProps {
  educations: Education[];
  isOwn: boolean;
  onEdit?: () => void;
}

const EducationList: React.FC<EducationListProps> = ({
  educations,
  isOwn,
  onEdit,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const CardBackground = Platform.OS === "ios" ? BlurView : View;
  const cardProps =
    Platform.OS === "ios"
      ? { intensity: 20, tint: "dark" as BlurTint }
      : { style: { backgroundColor: "rgba(255, 255, 255, 0.05)" } };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Present";
    return format(date, "MMM yyyy");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IconButton
            icon="school"
            size={24}
            iconColor={theme.colors.primary.main}
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t("educations")}
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

      <View style={styles.educationsContainer}>
        {educations.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.text.secondary }]}
          >
            No education added yet.
          </Text>
        ) : (
          <View style={styles.educationsList}>
            {educations.map((education, index) => (
              <Animated.View
                key={education.id}
                entering={FadeInDown.delay(index * 100)}
                style={styles.educationItem}
              >
                <CardBackground {...cardProps} style={styles.educationCard}>
                  <View style={styles.educationHeader}>
                    <Text
                      style={[
                        styles.schoolName,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {education.school}
                    </Text>
                    <Text
                      style={[
                        styles.duration,
                        { color: theme.colors.primary.main },
                      ]}
                    >
                      {formatDate(education.startDate)} -{" "}
                      {formatDate(education.endDate)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.degree,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {education.degree}{" "}
                    {education.fieldOfStudy && `in ${education.fieldOfStudy}`}
                  </Text>
                  {education.grade && (
                    <Text
                      style={[
                        styles.grade,
                        { color: theme.colors.text.accent },
                      ]}
                    >
                      Grade: {education.grade}
                    </Text>
                  )}
                  {education.activities && (
                    <Text
                      style={[
                        styles.activities,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      Activities: {education.activities}
                    </Text>
                  )}
                  {education.description && (
                    <Text
                      style={[
                        styles.description,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      {education.description}
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
  educationsContainer: {
    minHeight: 50,
  },
  educationsList: {
    gap: 12,
  },
  educationItem: {
    width: "100%",
  },
  educationCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: "500",
  },
  degree: {
    fontSize: 16,
    marginBottom: 8,
  },
  grade: {
    fontSize: 14,
    marginBottom: 4,
  },
  activities: {
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default EducationList;
