import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import { Contact } from "../../../domain/contact";
import { useTranslation } from "react-i18next";

interface ContactInfoProps {
  contact: Contact;
  onEdit: () => void;
  isOwn: boolean;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  onEdit,
  isOwn,
}) => {
  const { t } = useTranslation();
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("contact")}</Text>
      </View>
      <Text style={styles.listItem}>📧 {contact.email}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    margin: 15,
    marginTop: 0,
    marginBottom: 10,
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

export default ContactInfo;
