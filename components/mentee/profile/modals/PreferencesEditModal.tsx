import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  BackHandler,
  Platform,
} from "react-native";
import { Text, Button, IconButton } from "react-native-paper";
import * as SystemUI from "expo-system-ui";

interface PreferencesEditModalProps {
  visible: boolean;
  onClose: () => void;
  preferences: string[];
  onSave: (updatedPreferences: string[]) => void;
}

const PreferencesEditModal: React.FC<PreferencesEditModalProps> = ({
  visible,
  onClose,
  preferences,
  onSave,
}) => {
  const [updatedPreferences, setUpdatedPreferences] =
    useState<string[]>(preferences);
  const [newPreference, setNewPreference] = useState<string>("");

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
      SystemUI.setBackgroundColorAsync("#121212");
    }
  }, [visible]);

  const addPreference = () => {
    if (newPreference.trim()) {
      setUpdatedPreferences([...updatedPreferences, newPreference.trim()]);
      setNewPreference("");
    }
  };

  const removePreference = (index: number) => {
    const newList = [...updatedPreferences];
    newList.splice(index, 1);
    setUpdatedPreferences(newList);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Tercihleri Düzenle</Text>

          <FlatList
            data={updatedPreferences}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemText}>{item}</Text>
                <IconButton
                  icon="delete"
                  onPress={() => removePreference(index)}
                />
              </View>
            )}
          />

          <TextInput
            style={styles.input}
            placeholder="Yeni tercih ekle..."
            placeholderTextColor="#A0A0A0"
            value={newPreference}
            onChangeText={setNewPreference}
          />

          <Button onPress={addPreference} style={styles.addButton}>
            Ekle
          </Button>

          <View style={styles.actions}>
            <Button textColor="#FFD700" onPress={onClose}>
              İptal
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                onSave(updatedPreferences);
                onClose();
              }}
              buttonColor="#FFD700"
              textColor="#000"
            >
              Kaydet
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1E1E1E",
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFD700",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  itemText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#2C2C2C",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addButton: {
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default PreferencesEditModal;
