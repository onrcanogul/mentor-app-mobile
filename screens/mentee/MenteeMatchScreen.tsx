import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchSection from "../../components/mentee/match/MatchSection";
import { Match, MatchStatus } from "../../domain/match";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";
import matchService from "../../services/match-service";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const MenteeMatchScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [showWaiting, setShowWaiting] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    setLoading(true);
    const user = await userService.getCurrentUser();
    const result = await matchService.get(
      user.id,
      () => {},
      () => {}
    );
    setMatches(result);
    setLoading(false);
  }

  const handlePress = async () => {
    const user = await userService.getCurrentUser();
    buttonScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    await matchService.create(
      {
        senderId: user.id,
        createdBy: "SYSTEM",
      },
      (match) => {
        toastrService.success(t("matchSuccess"));
        setMatches((prev) => [match, ...prev]);
      },
      () => {
        toastrService.error(t("matchError"));
      }
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["top"]}
    >
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.searchContainer}
      >
        <AnimatedTextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
            },
          ]}
          placeholder={t("searchMentee")}
          placeholderTextColor={theme.colors.text.disabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <AnimatedTouchable
          style={[
            styles.mentorButton,
            { backgroundColor: theme.colors.primary.main },
            animatedButtonStyle,
          ]}
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.Text
            style={[styles.buttonText, { color: theme.colors.text.primary }]}
          >
            {t("findMentor")}
          </Animated.Text>
        </AnimatedTouchable>
      </Animated.View>

      <Animated.ScrollView
        entering={FadeIn.duration(600).delay(200)}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMatches}
            tintColor={theme.colors.primary.main}
          />
        }
        style={styles.scrollView}
      >
        <Animated.View
          entering={FadeInDown.duration(600).delay(400).springify()}
        >
          <MatchSection
            title={t("activeMatches")}
            matches={matches.filter((m) => m.status === MatchStatus.Accepted)}
            isVisible={showActive}
            onToggle={() => setShowActive(!showActive)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(600).springify()}
        >
          <MatchSection
            title={t("waitingMatches")}
            matches={matches.filter((m) => m.status === MatchStatus.Pending)}
            isVisible={showWaiting}
            onToggle={() => setShowWaiting(!showWaiting)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(800).springify()}
        >
          <MatchSection
            title={t("pastMatches")}
            matches={matches.filter((m) => m.status === MatchStatus.Rejected)}
            isVisible={showPast}
            onToggle={() => setShowPast(!showPast)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mentorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
});

export default MenteeMatchScreen;
