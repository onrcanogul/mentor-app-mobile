import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import MatchSection from "../../components/general/match/MatchSection";
import { Match, MatchStatus } from "../../domain/match";
import { useTranslation } from "react-i18next";
import matchService from "../../services/match-service";
import { useFocusEffect } from "@react-navigation/native";
import userService from "../../services/user-service";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import toastrService from "../../services/toastr-service";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const GeneralMatchScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [isLoading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveMatches, setShowActiveMatches] = useState(true);
  const [showWaitingMatches, setShowWaitingMatches] = useState(true);
  const [showPastMatches, setShowPastMatches] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const currentUser = await userService.getCurrentUser();
      const result = await matchService.get(
        currentUser.id,
        () => {},
        () => {}
      );
      if (result) setMatches(result);
    } catch (error) {
      console.warn("Error fetching matches", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    const user = await userService.getCurrentUser();
    await matchService.createCommunity(
      {
        senderId: user.id,
        createdBy: "SYSTEM",
      },
      (match) => {
        toastrService.success(t("matchSuccess"));
        setMatches((prev) => [...prev, match]);
      },
      () => {
        toastrService.error(t("matchError"));
      }
    );
  };

  const filteredMatches = matches.filter((match) =>
    match.receiver.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            matches={
              searchQuery
                ? filteredMatches.filter(
                    (m) => m.status === MatchStatus.Accepted
                  )
                : matches.filter((m) => m.status === MatchStatus.Accepted)
            }
            isVisible={showActiveMatches}
            onToggle={() => setShowActiveMatches(!showActiveMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(600).springify()}
        >
          <MatchSection
            title={t("waitingMatches")}
            matches={
              searchQuery
                ? filteredMatches.filter(
                    (m) => m.status === MatchStatus.Pending
                  )
                : matches.filter((m) => m.status === MatchStatus.Pending)
            }
            isVisible={showWaitingMatches}
            onToggle={() => setShowWaitingMatches(!showWaitingMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(800).springify()}
        >
          <MatchSection
            title={t("pastMatches")}
            matches={
              searchQuery
                ? filteredMatches.filter(
                    (m) => m.status === MatchStatus.Rejected
                  )
                : matches.filter((m) => m.status === MatchStatus.Rejected)
            }
            isVisible={showPastMatches}
            onToggle={() => setShowPastMatches(!showPastMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </Animated.View>
      </Animated.ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary.main }]}
        color={theme.colors.primary.contrastText}
        onPress={handlePress}
      />
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 80,
    borderRadius: 28,
    elevation: 5,
    zIndex: 999,
  },
});

export default GeneralMatchScreen;
