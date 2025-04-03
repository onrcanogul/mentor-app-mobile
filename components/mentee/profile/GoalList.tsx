import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import { Goal } from "../../../domain/goal";
import { useTranslation } from "react-i18next";

interface GoalListProps {
  goals: Goal[];
  onEdit: () => void;
  isOwn: boolean;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, isOwn }) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("goals")}</Text>
        {isOwn ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      {goals.map((goal, index) => (
        <Text key={index} style={styles.listItem}>
          • {goal.text}
        </Text>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    margin: 15,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  listItem: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 5,
  },
});

export default GoalList;
