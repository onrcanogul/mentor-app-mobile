import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, IconButton, Chip } from "react-native-paper";
import { Skill } from "../../../domain/skill";
import { useTranslation } from "react-i18next";

const SkillList = ({ skills, onEdit, isOwn }: any) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>💎 {t("skills")} </Text>
        {isOwn === true ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      <View style={styles.chipContainer}>
        {skills.length > 0 ? (
          skills.map((skill: Skill, index: number) => (
            <Chip key={index} style={styles.chip}>
              {skill.name} - {skill.level}
            </Chip>
          ))
        ) : (
          <Text style={styles.emptyText}>Yetenek bilgisi eklenmemiş.</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 15,
    marginTop: 0,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "bold", color: "#E0E0E0" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  chip: { backgroundColor: "#3A3A3A", margin: 4 },
  emptyText: { color: "#A0A0A0", fontStyle: "italic" },
});

export default SkillList;
