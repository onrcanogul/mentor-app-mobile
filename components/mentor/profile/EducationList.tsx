import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";

const EducationList = ({ educations, onEdit, isOwn }: any) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 {t("educations")}</Text>
        {isOwn === true ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      <View>
        {educations.length > 0 ? (
          educations.map((edu: any, index: number) => (
            <Text key={index} style={styles.item}>
              {edu.degree} - {edu.school}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>Eğitim bilgisi yok.</Text>
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

export default EducationList;
