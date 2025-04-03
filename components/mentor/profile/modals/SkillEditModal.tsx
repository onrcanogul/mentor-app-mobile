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
import { FontAwesome } from "@expo/vector-icons";
import { Skill } from "../../../../domain/skill";
import { Experience } from "../../../../domain/experience";
import toastrService from "../../../../services/toastr-service";
import mentorService from "../../../../services/mentor-service";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  skills: Skill[];
  onClose: () => void;
  onSave: (updated: Skill[]) => void;
}

const SkillEditModal: React.FC<Props> = ({
  visible,
  skills,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editedSkills, setEditedSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    level: 1,
  });

  useEffect(() => {
    setEditedSkills(skills);
  }, [skills]);

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

  const updateSkill = (
    index: number,
    field: keyof Skill,
    value: string | number
  ) => {
    const updated = [...editedSkills];
    (updated[index] as any)[field] = value;
    setEditedSkills(updated);
  };

  const deleteSkill = (index: number) => {
    const updated = [...editedSkills];
    updated.splice(index, 1);
    setEditedSkills(updated);
  };

  const addSkill = () => {
    if (!newSkill.name) return;

    const newItem: Skill = {
      name: newSkill.name,
      description: newSkill.description,
      level: newSkill.level,
      experiences: [],
      createdBy: "SYSTEM",
    };

    setEditedSkills((prev) => [...prev, newItem]);

    setNewSkill({
      name: "",
      description: "",
      level: 1,
    });
  };

  const saveChanges = async () => {
    const result = await mentorService.saveSkills(
      (
        await userService.getCurrentUser()
      ).id,
      editedSkills
    );
    if (result) {
      toastrService.success(t("SkillSuccessSave"));
      onSave(editedSkills);
      onClose();
    } else {
      toastrService.error(t("SkillErrorSave"));
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
          <Text style={styles.modalTitle}>Yetenekleri Düzenle</Text>

          {/* Yeni Yetenek Ekleme */}
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Yeni Yetenek Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Yetenek Adı"
              placeholderTextColor="#888"
              value={newSkill.name}
              onChangeText={(text) => setNewSkill({ ...newSkill, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              placeholderTextColor="#888"
              value={newSkill.description}
              onChangeText={(text) =>
                setNewSkill({ ...newSkill, description: text })
              }
            />
            <View style={styles.starsContainer}>
              <Text style={styles.sliderLabel}>Seviye:</Text>
              <View style={{ flexDirection: "row" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setNewSkill({ ...newSkill, level: star })}
                  >
                    <FontAwesome
                      name={star <= newSkill.level ? "star" : "star-o"}
                      size={24}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={addSkill} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Mevcut Yetenekler */}
          <ScrollView style={{ maxHeight: 300 }}>
            {editedSkills.map((skill, index) => (
              <View key={skill.id || index} style={styles.skillItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Yetenek Adı"
                  placeholderTextColor="#888"
                  value={skill.name}
                  onChangeText={(text) => updateSkill(index, "name", text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Açıklama"
                  placeholderTextColor="#888"
                  value={skill.description ?? ""}
                  onChangeText={(text) =>
                    updateSkill(index, "description", text)
                  }
                />
                <View style={styles.starsContainer}>
                  <Text style={styles.sliderLabel}>Seviye:</Text>
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => updateSkill(index, "level", star)}
                      >
                        <FontAwesome
                          name={star <= skill.level ? "star" : "star-o"}
                          size={24}
                          color="#FFD700"
                          style={{ marginRight: 4 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Text style={styles.label}>İlgili Deneyimler:</Text>
                {skill.experiences?.length > 0 ? (
                  skill.experiences.map((exp: Experience) => (
                    <Text key={exp.id} style={styles.experienceItem}>
                      • {exp.company} - {exp.title}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: "#999", marginLeft: 10 }}>
                    Deneyim bağlantısı yok.
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSkill(index)}
                >
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Kaydet / İptal */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveChanges} style={styles.saveButton}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SkillEditModal;

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
  skillItem: {
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
  label: {
    color: "#FFD700",
    fontWeight: "bold",
    marginTop: 5,
  },
  experienceItem: {
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
  starsContainer: {
    marginBottom: 15,
  },
  sliderLabel: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 5,
  },
});
