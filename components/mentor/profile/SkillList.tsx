import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton, ProgressBar } from "react-native-paper";
import { useTheme } from "../../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import { Skill } from "../../../domain/skill";
import Animated, { FadeInDown } from "react-native-reanimated";
import { defaultTheme } from "../../../theme/defaultTheme";

interface SkillListProps {
  skills: Skill[];
  isOwn: boolean;
  onEdit?: () => void;
}

const SkillList: React.FC<SkillListProps> = ({ skills, isOwn, onEdit }) => {
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
            icon="lightning-bolt"
            size={24}
            iconColor={theme.colors.primary.main}
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Skills
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

      <View style={styles.skillsContainer}>
        {skills.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.text.secondary }]}
          >
            No skills added yet.
          </Text>
        ) : (
          <View style={styles.skillsList}>
            {skills.map((skill, index) => (
              <Animated.View
                key={skill.id}
                entering={FadeInDown.delay(index * 100)}
                style={styles.skillItem}
              >
                <CardBackground
                  {...cardProps}
                  style={[
                    styles.skillCard,
                    Platform.OS === "ios" ? {} : cardProps.style,
                  ]}
                >
                  <View style={styles.skillHeader}>
                    <Text
                      style={[
                        styles.skillName,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {skill.name}
                    </Text>
                    <Text
                      style={[
                        styles.skillLevel,
                        { color: theme.colors.primary.main },
                      ]}
                    >
                      Level {skill.level}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.progressContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      },
                    ]}
                  >
                    <ProgressBar
                      progress={skill.level / 5}
                      color={theme.colors.primary.main}
                      style={styles.progressBar}
                    />
                  </View>
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
  skillsContainer: {
    minHeight: 50,
  },
  skillsList: {
    gap: 12,
  },
  skillItem: {
    width: "100%",
  },
  skillCard: {
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: "500",
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default SkillList;
