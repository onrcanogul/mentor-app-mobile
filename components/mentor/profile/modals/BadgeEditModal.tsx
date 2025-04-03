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
import { Badge } from "../../../../domain/badge";
import { Skill } from "../../../../domain/skill";
import changeNavigationBarColor from "react-native-navigation-bar-color";

interface Props {
  visible: boolean;
  badges: Badge[];
  onClose: () => void;
  onSave: (updated: Badge[]) => void;
}

const BadgeEditModal: React.FC<Props> = ({
  visible,
  badges,
  onClose,
  onSave,
}) => {
  const [editedBadges, setEditedBadges] = useState<Badge[]>(badges);

  const updateBadge = (index: number, field: keyof Badge, value: string) => {
    const updated = [...editedBadges];
    (updated[index] as any)[field] = value;
    setEditedBadges(updated);
  };

  const saveChanges = () => {
    onSave(editedBadges);
    onClose();
  };

  // ✅ Android geri tuşu kontrolü
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

  // ✅ Navigation bar rengini düzelt
  useEffect(() => {
    if (visible && Platform.OS === "android") {
      // changeNavigationBarColor("#121212", false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Rozetleri Düzenle</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {editedBadges.map((badge, index) => (
              <View key={badge.id || index} style={styles.badgeItem}>
                <TextInput
                  style={styles.input}
                  placeholder="Rozet Adı"
                  placeholderTextColor="#888"
                  value={badge.name}
                  onChangeText={(text) => updateBadge(index, "name", text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Açıklama"
                  placeholderTextColor="#888"
                  value={badge.description}
                  onChangeText={(text) =>
                    updateBadge(index, "description", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="İkon URL"
                  placeholderTextColor="#888"
                  value={badge.icon}
                  onChangeText={(text) => updateBadge(index, "icon", text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Kaynak (from)"
                  placeholderTextColor="#888"
                  value={badge.from}
                  onChangeText={(text) => updateBadge(index, "from", text)}
                />
                <Text style={styles.skillLabel}>Yetenekler:</Text>
                {badge.skills.map((skill: Skill) => (
                  <Text key={skill.id} style={styles.skillItem}>
                    • {skill.name}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
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

export default BadgeEditModal;

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
  badgeItem: {
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
