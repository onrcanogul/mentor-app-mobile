import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, IconButton, Surface } from "react-native-paper";
import { Skill } from "../../../../domain/skill";
import toastrService from "../../../../services/toastr-service";
import mentorService from "../../../../services/mentor-service";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { useTheme } from "../../../../contexts/ThemeContext";
import BaseEditModal from "../../../common/BaseEditModal";

interface SkillEditModalProps {
  visible: boolean;
  skills: Skill[];
  onClose: () => void;
  onSave: (updated: Skill[]) => void;
}

const SkillEditModal: React.FC<SkillEditModalProps> = ({
  visible,
  skills,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [editedSkills, setEditedSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: "",
    description: "",
    level: 50,
  });

  useEffect(() => {
    setEditedSkills(skills);
  }, [skills]);

  const handleSave = async () => {
    try {
      const userId = (await userService.getCurrentUser()).id;
      const result = await mentorService.saveSkills(userId, editedSkills);

      if (result) {
        toastrService.success(t("skillSaveSuccess"));
        onSave(editedSkills);
        onClose();
      } else {
        toastrService.error(t("skillSaveError"));
      }
    } catch (error) {
      toastrService.error(t("skillSaveError"));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.name) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        description: newSkill.description,
        level: newSkill.level || 50,
        experiences: [],
        createdBy: "USER",
      };

      setEditedSkills([...editedSkills, skill]);
      setNewSkill({
        name: "",
        description: "",
        level: 50,
      });
    }
  };

  const handleDeleteSkill = (index: number) => {
    const updated = [...editedSkills];
    updated.splice(index, 1);
    setEditedSkills(updated);
  };

  return (
    <BaseEditModal
      visible={visible}
      onClose={onClose}
      title={t("editSkills")}
      onSave={handleSave}
      saveDisabled={editedSkills.length === 0}
    >
      <View style={styles.container}>
        <Surface
          style={[
            styles.addSection,
            { backgroundColor: theme.colors.card.background },
          ]}
        >
          <TextInput
            mode="outlined"
            label={t("skill.name")}
            value={newSkill.name}
            onChangeText={(name) => setNewSkill({ ...newSkill, name })}
            style={styles.input}
            outlineColor={theme.colors.input.border}
            activeOutlineColor={theme.colors.primary.main}
            textColor={theme.colors.text.primary}
            placeholderTextColor={theme.colors.text.disabled}
          />
          <TextInput
            mode="outlined"
            label={t("skill.description")}
            value={newSkill.description}
            onChangeText={(description) =>
              setNewSkill({ ...newSkill, description })
            }
            style={styles.input}
            multiline
            numberOfLines={3}
            outlineColor={theme.colors.input.border}
            activeOutlineColor={theme.colors.primary.main}
            textColor={theme.colors.text.primary}
            placeholderTextColor={theme.colors.text.disabled}
          />

          <View style={styles.sliderContainer}>
            <Text
              style={[styles.sliderLabel, { color: theme.colors.text.primary }]}
            >
              {t("skill.level")}: {newSkill.level}%
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={newSkill.level}
              onValueChange={(level) => setNewSkill({ ...newSkill, level })}
              minimumTrackTintColor={theme.colors.primary.main}
              maximumTrackTintColor={theme.colors.text.disabled}
              thumbTintColor={theme.colors.primary.main}
            />
          </View>

          <IconButton
            icon="plus-circle"
            size={50}
            iconColor={theme.colors.primary.main}
            onPress={handleAddSkill}
            disabled={!newSkill.name}
            style={[styles.addButton, !newSkill.name && { opacity: 0.5 }]}
            accessibilityLabel={t("skill.add")}
          />
        </Surface>

        <View style={styles.skillsList}>
          {editedSkills.map((skill, index) => (
            <Animated.View
              key={skill.id}
              entering={FadeInDown.delay(index * 50)}
              style={[
                styles.skillItem,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <View style={styles.skillHeader}>
                <Text
                  style={[
                    styles.skillName,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {skill.name}
                </Text>
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.text.secondary}
                  onPress={() => handleDeleteSkill(index)}
                />
              </View>

              {skill.description && (
                <Text
                  style={[
                    styles.skillDescription,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {skill.description}
                </Text>
              )}

              <View style={styles.skillLevelContainer}>
                <View
                  style={[
                    styles.skillLevelBar,
                    {
                      backgroundColor: theme.colors.text.disabled,
                      width: "100%",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.skillLevelFill,
                      {
                        backgroundColor: theme.colors.primary.main,
                        width: `${skill.level}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.skillLevelText,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {skill.level}%
                </Text>
              </View>
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
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  addButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  skillsList: {
    gap: 12,
  },
  skillItem: {
    padding: 16,
    borderRadius: 12,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillName: {
    fontSize: 16,
    fontWeight: "600",
  },
  skillDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  skillLevelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  skillLevelBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  skillLevelFill: {
    height: "100%",
  },
  skillLevelText: {
    fontSize: 12,
    minWidth: 35,
    textAlign: "right",
  },
});

export default SkillEditModal;
