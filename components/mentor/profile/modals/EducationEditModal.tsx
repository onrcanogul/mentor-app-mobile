import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
  Platform,
} from "react-native";
import { Education } from "../../../../domain/education";
import toastrService from "../../../../services/toastr-service";
import mentorService from "../../../../services/mentor-service";
import { formatDate } from "../../../../utils/dateFormatter";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  educations: Education[];
  onClose: () => void;
  onSave: (updated: Education[]) => void;
}

const EducationEditModal: React.FC<Props> = ({
  visible,
  educations,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editedEducations, setEditedEducations] = useState<Education[]>([]);
  const [newEdu, setNewEdu] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    grade: "",
    activities: "",
    description: "",
  });

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

  useEffect(() => {
    if (visible && Platform.OS === "android") {
      // changeNavigationBarColor("#121212", false);
    }
  }, [visible]);

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...editedEducations];
    if (field === "startDate" || field === "endDate") {
      (updated[index] as any)[field] = new Date(value);
    } else {
      (updated[index] as any)[field] = value;
    }
    setEditedEducations(updated);
  };

  const deleteEducation = (index: number) => {
    const updated = [...editedEducations];
    updated.splice(index, 1);
    setEditedEducations(updated);
  };

  const addEducation = () => {
    if (!newEdu.school || !newEdu.startDate || !newEdu.endDate) return;

    const newItem: Education = {
      school: newEdu.school,
      degree: newEdu.degree,
      fieldOfStudy: newEdu.fieldOfStudy,
      startDate: new Date(newEdu.startDate),
      endDate: new Date(newEdu.endDate),
      grade: newEdu.grade,
      activities: newEdu.activities,
      description: newEdu.description,
      createdBy: "SYSTEM",
    };

    setEditedEducations((prev) => [...prev, newItem]);

    setNewEdu({
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      activities: "",
      description: "",
    });
  };

  const saveChanges = async () => {
    const result = await mentorService.saveEducations(
      (
        await userService.getCurrentUser()
      ).id,
      editedEducations
    );
    if (result) {
      toastrService.success(t("educationSaveSuccess"));
      onSave(editedEducations);
      onClose();
    } else {
      toastrService.error(t("educationSaveError"));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t("editEducationsTitle")}</Text>

          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>{t("addNewEducation")}</Text>
            {[
              { label: t("school"), key: "school" },
              { label: t("degree"), key: "degree" },
              { label: t("fieldOfStudy"), key: "fieldOfStudy" },
              { label: t("startDate"), key: "startDate" },
              { label: t("endDate"), key: "endDate" },
              { label: t("grade"), key: "grade" },
              { label: t("activities"), key: "activities" },
              { label: t("description"), key: "description" },
            ].map(({ label, key }) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={label}
                placeholderTextColor="#888"
                value={(newEdu as any)[key]}
                onChangeText={(text) => setNewEdu({ ...newEdu, [key]: text })}
              />
            ))}
            <TouchableOpacity onPress={addEducation} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ {t("add")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 300 }}>
            {editedEducations.map((edu, index) => (
              <View key={edu.id || index} style={styles.eduItem}>
                {[
                  {
                    label: t("school"),
                    key: "school",
                    value: edu.school ?? "",
                  },
                  {
                    label: t("degree"),
                    key: "degree",
                    value: edu.degree ?? "",
                  },
                  {
                    label: t("fieldOfStudy"),
                    key: "fieldOfStudy",
                    value: edu.fieldOfStudy ?? "",
                  },
                  {
                    label: t("startDate"),
                    key: "startDate",
                    value: formatDate(edu.startDate),
                  },
                  {
                    label: t("endDate"),
                    key: "endDate",
                    value: formatDate(edu.endDate),
                  },
                  {
                    label: t("grade"),
                    key: "grade",
                    value: edu.grade ?? "",
                  },
                  {
                    label: t("activities"),
                    key: "activities",
                    value: edu.activities ?? "",
                  },
                  {
                    label: t("description"),
                    key: "description",
                    value: edu.description ?? "",
                  },
                ].map(({ label, key, value }) => (
                  <TextInput
                    key={`${key}-${index}`}
                    style={styles.input}
                    placeholder={label}
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={(text) =>
                      updateEducation(index, key as keyof Education, text)
                    }
                    multiline={key === "description"}
                  />
                ))}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteEducation(index)}
                >
                  <Text style={styles.deleteButtonText}>{t("delete")}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveChanges} style={styles.saveButton}>
              <Text style={styles.buttonText}>{t("save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EducationEditModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  addSection: {
    marginBottom: 20,
  },
  eduItem: {
    marginBottom: 20,
    backgroundColor: "#292929",
    padding: 10,
    borderRadius: 8,
  },
  input: {
    backgroundColor: "#3A3A3A",
    color: "#FFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#AA3333",
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "flex-end",
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  addButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#888",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
});
