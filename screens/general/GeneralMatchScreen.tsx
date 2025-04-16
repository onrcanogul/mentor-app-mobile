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
import { Match, MatchStatus, MatchType } from "../../domain/match";
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
  const [showIncomingMatches, setShowIncomingMatches] = useState(true);
  const [showOutgoingMatches, setShowOutgoingMatches] = useState(true);
  const [showPastMatches, setShowPastMatches] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const currentUser = await userService.getCurrentUser();
      setCurrentUserId(currentUser.id);
      console.log("Current User:", currentUser);

      const result = await matchService.getForCommunity(
        currentUser.id,
        () => {},
        () => {}
      );
      console.log("Fetched Matches:", result);

      if (result) setMatches(result);
    } catch (error) {
      console.warn("Error fetching matches", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    const user = await userService.getCurrentUser();
    console.log("Creating match with user:", user.id);
    await matchService.createCommunity(
      {
        senderId: user.id,
        createdBy: "SYSTEM",
      },
      (match) => {
        console.log("Created Match:", match);
        toastrService.success(t("matchSuccess"));
        setMatches((prevMatches) => [...prevMatches, match]);
      },
      () => {
        toastrService.error(t("matchError"));
      }
    );
  };

  const getMatchesByStatus = (status: MatchStatus) => {
    if (!matches || matches.length === 0) return [];
    return matches.filter((m) => m?.status === status);
  };

  const getIncomingMatches = () => {
    if (!matches || matches.length === 0) return [];
    console.log("Filtering Incoming Matches:");
    console.log("Current User ID:", currentUserId);
    console.log("All Matches:", matches);

    const incomingMatches = matches.filter((m) => {
      console.log("Checking match:", m);
      console.log("Is Pending?", m?.status === MatchStatus.Pending);
      console.log("Is receiver?", m?.receiverId === currentUserId);
      return (
        m?.status === MatchStatus.Pending && m.receiverId === currentUserId
      );
    });

    console.log("Incoming Matches Result:", incomingMatches);
    return incomingMatches;
  };

  const getOutgoingMatches = () => {
    if (!matches || matches.length === 0) return [];
    console.log("Filtering Outgoing Matches:");
    console.log("Current User ID:", currentUserId);
    console.log("All Matches:", matches);

    const outgoingMatches = matches.filter((m) => {
      console.log("Checking match:", m);
      console.log("Is Pending?", m?.status === MatchStatus.Pending);
      console.log("Is sender?", m?.senderId === currentUserId);
      return m?.status === MatchStatus.Pending && m.senderId === currentUserId;
    });

    console.log("Outgoing Matches Result:", outgoingMatches);
    return outgoingMatches;
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
            matches={getMatchesByStatus(MatchStatus.Accepted)}
            isVisible={showActiveMatches}
            onToggle={() => setShowActiveMatches(!showActiveMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
            setMatches={setMatches}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(600).springify()}
        >
          <MatchSection
            title={t("incomingMatches")}
            matches={getIncomingMatches()}
            isVisible={showIncomingMatches}
            onToggle={() => setShowIncomingMatches(!showIncomingMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
            setMatches={setMatches}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(800).springify()}
        >
          <MatchSection
            title={t("outgoingMatches")}
            matches={getOutgoingMatches()}
            isVisible={showOutgoingMatches}
            onToggle={() => setShowOutgoingMatches(!showOutgoingMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
            setMatches={setMatches}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(1000).springify()}
        >
          <MatchSection
            title={t("pastMatches")}
            matches={getMatchesByStatus(MatchStatus.Rejected)}
            isVisible={showPastMatches}
            onToggle={() => setShowPastMatches(!showPastMatches)}
            setLoading={setLoading}
            isLoading={isLoading}
            setMatches={setMatches}
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
