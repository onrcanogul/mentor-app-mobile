import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  BackHandler,
  Platform,
} from "react-native";
import { Education } from "../../../../domain/education";
import toastrService from "../../../../services/toastr-service";
import mentorService from "../../../../services/mentor-service";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../contexts/ThemeContext";
import BaseEditModal from "../../../common/BaseEditModal";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { IconButton, Button } from "react-native-paper";

interface EducationEditModalProps {
  visible: boolean;
  educations: Education[];
  onClose: () => void;
  onSave: (updated: Education[]) => void;
}

const EducationEditModal: React.FC<EducationEditModalProps> = ({
  visible,
  educations,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [editedEducations, setEditedEducations] = useState<Education[]>([]);
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: new Date(),
    endDate: new Date(),
    grade: "",
    activities: "",
    description: "",
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    setEditedEducations(educations);
  }, [educations]);

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

  const handleAddEducation = () => {
    if (newEducation.school && newEducation.startDate) {
      const education: Education = {
        id: Date.now().toString(),
        school: newEducation.school,
        degree: newEducation.degree,
        fieldOfStudy: newEducation.fieldOfStudy,
        startDate: newEducation.startDate,
        endDate: newEducation.endDate,
        grade: newEducation.grade,
        activities: newEducation.activities,
        description: newEducation.description,
        createdBy: "USER",
      };

      setEditedEducations([...editedEducations, education]);
      setNewEducation({
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: new Date(),
        endDate: new Date(),
        grade: "",
        activities: "",
        description: "",
      });
      onSave(editedEducations);
      onClose();
    }
  };

  const handleDeleteEducation = (index: number) => {
    const updated = [...editedEducations];
    updated.splice(index, 1);
    setEditedEducations(updated);
  };

  const handleSave = async () => {
    const userId = (await userService.getCurrentUser()).id;
    const result = await mentorService.saveEducations(userId, editedEducations);

    if (result) {
      toastrService.success(t("educationSaveSuccess"));
      onSave(editedEducations);
      onClose();
    } else {
      toastrService.error(t("educationSaveError"));
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM yyyy");
  };

  return (
    <BaseEditModal
      visible={visible}
      onClose={onClose}
      title={t("editEducation")}
      onSave={handleSave}
      saveDisabled={editedEducations.length === 0}
    >
      <View style={styles.container}>
        <View style={styles.addSection}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("school")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newEducation.school}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, school: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("degree")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newEducation.degree}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, degree: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("fieldOfStudy")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newEducation.fieldOfStudy}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, fieldOfStudy: text })
            }
          />

          <View style={styles.dateContainer}>
            <Button
              onPress={() => setShowStartDatePicker(true)}
              mode="outlined"
              style={styles.dateButton}
            >
              {newEducation.startDate
                ? format(newEducation.startDate, "MM/dd/yyyy")
                : t("startDate")}
            </Button>

            <Button
              onPress={() => setShowEndDatePicker(true)}
              mode="outlined"
              style={styles.dateButton}
            >
              {newEducation.endDate
                ? format(newEducation.endDate, "MM/dd/yyyy")
                : t("endDate")}
            </Button>
          </View>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("grade")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newEducation.grade}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, grade: text })
            }
          />

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("activities")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newEducation.activities}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, activities: text })
            }
            multiline
          />

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("description")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newEducation.description}
            onChangeText={(text) =>
              setNewEducation({ ...newEducation, description: text })
            }
            multiline
          />

          <IconButton
            icon="plus-circle"
            size={50}
            iconColor={theme.colors.primary.main}
            onPress={handleAddEducation}
            disabled={!newEducation.school || !newEducation.startDate}
            style={[
              styles.addButton,
              (!newEducation.school || !newEducation.startDate) && {
                opacity: 0.5,
              },
            ]}
          />
        </View>

        <View style={styles.educationsList}>
          {editedEducations.map((education, index) => (
            <Animated.View
              key={education.id}
              entering={FadeInDown.delay(index * 50)}
              style={[
                styles.educationItem,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <View style={styles.educationHeader}>
                <View style={styles.educationTitle}>
                  <Text
                    style={[
                      styles.school,
                      { color: theme.colors.text.primary },
                    ]}
                  >
                    {education.school}
                  </Text>
                  <Text
                    style={[
                      styles.degree,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {education.degree}
                    {education.fieldOfStudy && ` in ${education.fieldOfStudy}`}
                  </Text>
                </View>
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.text.secondary}
                  onPress={() => handleDeleteEducation(index)}
                />
              </View>

              {education.grade && (
                <Text
                  style={[styles.grade, { color: theme.colors.text.secondary }]}
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

              <View style={styles.dates}>
                <Text
                  style={[
                    styles.dateRange,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {formatDate(education.startDate)} -{" "}
                  {formatDate(education.endDate)}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={newEducation.startDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowStartDatePicker(false);
              if (date && event.type !== "dismissed") {
                setNewEducation({ ...newEducation, startDate: date });
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={newEducation.endDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowEndDatePicker(false);
              if (date && event.type !== "dismissed") {
                setNewEducation({ ...newEducation, endDate: date });
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
    gap: 12,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 12,
  },
  input: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    alignSelf: "center",
    margin: 8,
  },
  educationsList: {
    gap: 12,
  },
  educationItem: {
    borderRadius: 12,
    padding: 16,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  educationTitle: {
    flex: 1,
  },
  school: {
    fontSize: 16,
    fontWeight: "600",
  },
  degree: {
    fontSize: 14,
    marginTop: 2,
  },
  grade: {
    fontSize: 14,
    marginTop: 8,
  },
  activities: {
    fontSize: 14,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  dates: {
    marginTop: 4,
  },
  dateRange: {
    fontSize: 12,
  },
});

export default EducationEditModal;
