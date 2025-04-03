import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

const MeetingStats = ({ count }: { count: number }) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("numberOfMeeting")}</Text>
      </View>
      <Text style={styles.statNumber}>{count}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    margin: 15,
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 10,
  },
});

export default MeetingStats;
