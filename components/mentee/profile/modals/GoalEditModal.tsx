import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Platform,
} from "react-native";
import { Text, Button, IconButton } from "react-native-paper";
import { Goal } from "../../../../domain/goal";
import menteeService from "../../../../services/mentee-service";
import * as SystemUI from "expo-system-ui";
import userService from "../../../../services/user-service";

interface GoalsEditModalProps {
  visible: boolean;
  onClose: () => void;
  goals: Goal[];
  onSave: (updatedGoals: Goal[]) => void;
}

const GoalsEditModal: React.FC<GoalsEditModalProps> = ({
  visible,
  onClose,
  goals,
  onSave,
}) => {
  const [updatedGoals, setUpdatedGoals] = useState<Goal[]>(goals);
  const [newGoalText, setNewGoalText] = useState<string>("");
  const [newTargetDate, setNewTargetDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const addGoal = async () => {
    if (newGoalText.trim()) {
      const id = (await userService.getCurrentUser()).id;
      console.log(id);
      const response = await menteeService.addGoal({
        text: newGoalText,
        targetDate: newTargetDate,
        userId: id,
        createdBy: "SYSTEM",
        isDeleted: false,
      });

      if (response !== undefined) {
        const newList = [...updatedGoals, response];
        setUpdatedGoals(newList);
        setNewGoalText("");
        setNewTargetDate(new Date());
        onSave(newList);
      }
    }
  };

  const removeGoal = async (id: string) => {
    const response = await menteeService.removeGoal(id);

    if (response !== undefined) {
      const newList = updatedGoals.filter((x) => x.id !== id);
      setUpdatedGoals(newList);
      onSave(newList);
    }
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTargetDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Hedefleri Düzenle</Text>

          <FlatList
            data={updatedGoals}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <View style={styles.goalItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalText}>{item.text}</Text>
                  <Text style={styles.goalDate}>
                    {new Date(item.targetDate).toLocaleDateString()}
                  </Text>
                </View>
                <IconButton icon="delete" onPress={() => removeGoal(item.id)} />
              </View>
            )}
          />

          <TextInput
            style={styles.input}
            placeholder="Yeni hedef yaz..."
            placeholderTextColor="#A0A0A0"
            value={newGoalText}
            onChangeText={setNewGoalText}
          />

          {/* <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              Tarih Seç: {newTargetDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={newTargetDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )} */}

          <Button onPress={addGoal} style={styles.addButton}>
            Ekle
          </Button>

          <View style={styles.actions}>
            <Button textColor="#FFD700" onPress={onClose}>
              Kapat
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
    width: "95%",
    maxHeight: "85%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFD700",
    marginBottom: 10,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  goalText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  goalDate: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    backgroundColor: "#2C2C2C",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  dateButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#2C2C2C",
    borderRadius: 5,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  addButton: {
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
});

export default GoalsEditModal;
