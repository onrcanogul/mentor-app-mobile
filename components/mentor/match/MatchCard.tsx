import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Match, MatchStatus } from "../../../domain/match";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../contexts/ThemeContext";
import Animated, {
  FadeInRight,
  Layout,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import matchService from "../../../services/match-service";

const { width } = Dimensions.get("window");
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type RootStackParamList = {
  Mentor: { mentorId: string };
  Chat: { chatId: string };
  MentorChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MatchCardProps {
  match: Match;
  index?: number;
  onAccept?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
  setMatches?: any;
  setLoading?: any;
  isLoading?: boolean;
}

const MatchCard = ({
  match,
  index = 0,
  onAccept,
  onReject,
  setMatches,
  setLoading,
  isLoading,
}: MatchCardProps) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPressIn = () => {
    scale.value = withSpring(0.98);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Accepted:
        return "#2563eb"; // Modern blue for matched status
      case MatchStatus.Pending:
        return theme.colors.primary.main;
      default:
        return theme.colors.error.main;
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Accepted:
        return t("match.status.accepted");
      case MatchStatus.Pending:
        return t("match.status.pending");
      default:
        return t("match.status.rejected");
    }
  };

  const renderStatusChip = (status: MatchStatus) => {
    return (
      <Chip
        style={[styles.statusChip, { backgroundColor: getStatusColor(status) }]}
      >
        <Text style={[styles.chipText, { color: theme.colors.text.primary }]}>
          {getStatusLabel(status)}
        </Text>
      </Chip>
    );
  };

  const handleAccept = async () => {
    if (!setLoading || !setMatches) return;
    setLoading(true);
    await matchService.accept(
      match.id,
      () => {
        setMatches((prev: Match[]) =>
          prev.map((m) =>
            m.id === match.id ? { ...m, status: MatchStatus.Accepted } : m
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
  };

  const handleReject = async () => {
    if (!setLoading || !setMatches) return;
    setLoading(true);
    await matchService.reject(
      match.id,
      () => {
        setMatches((prev: Match[]) =>
          prev.map((m) =>
            m.id === match.id ? { ...m, status: MatchStatus.Rejected } : m
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
  };

  return (
    <AnimatedCard
      entering={FadeInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background.secondary,
          opacity: match.status === MatchStatus.Rejected ? 0.6 : 1,
        },
        animatedStyle,
      ]}
    >
      <AnimatedTouchable
        style={styles.row}
        onPress={() =>
          navigation.navigate("Mentor", { mentorId: match.sender.id })
        }
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Image
          source={{
            uri: "https://ui-avatars.com/api/?name=" + match.sender.username,
          }}
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: theme.colors.text.primary }]}>
            {match.sender?.username}
          </Text>
          <Text style={[styles.field, { color: theme.colors.text.secondary }]}>
            {match.sender?.email}
          </Text>
          {renderStatusChip(match.status)}
        </View>
      </AnimatedTouchable>

      {match.status === MatchStatus.Accepted && (
        <AnimatedTouchable
          style={[
            styles.actionButton,
            {
              backgroundColor: "#2563eb",
              marginTop: 12,
            },
          ]}
          onPress={() =>
            navigation.navigate("MentorChat", { chatId: match.chatId })
          }
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              {t("match.actions.openChat")}
            </Text>
          </View>
        </AnimatedTouchable>
      )}

      {match.status === MatchStatus.Pending && (
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            style={[
              styles.actionButton,
              styles.acceptButton,
              {
                backgroundColor: "#2563eb", // Modern blue
                marginRight: 8,
              },
            ]}
            onPress={handleAccept}
          >
            <View style={styles.buttonContent}>
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                {t("accept")}
              </Text>
            </View>
          </AnimatedTouchable>
          <AnimatedTouchable
            style={[
              styles.actionButton,
              styles.rejectButton,
              {
                backgroundColor: "#e5e7eb", // Soft gray
                marginLeft: 8,
              },
            ]}
            onPress={handleReject}
          >
            <View style={styles.buttonContent}>
              <Text style={[styles.buttonText, { color: "#222" }]}>
                {t("reject")}
              </Text>
            </View>
          </AnimatedTouchable>
        </View>
      )}
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  field: {
    fontSize: 14,
    marginBottom: 8,
  },
  bio: {
    marginVertical: 12,
    fontSize: 15,
    lineHeight: 20,
  },
  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    elevation: 2,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  acceptButton: {},
  rejectButton: {},
});

export default MatchCard;
