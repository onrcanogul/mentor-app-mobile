import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MatchCard from "./MatchCard";
import { Match } from "../../../domain/match";

const MatchSection = ({
  title,
  matches,
  visible,
  onToggle,
  setMatches,
  setLoading,
  isLoading,
}: {
  title: string;
  matches: Match[];
  visible: boolean;
  onToggle: () => void;
  setMatches: any;
  setLoading: any;
  isLoading: boolean;
}) => {
  return (
    <>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>{title}</Text>
        <MaterialIcons
          name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#C0C0C0"
        />
      </TouchableOpacity>
      {visible &&
        matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            setMatches={setMatches}
            setLoading={setLoading}
            isLoading={isLoading}
          />
        ))}
    </>
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
