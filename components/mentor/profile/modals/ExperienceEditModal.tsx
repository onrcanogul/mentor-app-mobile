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
import { Experience } from "../../../../domain/experience";
import { Skill } from "../../../../domain/skill";
import mentorService from "../../../../services/mentor-service";
import toastrService from "../../../../services/toastr-service";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";

const formatDate = (date: any) => {
  try {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    if (date instanceof Date) return date.toISOString().split("T")[0];
    return "";
  } catch (e) {
    return "";
  }
};

interface Props {
  visible: boolean;
  experiences: Experience[];
  onClose: () => void;
  onSave: (updated: Experience[]) => void;
}

const ExperienceEditModal: React.FC<Props> = ({
  visible,
  experiences,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editedExperiences, setEditedExperiences] = useState<Experience[]>([]);
  const [newExp, setNewExp] = useState({
    title: "",
    company: "",
    StartDate: "",
    EndDate: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    setEditedExperiences(experiences);
  }, [experiences]);

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

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const updated = [...editedExperiences];
    if (field === "StartDate" || field === "EndDate") {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        (updated[index] as any)[field] = parsed;
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setEditedExperiences(updated);
  };

  const deleteExperience = (index: number) => {
    const updated = [...editedExperiences];
    updated.splice(index, 1);
    setEditedExperiences(updated);
  };

  const addExperience = () => {
    if (!newExp.title || !newExp.StartDate || !newExp.EndDate) return;

    const newItem: Experience = {
      title: newExp.title,
      company: newExp.company,
      StartDate: new Date(newExp.StartDate),
      EndDate: new Date(newExp.EndDate),
      location: newExp.location,
      description: newExp.description,
      skills: [],
      createdBy: "SYSTEM",
    };

    setEditedExperiences((prev) => [...prev, newItem]);
    setNewExp({
      title: "",
      company: "",
      StartDate: "",
      EndDate: "",
      location: "",
      description: "",
    });
  };

  const saveChanges = async () => {
    const result = await mentorService.saveExperiences(
      (
        await userService.getCurrentUser()
      ).id,
      editedExperiences
    );
    if (result) {
      toastrService.success(t("experienceSaveSuccess"));
      onSave(editedExperiences);
      onClose();
    } else {
      toastrService.error(t("experienceSaveError"));
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
          <Text style={styles.modalTitle}>{t("editExperiencesTitle")}</Text>

          {/* Yeni Deneyim */}
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>{t("addNewExperience")}</Text>
            {[
              { label: t("positionTitle"), key: "title" },
              { label: t("company"), key: "company" },
              { label: t("location"), key: "location" },
              { label: t("startDate"), key: "StartDate" },
              { label: t("endDate"), key: "EndDate" },
              { label: t("description"), key: "description" },
            ].map(({ label, key }) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={label}
                placeholderTextColor="#888"
                value={(newExp as any)[key]}
                onChangeText={(text) => setNewExp({ ...newExp, [key]: text })}
              />
            ))}
            <TouchableOpacity onPress={addExperience} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ {t("add")}</Text>
            </TouchableOpacity>
          </View>

          {/* Mevcut Deneyimler */}
          <ScrollView style={{ maxHeight: 300 }}>
            {editedExperiences.map((exp, index) => (
              <View key={exp.id || index} style={styles.expItem}>
                <TextInput
                  style={styles.input}
                  placeholder={t("positionTitle")}
                  placeholderTextColor="#888"
                  value={exp.title}
                  onChangeText={(text) =>
                    updateExperience(index, "title", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("company")}
                  placeholderTextColor="#888"
                  value={exp.company ?? ""}
                  onChangeText={(text) =>
                    updateExperience(index, "company", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("location")}
                  placeholderTextColor="#888"
                  value={exp.location}
                  onChangeText={(text) =>
                    updateExperience(index, "location", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("startDate")}
                  placeholderTextColor="#888"
                  value={formatDate(exp.StartDate)}
                  onChangeText={(text) =>
                    updateExperience(index, "StartDate", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("endDate")}
                  placeholderTextColor="#888"
                  value={formatDate(exp.EndDate)}
                  onChangeText={(text) =>
                    updateExperience(index, "EndDate", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("description")}
                  placeholderTextColor="#888"
                  value={exp.description ?? ""}
                  onChangeText={(text) =>
                    updateExperience(index, "description", text)
                  }
                  multiline
                />
                <Text style={styles.skillLabel}>{t("skills")}:</Text>
                {exp.skills.length > 0 ? (
                  exp.skills.map((skill: Skill) => (
                    <Text key={skill.id} style={styles.skillItem}>
                      • {skill.name}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: "#999", marginLeft: 10 }}>
                    {t("noSkillsAdded")}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteExperience(index)}
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

export default ExperienceEditModal;

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
  expItem: {
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
  skillLabel: {
    color: "#FFD700",
    marginTop: 5,
    fontWeight: "bold",
  },
  skillItem: {
    color: "#DDD",
    fontSize: 14,
    marginLeft: 10,
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
