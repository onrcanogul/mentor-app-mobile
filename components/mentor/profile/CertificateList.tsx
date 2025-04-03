import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { Card, IconButton } from "react-native-paper";

const CertificateList = ({ certificates, onEdit, isOwn }: any) => {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>📜 {t("certificates")}</Text>
        {isOwn === true ? (
          <IconButton icon="pencil" iconColor="#FFD700" onPress={onEdit} />
        ) : (
          <></>
        )}
      </View>
      <View>
        {certificates.length > 0 ? (
          certificates.map((cert: any, index: number) => (
            <Text key={index} style={styles.item}>
              {cert.name} - {cert.from}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>{t("certificateNotAdded")}</Text>
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
    borderRadius: 10,
    padding: 15,
  },
  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "bold", color: "#E0E0E0" },
  item: { color: "#A0A0A0", marginBottom: 5 },
  emptyText: { color: "#A0A0A0", fontStyle: "italic" },
});

export default CertificateList;
