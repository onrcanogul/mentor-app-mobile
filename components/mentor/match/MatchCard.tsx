import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Match, MatchStatus } from "../../../domain/match";
import matchService from "../../../services/match-service";
import toastrService from "../../../services/toastr-service";
import LoadingSpinner from "../../../utils/spinner";
import { useTranslation } from "react-i18next";

interface MatchCardProps {
  match: Match;
  setMatches: any;
  setLoading: any;
  isLoading: boolean;
}

const MatchCard = ({
  match,
  setMatches,
  setLoading,
  isLoading,
}: MatchCardProps) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleAccept = async (id: string) => {
    setLoading(true);
    await matchService.accept(
      id,
      () => {
        toastrService.success(t("matchAccepted"));
        setMatches((prevMatches: Match[]) =>
          prevMatches.map((match) =>
            match.id === id ? { ...match, status: 1 } : match
          )
        );
      },
      () => {
        toastrService.error(t("matchRejected"));
      }
    );
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    await matchService.reject(
      id,
      () => {
        toastrService.success(t("matchRejected"));
        setMatches((prevMatches: Match[]) =>
          prevMatches.map((match) =>
            match.id === id ? { ...match, status: 2 } : match
          )
        );
      },
      () => {}
    );
    setLoading(false);
  };

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
    <>
      <Card
        style={[styles.card, match.status === "Closed" && styles.closedCard]}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            console.log(match);
            console.log("*****************");
            navigation.navigate("Mentee", {
              menteeId: match.inexperiencedUser.id,
            });
          }}
        >
          <Image
            source={{
              uri:
                "https://ui-avatars.com/api/?name=" +
                match.inexperiencedUser.username,
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{match.experiencedUser.username}</Text>
            <Text style={styles.field}>{match.experiencedUser.username}</Text>
            {renderStatusChip(match.status)}
          </View>
        </TouchableOpacity>

        <Text style={styles.bio}>
          {".Net Core ile API projeleri yapıyorum"}
        </Text>

        {match.status === MatchStatus.Accepted && (
          <TouchableOpacity
            style={styles.activeButton}
            onPress={() =>
              navigation.navigate("MentorChat", {
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
          <>
            <Button
              mode="contained"
              labelStyle={{ color: "black" }}
              style={styles.acceptButton}
              onPress={() => handleAccept(match.id!)}
            >
              {t("accept")}
            </Button>
            <Button
              style={styles.rejectButton}
              labelStyle={{ color: "black" }}
              onPress={() => handleReject(match.id!)}
            >
              {t("reject")}
            </Button>
          </>
        )}
      </Card>
    </>
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
  acceptButton: {
    backgroundColor: "#FFD700",
    marginBottom: 3,
  },
  rejectButton: {
    backgroundColor: "#A0A0A0",
    marginBottom: 3,
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
