import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Card, Text, Chip, IconButton } from "react-native-paper";

interface BadgeListProps {
  badges: { name: string }[];
  onEdit: () => void;
}

const BadgeList: React.FC<BadgeListProps> = ({ badges, onEdit }) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 {t("badges")}</Text>
        <IconButton
          icon="pencil"
          size={20}
          iconColor="#FFD700"
          onPress={onEdit}
        />
      </View>

      <View style={styles.chipContainer}>
        {badges.length > 0 ? (
          badges.map((badge, index) => (
            <Chip key={index} style={styles.chip}>
              {badge.name}
            </Chip>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz rozet eklenmedi.</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#3A3A3A",
    margin: 4,
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
  },
});

export default BadgeList;
