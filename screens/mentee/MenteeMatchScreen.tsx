import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MatchSection from "../../components/mentee/match/MatchSection";
import { Match, MatchStatus } from "../../domain/match";
import { useFocusEffect } from "@react-navigation/native";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";
import matchService from "../../services/match-service";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

const MenteeMatchScreen = () => {
  const { t } = useTranslation();
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
    const user = await userService.getCurrentUser();
    const result = await matchService.get(
      user.id,
      () => {},
      () => {}
    );
    setMatches(result);
  }

  // const filtered = matches.filter(
  //   (match) =>
  //     match.experiencedUser.username
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase()) ||
  //     match.experiencedUser.username
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase())
  // );

  const handlePress = async () => {
    const user = await userService.getCurrentUser();
    await matchService.create(
      {
        inExperiencedUserId: user.id,
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

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchMentee")}
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Button
            mode="contained"
            style={styles.mentorButton}
            onPress={() => handlePress()}
          >
            {t("findMentor")}
          </Button>
        </View>

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
            matches={matches.filter((m) => m.status === MatchStatus.Accepted)}
            isVisible={showActive}
            onToggle={() => setShowActive(!showActive)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
          <MatchSection
            title={t("waitingMatches")}
            matches={matches.filter((m) => m.status === MatchStatus.Pending)}
            isVisible={showWaiting}
            onToggle={() => setShowWaiting(!showWaiting)}
            setLoading={setLoading}
            isLoading={isLoading}
          />
          <MatchSection
            title={t("pastMatches")}
            matches={matches.filter((m) => m.status === MatchStatus.Rejected)}
            isVisible={showPast}
            onToggle={() => setShowPast(!showPast)}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  mentorButton: {
    backgroundColor: "#FFD700",
  },
});

export default MenteeMatchScreen;
