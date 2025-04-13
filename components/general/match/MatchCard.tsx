import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MatchStatus } from "../../../domain/match";
import { useTranslation } from "react-i18next";

const MatchCard = ({ match, setLoading, isLoading }: any) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const renderStatusChip = (status: MatchStatus) => {
    const color =
      status === MatchStatus.Accepted
        ? "#00FF99"
        : status === MatchStatus.Pending
        ? "#FFD700"
        : "#FF6B6B";
    const label =
      status === MatchStatus.Accepted
        ? t("matched")
        : status === MatchStatus.Pending
        ? t("waiting")
        : t("ended");
    return (
      <Chip style={{ backgroundColor: color, marginTop: 5 }}>{label}</Chip>
    );
  };

  return (
    <Card
      key={match.id}
      style={[styles.card, match.status === "Closed" && styles.closedCard]}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          navigation.navigate("Mentor", {
            mentorId: match.receiver.id,
          })
        }
      >
        <Image
          source={{
            uri: "https://ui-avatars.com/api/?name=" + match.sender.username,
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{match.receiver?.username}</Text>
          <Text style={styles.field}>{match.receiver?.username}</Text>
          {renderStatusChip(match.status)}
        </View>
      </TouchableOpacity>

      <Text style={styles.bio}>
        {".Net Core ile API geliştirmenize yardımcı olabilirim"}
      </Text>

      {match.status === MatchStatus.Accepted && (
        <TouchableOpacity
          style={styles.activeButton}
          onPress={() =>
            navigation.navigate("MenteeChat", {
              chatId: match.chatId,
            })
          }
        >
          <View style={styles.buttonContent}>
            <Text style={styles.newChatText}>{t("goToChat")}</Text>
          </View>
        </TouchableOpacity>
      )}
      {match.status === MatchStatus.Pending && (
        <TouchableOpacity style={styles.waitingButton}>
          <View style={styles.buttonContent}>
            <Text style={styles.newChatText}>{t("waiting")}</Text>
          </View>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  closedCard: {
    backgroundColor: "#2A2A2A",
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  field: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 5,
  },
  bio: {
    color: "#CCCCCC",
    marginVertical: 10,
  },
  activeButton: {
    backgroundColor: "#FFD700",
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  waitingButton: {
    backgroundColor: "#C4B454",
    opacity: 0.8,
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  newChatText: {
    color: "#121212",
    fontWeight: "bold",
  },
});

export default MatchCard;
