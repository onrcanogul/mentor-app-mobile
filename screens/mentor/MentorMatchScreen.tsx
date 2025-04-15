import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchSection from "../../components/mentor/match/MatchSection";
import { Match, MatchStatus } from "../../domain/match";
import userService from "../../services/user-service";
import matchService from "../../services/match-service";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const MentorMatchScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [showWaiting, setShowWaiting] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);

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
    console.log(result);
    setMatches(result);
    setLoading(false);
  }

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
            visible={showActive}
            onToggle={() => setShowActive(!showActive)}
            setMatches={setMatches}
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
            visible={showWaiting}
            onToggle={() => setShowWaiting(!showWaiting)}
            setMatches={setMatches}
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
            visible={showPast}
            onToggle={() => setShowPast(!showPast)}
            setMatches={setMatches}
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
    marginBottom: 20,
  },
  searchInput: {
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
  scrollView: {
    flex: 1,
  },
});

export default MentorMatchScreen;
