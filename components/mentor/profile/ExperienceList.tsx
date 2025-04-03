import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, IconButton } from "react-native-paper";
import { formatDate } from "../../../utils/dateFormatter";
import { useTranslation } from "react-i18next";

const ExperienceList = ({ experiences, onEdit, isOwn }: any) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>💼 {t("experiences")}</Text>
        {isOwn === true ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      <View>
        {experiences.length > 0 ? (
          experiences.map((exp: any, index: number) => (
            <Text key={index} style={styles.item}>
              {exp.position} - {exp.company} ({formatDate(exp.startDate)} -{" "}
              {formatDate(exp.endDate)})
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>Deneyim bilgisi yok.</Text>
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
  item: { color: "#A0A0A0", marginBottom: 5 },
  emptyText: { color: "#A0A0A0", fontStyle: "italic" },
});

export default ExperienceList;
