import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { UserType } from "../../domain/user";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const goToLoginScreen = (type: UserType) => {
    navigation.navigate("Login", { userType: type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1E1E1E", "#121212"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Mentor Match
      </Animated.Text>

      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          width: "100%",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => goToLoginScreen(UserType.Mentor)}
          activeOpacity={0.9}
        >
          <BlurView intensity={60} tint="dark" style={styles.optionBox}>
            <Text style={styles.optionText}>{t("homeMentor")}</Text>
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => goToLoginScreen(UserType.Mentee)}
          activeOpacity={0.9}
          style={{ marginTop: 20 }}
        >
          <BlurView intensity={60} tint="dark" style={styles.optionBox}>
            <Text style={styles.optionText}>{t("homeMentee")}</Text>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 50,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  optionBox: {
    width: width * 0.85,
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "#333",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
