import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import SearchBar from "../../components/mentor/match/SearchBar";
import MatchSection from "../../components/mentor/match/MatchSection";
import { Match, MatchStatus } from "../../domain/match";
import { useTranslation } from "react-i18next";
import matchService from "../../services/match-service";
import { useFocusEffect } from "@react-navigation/native";
import userService from "../../services/user-service";

const MentorMatchScreen = () => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveMatches, setShowActiveMatches] = useState(true);
  const [showWaitingMatches, setShowWaitingMatches] = useState(true);
  const [showPastMatches, setShowPastMatches] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  async function fetch() {
    var matches = await matchService.get(
      (
        await userService.getCurrentUser()
      ).id,
      () => {},
      () => {}
    );
    if (matches != null) {
      setMatches(matches);
    }
  }

  const filtered = matches.filter((match) =>
    match.experiencedUser.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetch}
              tintColor="#FFD700"
            />
          }
        >
          <MatchSection
            title={t("activeMatches")}
            matches={
              searchQuery != ""
                ? matches.filter((m) => m.status === MatchStatus.Accepted)
                : filtered.filter((m) => m.status === MatchStatus.Accepted)
            }
            visible={showActiveMatches}
            onToggle={() => setShowActiveMatches(!showActiveMatches)}
            setMatches={setMatches}
            setLoading={setLoading}
            isLoading={isLoading}
          />
          <MatchSection
            title={t("waitingMatches")}
            matches={
              searchQuery != ""
                ? matches.filter((m) => m.status === MatchStatus.Pending)
                : filtered.filter((m) => m.status === MatchStatus.Pending)
            }
            visible={showWaitingMatches}
            onToggle={() => setShowWaitingMatches(!showWaitingMatches)}
            setMatches={setMatches}
            setLoading={setLoading}
            isLoading={isLoading}
          />
          <MatchSection
            title={t("pastMatches")}
            matches={
              searchQuery != ""
                ? matches.filter((m) => m.status === MatchStatus.Rejected)
                : filtered.filter((m) => m.status === MatchStatus.Rejected)
            }
            visible={showPastMatches}
            onToggle={() => setShowPastMatches(!showPastMatches)}
            setMatches={setMatches}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        </ScrollView>
      </SafeAreaView>
      {/* <LoadingSpinner visible={isLoading} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
});

export default MentorMatchScreen;
