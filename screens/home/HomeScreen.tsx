import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { UserType } from "../../domain/user";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
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

  const renderOption = (type: UserType, icon: string, title: string) => (
    <TouchableOpacity
      onPress={() => goToLoginScreen(type)}
      activeOpacity={0.9}
      style={[
        styles.optionBox,
        {
          backgroundColor: theme.colors.card.background,
          borderColor: theme.colors.card.border,
          shadowColor: theme.colors.text.primary,
        },
      ]}
    >
      <LinearGradient
        colors={[
          theme.colors.button.primary + "20",
          theme.colors.button.primary + "05",
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <MaterialCommunityIcons
        name={icon as any}
        size={32}
        color={theme.colors.button.primary}
        style={styles.icon}
      />
      <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      <Text
        style={[styles.optionSubtitle, { color: theme.colors.text.secondary }]}
      >
        {t(`home${type}Description`)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/ai-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Mentor Match
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            {t("homeDescription")}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderOption(UserType.Mentor, "account-tie", t("homeMentor"))}
          {renderOption(UserType.Mentee, "school", t("homeMentee"))}
          {renderOption(UserType.General, "account-group", t("homeGeneral"))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  optionBox: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
