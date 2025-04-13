import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MatchStatus } from "../../../domain/match";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../contexts/ThemeContext";
import Animated, {
  FadeIn,
  FadeInRight,
  Layout,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type RootStackParamList = {
  Mentor: { mentorId: string };
  MenteeChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatchCard = ({ match, setLoading, isLoading, index = 0 }: any) => {
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
        return theme.colors.success.main;
      case MatchStatus.Pending:
        return theme.colors.primary.main;
      default:
        return theme.colors.error.main;
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Accepted:
        return t("matched");
      case MatchStatus.Pending:
        return t("waiting");
      default:
        return t("ended");
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

  return (
    <AnimatedCard
      entering={FadeInRight.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background.secondary,
          opacity: match.status === "Closed" ? 0.6 : 1,
        },
        animatedStyle,
      ]}
    >
      <AnimatedTouchable
        style={styles.row}
        onPress={() =>
          navigation.navigate("Mentor", { mentorId: match.receiver.id })
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
            {match.receiver?.username}
          </Text>
          <Text style={[styles.field, { color: theme.colors.text.secondary }]}>
            {match.receiver?.username}
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
            { backgroundColor: theme.colors.primary.main },
          ]}
          onPress={() =>
            navigation.navigate("MenteeChat", { chatId: match.chatId })
          }
        >
          <View style={styles.buttonContent}>
            <Text
              style={[styles.buttonText, { color: theme.colors.text.primary }]}
            >
              {t("goToChat")}
            </Text>
          </View>
        </AnimatedTouchable>
      )}

      {match.status === MatchStatus.Pending && (
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
  actionButton: {
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
});

export default MatchCard;
