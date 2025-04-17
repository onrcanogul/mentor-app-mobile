import React, { useEffect, useState } from "react";
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
import userService from "../../../services/user-service";
import matchService from "../../../services/match-service";

const { width } = Dimensions.get("window");
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type RootStackParamList = {
  Mentor: { mentorId: string };
  Chat: { chatId: string };
  GeneralChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MatchCardProps {
  match: Match;
  index?: number;
  setLoading?: (loading: boolean) => void;
  isLoading?: boolean;
  setMatches?: React.Dispatch<React.SetStateAction<Match[]>>;
  isIncoming: boolean;
}

const MatchCard = ({
  match,
  index = 0,
  setLoading,
  isLoading,
  setMatches,
  isIncoming,
}: MatchCardProps) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const scale = useSharedValue(1);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await userService.getCurrentUser();
      setCurrentUserId(user.id);
    };
    fetchCurrentUser();
  }, []);

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

  const handleAccept = async () => {
    if (!setLoading || !setMatches) return;
    setLoading(true);
    await matchService.accept(
      match.id,
      () => {
        setMatches((prev) =>
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
        setMatches((prev) =>
          prev.map((m) =>
            m.id === match.id ? { ...m, status: MatchStatus.Rejected } : m
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
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
    if (status === MatchStatus.Pending) {
      return isIncoming ? t("match.status.pending") : t("waiting");
    }
    switch (status) {
      case MatchStatus.Accepted:
        return t("match.status.accepted");
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

  const otherUser = isIncoming ? match.sender : match.receiver;

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
          navigation.navigate("Mentor", { mentorId: otherUser?.id })
        }
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Image
          source={{
            uri: "https://ui-avatars.com/api/?name=" + otherUser?.username,
          }}
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: theme.colors.text.primary }]}>
            {otherUser?.username}
          </Text>
          <Text style={[styles.field, { color: theme.colors.text.secondary }]}>
            {otherUser?.email}
          </Text>
          {renderStatusChip(match.status)}
        </View>
      </AnimatedTouchable>

      <Text style={[styles.bio, { color: theme.colors.text.secondary }]}>
        {".Net Core ile API geliştirmenize yardımcı olabilirim"}
      </Text>

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
            navigation.navigate("GeneralChat", { chatId: match.chatId })
          }
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              {t("match.actions.openChat")}
            </Text>
          </View>
        </AnimatedTouchable>
      )}

      {match.status === MatchStatus.Pending && isIncoming && (
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            style={[
              styles.actionButton,
              styles.acceptButton,
              {
                backgroundColor: "#2563eb",
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
                backgroundColor: "#e5e7eb",
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

      {match.status === MatchStatus.Pending && !isIncoming && (
        <View
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.primary.light,
              opacity: 0.8,
            },
          ]}
        >
          <View style={styles.buttonContent}>
            <Text
              style={[styles.buttonText, { color: theme.colors.text.primary }]}
            >
              {t("waiting")}
            </Text>
          </View>
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
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  acceptButton: {},
  rejectButton: {},
});

export default MatchCard;
