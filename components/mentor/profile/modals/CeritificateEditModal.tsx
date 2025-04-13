import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { Certificate } from "../../../../domain/certificate";
import toastrService from "../../../../services/toastr-service";
import mentorService from "../../../../services/mentor-service";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../contexts/ThemeContext";
import BaseEditModal from "../../../common/BaseEditModal";
import Animated, { FadeInDown } from "react-native-reanimated";

interface CertificateEditModalProps {
  visible: boolean;
  certificates: Certificate[];
  onClose: () => void;
  onSave: (updated: Certificate[]) => void;
}

const CertificateEditModal: React.FC<CertificateEditModalProps> = ({
  visible,
  certificates,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [editedCertificates, setEditedCertificates] = useState<Certificate[]>(
    []
  );
  const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({
    name: "",
    description: "",
    from: "",
    skills: [],
  });

  useEffect(() => {
    setEditedCertificates(certificates);
  }, [certificates]);

  const handleSave = async () => {
    try {
      const userId = (await userService.getCurrentUser()).id;
      const result = await mentorService.saveCertificates(
        userId,
        editedCertificates
      );

      if (result) {
        toastrService.success(t("certificateSaveSuccess"));
        onSave(editedCertificates);
        onClose();
      } else {
        toastrService.error(t("certificateSaveError"));
      }
    } catch (error) {
      toastrService.error(t("certificateSaveError"));
    }
  };

  const handleAddCertificate = () => {
    if (newCertificate.name) {
      const certificate: Certificate = {
        id: Date.now().toString(),
        name: newCertificate.name,
        description: newCertificate.description,
        from: newCertificate.from,
        skills: [],
        createdBy: "USER",
      };

      setEditedCertificates([...editedCertificates, certificate]);
      setNewCertificate({
        name: "",
        description: "",
        from: "",
        skills: [],
      });
    }
  };

  const handleDeleteCertificate = (index: number) => {
    const updated = [...editedCertificates];
    updated.splice(index, 1);
    setEditedCertificates(updated);
  };

  return (
    <BaseEditModal
      visible={visible}
      onClose={onClose}
      title={t("editCertificate")}
      onSave={handleSave}
      saveDisabled={editedCertificates.length === 0}
    >
      <View style={styles.container}>
        <View style={styles.addSection}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("certificateName")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newCertificate.name}
            onChangeText={(text) =>
              setNewCertificate({ ...newCertificate, name: text })
            }
          />
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("description")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newCertificate.description}
            onChangeText={(text) =>
              setNewCertificate({ ...newCertificate, description: text })
            }
            multiline
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("from")}
            placeholderTextColor={theme.colors.input.placeholder}
            value={newCertificate.from}
            onChangeText={(text) =>
              setNewCertificate({ ...newCertificate, from: text })
            }
          />

          <IconButton
            icon="plus-circle"
            size={50}
            iconColor={theme.colors.primary.main}
            onPress={handleAddCertificate}
            disabled={!newCertificate.name}
            style={[styles.addButton, !newCertificate.name && { opacity: 0.5 }]}
          />
        </View>

        <View style={styles.certificatesList}>
          {editedCertificates.map((certificate, index) => (
            <Animated.View
              key={certificate.id}
              entering={FadeInDown.delay(index * 50)}
              style={[
                styles.certificateItem,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <View style={styles.certificateHeader}>
                <Text
                  style={[
                    styles.certificateName,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {certificate.name}
                </Text>
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.text.secondary}
                  onPress={() => handleDeleteCertificate(index)}
                />
              </View>

              {certificate.description && (
                <Text
                  style={[
                    styles.certificateDescription,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {certificate.description}
                </Text>
              )}

              <Text
                style={[
                  styles.certificateFrom,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {certificate.from}
              </Text>
            </Animated.View>
          ))}
        </View>
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
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  addButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  certificatesList: {
    gap: 12,
  },
  certificateItem: {
    padding: 16,
    borderRadius: 12,
  },
  certificateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  certificateName: {
    fontSize: 16,
    fontWeight: "600",
  },
  certificateDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  certificateFrom: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default CertificateEditModal;
