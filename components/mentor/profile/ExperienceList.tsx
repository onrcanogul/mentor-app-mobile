import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useTheme } from "../../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import { Experience } from "../../../domain/experience";
import Animated, { FadeInDown } from "react-native-reanimated";
import { format } from "date-fns";

interface ExperienceListProps {
  experiences: Experience[];
  isOwn: boolean;
  onEdit?: () => void;
}

const ExperienceList: React.FC<ExperienceListProps> = ({
  experiences,
  isOwn,
  onEdit,
}) => {
  const { theme } = useTheme();

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
            icon="briefcase"
            size={24}
            iconColor={theme.colors.primary.main}
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Experience
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

      <View style={styles.experiencesContainer}>
        {experiences.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.text.secondary }]}
          >
            No experience added yet.
          </Text>
        ) : (
          <View style={styles.experiencesList}>
            {experiences.map((experience, index) => (
              <Animated.View
                key={experience.id}
                entering={FadeInDown.delay(index * 100)}
                style={styles.experienceItem}
              >
                <CardBackground {...cardProps} style={styles.experienceCard}>
                  <View style={styles.experienceHeader}>
                    <Text
                      style={[
                        styles.companyName,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {experience.company}
                    </Text>
                    <Text
                      style={[
                        styles.duration,
                        { color: theme.colors.primary.main },
                      ]}
                    >
                      {formatDate(experience.StartDate)} -{" "}
                      {formatDate(experience.EndDate)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.position,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {experience.title}
                  </Text>
                  {experience.description && (
                    <Text
                      style={[
                        styles.description,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      {experience.description}
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
  experiencesContainer: {
    minHeight: 50,
  },
  experiencesList: {
    gap: 12,
  },
  experienceItem: {
    width: "100%",
  },
  experienceCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "600",
  },
  position: {
    fontSize: 16,
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: "500",
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

export default ExperienceList;
