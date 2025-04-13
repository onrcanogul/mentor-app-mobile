import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import MatchCard from "./MatchCard";
import { Match } from "../../../domain/match";

interface MatchSectionProps {
  title: string;
  matches: Match[];
  isVisible: boolean;
  onToggle: () => void;
  setLoading: (val: boolean) => void;
  isLoading: boolean;
}

const MatchSection: React.FC<MatchSectionProps> = ({
  title,
  matches,
  isVisible,
  onToggle,
  setLoading,
  isLoading,
}) => {
  return (
    <View>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>{title}</Text>
        <MaterialIcons
          name={isVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#C0C0C0"
        />
      </TouchableOpacity>
      {isVisible &&
        matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C0C0C0",
  },
});

export default MatchSection;
