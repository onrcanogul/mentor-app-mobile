import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Header = () => {
  const insets = useSafeAreaInsets(); // 👈 iOS çentik için

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image
        source={{ uri: "https://via.placeholder.com/36" }} // Avatar
        style={styles.avatar}
      />
      <TouchableOpacity onPress={() => console.log("Ayarlar tıklandı")}>
        <Ionicons name="settings-sharp" size={22} color="#FFD700" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 100, // 👈 Daha düşük yükseklik
    paddingTop: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default Header;
