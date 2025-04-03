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
import { Certificate } from "../../../../domain/certificate";
import mentorService from "../../../../services/mentor-service";
import toastrService from "../../../../services/toastr-service";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  certificates: Certificate[];
  onClose: () => void;
  onSave: (updated: Certificate[]) => void;
}

const CertificateEditModal: React.FC<Props> = ({
  visible,
  certificates,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editedCertificates, setEditedCertificates] = useState<Certificate[]>(
    []
  );
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newFrom, setNewFrom] = useState("");

  useEffect(() => {
    setEditedCertificates(certificates);
  }, [certificates]);

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

  const updateCertificate = (
    index: number,
    field: keyof Certificate,
    value: string
  ) => {
    const updated = [...editedCertificates];
    (updated[index] as any)[field] = value;
    setEditedCertificates(updated);
  };

  const deleteCertificate = (index: number) => {
    const updated = [...editedCertificates];
    updated.splice(index, 1);
    setEditedCertificates(updated);
  };

  const addCertificate = () => {
    if (!newName.trim()) return;

    const newCert: Certificate = {
      name: newName,
      description: newDescription,
      icon: newIcon,
      from: newFrom,
      skills: [],
      createdBy: "SYSTEM",
    };
    setEditedCertificates((prev) => [...prev, newCert]);

    setNewName("");
    setNewDescription("");
    setNewIcon("");
    setNewFrom("");
  };

  const saveChanges = async () => {
    const result = await mentorService.saveCertificates(
      (
        await userService.getCurrentUser()
      ).id,
      editedCertificates
    );

    if (result) {
      toastrService.success(t("certificateSuccessSave"));
      onSave(editedCertificates);
      onClose();
    } else {
      toastrService.error(t("certificateErrorSave"));
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
          <Text style={styles.modalTitle}>Sertifikaları Düzenle</Text>

          {/* Yeni Sertifika Ekleme Alanı */}
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Yeni Sertifika Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="certificateName"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="description"
              placeholderTextColor="#888"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="İkon URL"
              placeholderTextColor="#888"
              value={newIcon}
              onChangeText={setNewIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="company"
              placeholderTextColor="#888"
              value={newFrom}
              onChangeText={setNewFrom}
            />
            <TouchableOpacity onPress={addCertificate} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Mevcut Sertifikalar */}
          <ScrollView style={{ maxHeight: 300 }}>
            {editedCertificates.map((cert, index) => (
              <View key={cert.id || index} style={styles.certItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Sertifika Adı"
                  placeholderTextColor="#888"
                  value={cert.name}
                  onChangeText={(text) =>
                    updateCertificate(index, "name", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Açıklama"
                  placeholderTextColor="#888"
                  value={cert.description ?? ""}
                  onChangeText={(text) =>
                    updateCertificate(index, "description", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="İkon URL"
                  placeholderTextColor="#888"
                  value={cert.icon ?? ""}
                  onChangeText={(text) =>
                    updateCertificate(index, "icon", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Kuruluş"
                  placeholderTextColor="#888"
                  value={cert.from}
                  onChangeText={(text) =>
                    updateCertificate(index, "from", text)
                  }
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCertificate(index)}
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

export default CertificateEditModal;

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
  certItem: {
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
