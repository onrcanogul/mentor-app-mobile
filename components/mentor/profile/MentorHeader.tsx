import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const MentorHeader = ({ mentor }: any) => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: mentor.user?.avatar || "https://via.placeholder.com/100",
        }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.name}>{mentor.user?.name}</Text>
        <Text style={styles.rating}>⭐ {mentor.rating.toFixed(1)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  rating: {
    fontSize: 16,
    color: "#A0A0A0",
  },
});

export default MentorHeader;
