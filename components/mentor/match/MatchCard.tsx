import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Match, MatchStatus } from "../../../domain/match";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Layout,
  FadeIn,
  SlideInRight,
  withSpring,
  withTiming,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useSharedValue,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Theme } from "../../../theme/types";
import { RootStackParamList } from "../../../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { PanGestureHandler } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface MatchCardProps {
  match: Match;
  index: number;
  activeTab: "pending" | "accepted" | "rejected";
  onAccept: (matchId: string) => void;
  onReject: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  index,
  activeTab,
  onAccept,
  onReject,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Animation values
  const translateX = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const panGestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (activeTab === "pending") {
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      if (activeTab === "pending") {
        if (event.translationX > 100) {
          translateX.value = withSpring(400);
          runOnJS(onAccept)(match.id);
        } else if (event.translationX < -100) {
          translateX.value = withSpring(-400);
          runOnJS(onReject)(match.id);
        } else {
          translateX.value = withSpring(0);
        }
      }
    },
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, 100],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` } as any,
        { scale: cardScale.value },
      ] as any,
      opacity,
    };
  });

  const onButtonPressIn = useCallback(() => {
    buttonScale.value = withSpring(0.95);
  }, []);

  const onButtonPressOut = useCallback(() => {
    buttonScale.value = withSpring(1);
  }, []);

  const createStyles = (theme: Theme) =>
    StyleSheet.create({
      cardContainer: {
        alignItems: "center",
        width: "100%",
        marginVertical: 8,
      },
      card: {
        width: width - 32,
        maxWidth: 500,
        borderRadius: 16,
        backgroundColor: theme.colors.card.background,
        elevation: 3,
        overflow: "hidden",
      },
      gradientBackground: {
        padding: 16,
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      },
      avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary.main,
      },
      userInfo: {
        flex: 1,
      },
      username: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.text.primary,
        marginBottom: 4,
      },
      email: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 8,
      },
      categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
      },
      categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: `${theme.colors.primary.main}15`,
      },
      categoryText: {
        fontSize: 12,
        fontWeight: "600",
        color: theme.colors.primary.main,
      },
      statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 12,
      },
      statusText: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
      },
      statusAccepted: {
        color: theme.colors.success.main,
      },
      statusRejected: {
        color: theme.colors.error.main,
      },
      buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
      },
      button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 4,
      },
      buttonText: {
        color: theme.colors.text.primary,
        fontSize: 14,
        fontWeight: "600",
      },
      acceptButton: {
        backgroundColor: theme.colors.success.main,
      },
      rejectButton: {
        backgroundColor: theme.colors.error.main,
      },
      chatButton: {
        backgroundColor: theme.colors.primary.main,
      },
      chatButtonText: {
        color: theme.colors.primary.contrastText,
      },
    });

  const styles = createStyles(theme);

  const handleChatPress = () => {
    if (match.chat) {
      navigation.navigate("Chat", { chatId: match.chat.id });
    }
  };

  const renderButtons = () => {
    if (activeTab === "pending") {
      return (
        <>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => onAccept(match.id)}
            onPressIn={onButtonPressIn}
            onPressOut={onButtonPressOut}
          >
            <Text style={styles.buttonText}>{t("match.accept")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => onReject(match.id)}
            onPressIn={onButtonPressIn}
            onPressOut={onButtonPressOut}
          >
            <Text style={styles.buttonText}>{t("match.reject")}</Text>
          </TouchableOpacity>
        </>
      );
    } else if (activeTab === "accepted" && match.chat) {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.chatButton]}
            onPress={handleChatPress}
          >
            <MaterialIcons
              name="chat"
              size={18}
              color={theme.colors.primary.contrastText}
            />
            <Text style={[styles.buttonText, styles.chatButtonText]}>
              {t("match.actions.openChat")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderStatus = () => {
    if (activeTab === "accepted") {
      return (
        <View style={styles.statusContainer}>
          <MaterialIcons
            name="check-circle"
            size={18}
            color={theme.colors.success.main}
          />
          <Text style={[styles.statusText, styles.statusAccepted]}>
            {t("match.status.accepted")}
          </Text>
        </View>
      );
    } else if (activeTab === "rejected") {
      return (
        <View style={styles.statusContainer}>
          <MaterialIcons
            name="cancel"
            size={18}
            color={theme.colors.error.main}
          />
          <Text style={[styles.statusText, styles.statusRejected]}>
            {t("match.status.rejected")}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <PanGestureHandler
      onGestureEvent={panGestureHandler}
      enabled={activeTab === "pending"}
    >
      <Animated.View
        entering={SlideInRight.delay(index * 100).springify()}
        layout={Layout.springify()}
        style={[styles.cardContainer, animatedCardStyle]}
      >
        <View style={styles.card}>
          <LinearGradient
            colors={[
              theme.colors.background.tertiary,
              `${theme.colors.primary.main}10`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.header}>
              <Animated.Image
                entering={FadeIn.delay(index * 150)}
                source={{
                  uri:
                    match.sender.imageUrl || "https://via.placeholder.com/56",
                }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{match.sender.username}</Text>
                <Text style={styles.email}>{match.sender.email}</Text>
                <Animated.View
                  entering={FadeIn.delay(index * 200)}
                  style={styles.categoryContainer}
                >
                  {match.sender.categories?.slice(0, 3).map((category, idx) => (
                    <Animated.View
                      key={idx}
                      entering={FadeIn.delay(index * 200 + idx * 100)}
                      style={styles.categoryChip}
                    >
                      <Text style={styles.categoryText}>
                        {t(`categories.${category.name}`)}
                      </Text>
                    </Animated.View>
                  ))}
                  {match.sender.categories?.length > 3 && (
                    <Animated.View
                      entering={FadeIn.delay(index * 200 + 400)}
                      style={styles.categoryChip}
                    >
                      <Text style={styles.categoryText}>
                        +{match.sender.categories.length - 3}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              </View>
            </View>
            {renderStatus()}
            <Animated.View
              entering={FadeIn.delay(index * 300)}
              style={styles.buttonContainer}
            >
              {renderButtons()}
            </Animated.View>
          </LinearGradient>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};
