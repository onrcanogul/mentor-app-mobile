import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, IconButton } from "react-native-paper";
import { Goal } from "../../../../domain/goal";
import menteeService from "../../../../services/mentee-service";
import userService from "../../../../services/user-service";
import toastrService from "../../../../services/toastr-service";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../contexts/ThemeContext";
import Animated, { FadeInUp } from "react-native-reanimated";
import BaseEditModal from "../../../common/BaseEditModal";

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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [editedGoals, setEditedGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");

  useEffect(() => {
    setEditedGoals(goals);
  }, [goals]);

  const addGoal = async () => {
    if (newGoalText.trim()) {
      try {
        const user = await userService.getCurrentUser();
        const newGoal = {
          text: newGoalText.trim(),
          targetDate: new Date(),
          userId: user.id,
          createdBy: "USER",
        };

        const result = await menteeService.addGoal(newGoal);

        if (result) {
          const updatedGoals = [...editedGoals, result];
          setEditedGoals(updatedGoals);
          setNewGoalText("");
          onSave(updatedGoals);
          toastrService.success(t("goalAddSuccess"));
        } else {
          toastrService.error(t("goalAddError"));
        }
      } catch (error) {
        toastrService.error(t("goalAddError"));
      }
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const result = await menteeService.removeGoal(goalId);

      if (result) {
        const updatedGoals = editedGoals.filter((g) => g.id !== goalId);
        setEditedGoals(updatedGoals);
        onSave(updatedGoals);
        toastrService.success(t("goalDeleteSuccess"));
      } else {
        toastrService.error(t("goalDeleteError"));
      }
    } catch (error) {
      toastrService.error(t("goalDeleteError"));
    }
  };

  return (
    <BaseEditModal
      visible={visible}
      onClose={onClose}
      title={t("editGoalsTitle")}
      onSave={onClose}
      saveDisabled={false}
    >
      <View style={styles.container}>
        <View style={styles.addSection}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            placeholder={t("newGoalPlaceholder")}
            placeholderTextColor={theme.colors.text.disabled}
            value={newGoalText}
            onChangeText={setNewGoalText}
            onSubmitEditing={addGoal}
            returnKeyType="done"
          />
          <IconButton
            icon="plus"
            mode="contained"
            containerColor={theme.colors.primary.main}
            iconColor={theme.colors.primary.contrastText}
            size={24}
            onPress={addGoal}
            style={styles.addButton}
            disabled={!newGoalText.trim()}
          />
        </View>

        <View style={styles.goalsList}>
          {editedGoals.map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInUp.delay(index * 50)}
              style={[
                styles.goalItem,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <Text
                style={[styles.goalText, { color: theme.colors.text.primary }]}
              >
                {goal.text}
              </Text>
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.text.secondary}
                onPress={() => deleteGoal(goal.id!)}
              />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addButton: {
    margin: 0,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  goalText: {
    flex: 1,
    fontSize: 16,
  },
});

export default GoalsEditModal;
