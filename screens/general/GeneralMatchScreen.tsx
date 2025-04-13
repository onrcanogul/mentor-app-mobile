import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import MatchSection from "../../components/general/match/MatchSection";
import { Match, MatchStatus } from "../../domain/match";
import { useTranslation } from "react-i18next";
import matchService from "../../services/match-service";
import { useFocusEffect } from "@react-navigation/native";
import userService from "../../services/user-service";
import SearchBar from "../../components/mentor/match/SearchBar";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import toastrService from "../../services/toastr-service";

const GeneralMatchScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
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
    <SafeAreaView style={styles.container}>
      <SearchBar query={searchQuery} setQuery={setSearchQuery} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMatches}
            tintColor="#FFD700"
          />
        }
      >
        <MatchSection
          title={t("activeMatches")}
          matches={
            searchQuery
              ? filteredMatches.filter((m) => m.status === MatchStatus.Accepted)
              : matches.filter((m) => m.status === MatchStatus.Accepted)
          }
          isVisible={showActiveMatches}
          onToggle={() => setShowActiveMatches(!showActiveMatches)}
          setLoading={setLoading}
          isLoading={isLoading}
        />
        <MatchSection
          title={t("waitingMatches")}
          matches={
            searchQuery
              ? filteredMatches.filter((m) => m.status === MatchStatus.Pending)
              : matches.filter((m) => m.status === MatchStatus.Pending)
          }
          isVisible={showWaitingMatches}
          onToggle={() => setShowWaitingMatches(!showWaitingMatches)}
          setLoading={setLoading}
          isLoading={isLoading}
        />
        <MatchSection
          title={t("pastMatches")}
          matches={
            searchQuery
              ? filteredMatches.filter((m) => m.status === MatchStatus.Rejected)
              : matches.filter((m) => m.status === MatchStatus.Rejected)
          }
          isVisible={showPastMatches}
          onToggle={() => setShowPastMatches(!showPastMatches)}
          setLoading={setLoading}
          isLoading={isLoading}
        />
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        color="#121212"
        onPress={() => handlePress()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  fab: {
    position: "absolute",
    margin: 16,
    borderRadius: 100,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFD700",
  },
});

export default GeneralMatchScreen;
