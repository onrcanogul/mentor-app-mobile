import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import MatchCard from "./MatchCard";
import { Match } from "../../../domain/match";
import userService from "../../../services/user-service";
import { useTheme } from "../../../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";

interface MatchSectionProps {
  title: string;
  matches: Match[];
  isVisible: boolean;
  onToggle: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
}

const MatchSection = ({
  title,
  matches,
  isVisible,
  onToggle,
  setLoading,
  isLoading,
  setMatches,
}: MatchSectionProps) => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await userService.getCurrentUser();
      setCurrentUserId(user.id);
    };
    fetchCurrentUser();
  }, []);

  const incomingMatches = matches.filter(
    (match) => match.receiverId === currentUserId
  );
  const outgoingMatches = matches.filter(
    (match) => match.senderId === currentUserId
  );

  return (
    <Animated.View entering={FadeInDown.duration(600).springify()}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text style={[styles.title, { color: theme.colors.text.secondary }]}>
          {title}
        </Text>
        <MaterialIcons
          name={isVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

      {isVisible && (
        <>
          {incomingMatches.length > 0 && (
            <View style={styles.section}>
              {incomingMatches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={index}
                  setLoading={setLoading}
                  isLoading={isLoading}
                  setMatches={setMatches}
                />
              ))}
            </View>
          )}

          {outgoingMatches.length > 0 && (
            <View style={styles.section}>
              {outgoingMatches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={index}
                  setLoading={setLoading}
                  isLoading={isLoading}
                  setMatches={setMatches}
                />
              ))}
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    fontStyle: "italic",
  },
});

export default MatchSection;
