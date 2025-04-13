import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
  Text,
} from "react-native";
import { Experience } from "../../../../domain/experience";
import { Skill } from "../../../../domain/skill";
import mentorService from "../../../../services/mentor-service";
import toastrService from "../../../../services/toastr-service";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../contexts/ThemeContext";
import BaseEditModal from "../../../common/BaseEditModal";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { IconButton, Button } from "react-native-paper";

interface ExperienceEditModalProps {
  visible: boolean;
  experiences: Experience[];
  onClose: () => void;
  onSave: (updated: Experience[]) => void;
}

const ExperienceEditModal: React.FC<ExperienceEditModalProps> = ({
  visible,
  experiences,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [editedExperiences, setEditedExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    title: "",
    company: "",
    location: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    isCurrentPosition: false,
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    setEditedExperiences(experiences);
  }, [experiences]);

  const handleSave = async () => {
    try {
      const userId = (await userService.getCurrentUser()).id;
      const result = await mentorService.saveExperiences(
        userId,
        editedExperiences
      );

      if (result) {
        toastrService.success(t("experienceSaveSuccess"));
        onSave(editedExperiences);
        onClose();
      } else {
        toastrService.error(t("experienceSaveError"));
      }
    } catch (error) {
      toastrService.error(t("experienceSaveError"));
    }
  };

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      const experience: Experience = {
        id: Date.now().toString(),
        title: newExperience.title,
        company: newExperience.company,
        location: newExperience.location,
        description: newExperience.description,
        startDate: newExperience.startDate!,
        endDate: newExperience.endDate!,
        isCurrentPosition: newExperience.isCurrentPosition,
        createdBy: "USER",
      };

      setEditedExperiences([...editedExperiences, experience]);
      setNewExperience({
        title: "",
        company: "",
        location: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        isCurrentPosition: false,
      });
    }
  };

  const handleDeleteExperience = (index: number) => {
    const updated = [...editedExperiences];
    updated.splice(index, 1);
    setEditedExperiences(updated);
  };

  return (
    <BaseEditModal
      visible={visible}
      onClose={onClose}
      title={t("editExperiences")}
      onSave={handleSave}
      saveDisabled={editedExperiences.length === 0}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.addSection,
            { backgroundColor: theme.colors.card.background },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.input.border,
              },
            ]}
            placeholder={t("jobTitle")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newExperience.title}
            onChangeText={(title) =>
              setNewExperience({ ...newExperience, title })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.input.border,
              },
            ]}
            placeholder={t("company")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newExperience.company}
            onChangeText={(company) =>
              setNewExperience({ ...newExperience, company })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.input.border,
              },
            ]}
            placeholder={t("location")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newExperience.location}
            onChangeText={(location) =>
              setNewExperience({ ...newExperience, location })
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.input.border,
                height: 100,
              },
            ]}
            placeholder={t("description")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newExperience.description}
            onChangeText={(description) =>
              setNewExperience({ ...newExperience, description })
            }
            multiline
          />

          <View style={styles.dateContainer}>
            <Button
              onPress={() => setShowStartDatePicker(true)}
              mode="outlined"
              style={styles.dateButton}
            >
              {newExperience.startDate
                ? format(newExperience.startDate, "MM/dd/yyyy")
                : t("startDate")}
            </Button>

            <Button
              onPress={() => setShowEndDatePicker(true)}
              mode="outlined"
              style={styles.dateButton}
              disabled={newExperience.isCurrentPosition}
            >
              {newExperience.endDate && !newExperience.isCurrentPosition
                ? format(newExperience.endDate, "MM/dd/yyyy")
                : t("endDate")}
            </Button>
          </View>

          <View style={styles.currentPositionContainer}>
            <Switch
              value={newExperience.isCurrentPosition}
              onValueChange={(value) =>
                setNewExperience({ ...newExperience, isCurrentPosition: value })
              }
              trackColor={{ false: "#767577", true: theme.colors.primary.main }}
            />
            <Text style={{ color: theme.colors.text.primary, marginLeft: 8 }}>
              {t("currentPosition")}
            </Text>
          </View>

          <IconButton
            icon="plus-circle"
            size={50}
            iconColor={theme.colors.primary.main}
            onPress={handleAddExperience}
            disabled={!newExperience.title || !newExperience.company}
            style={[
              styles.addButton,
              (!newExperience.title || !newExperience.company) && {
                opacity: 0.5,
              },
            ]}
          />
        </View>

        <View style={styles.experiencesList}>
          {editedExperiences.map((experience, index) => (
            <Animated.View
              key={experience.id}
              entering={FadeInDown.delay(index * 50)}
              style={[
                styles.experienceItem,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <View style={styles.experienceHeader}>
                <Text
                  style={[
                    styles.experienceTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {experience.title}
                </Text>
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.text.secondary}
                  onPress={() => handleDeleteExperience(index)}
                />
              </View>
              <Text
                style={[
                  styles.experienceCompany,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {experience.company}
              </Text>
              {experience.location && (
                <Text
                  style={[
                    styles.experienceLocation,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {experience.location}
                </Text>
              )}
              <Text
                style={[
                  styles.experienceDates,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {format(new Date(experience.startDate), "MM/yyyy")} -{" "}
                {experience.isCurrentPosition
                  ? t("present")
                  : format(new Date(experience.endDate), "MM/yyyy")}
              </Text>
              {experience.description && (
                <Text
                  style={[
                    styles.experienceDescription,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {experience.description}
                </Text>
              )}
            </Animated.View>
          ))}
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={newExperience.startDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowStartDatePicker(false);
              if (date && event.type !== "dismissed") {
                setNewExperience({ ...newExperience, startDate: date });
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={newExperience.endDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowEndDatePicker(false);
              if (date && event.type !== "dismissed") {
                setNewExperience({ ...newExperience, endDate: date });
              }
            }}
          />
        )}
      </View>
    </BaseEditModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
  },
  currentPositionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    alignSelf: "center",
  },
  experiencesList: {
    gap: 12,
  },
  experienceItem: {
    padding: 16,
    borderRadius: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  experienceCompany: {
    fontSize: 14,
    marginTop: 4,
  },
  experienceLocation: {
    fontSize: 14,
    marginTop: 2,
  },
  experienceDates: {
    fontSize: 14,
    marginTop: 4,
  },
  experienceDescription: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default ExperienceEditModal;
