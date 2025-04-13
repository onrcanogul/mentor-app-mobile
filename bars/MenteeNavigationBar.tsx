import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import MenteeProfileScreen from "../screens/mentor/MenteeProfileScreen";
// import MenteeMatchScreen from "../screens/mentor/MenteeMatchScreen";
import NotificationsScreen from "../screens/common/NotificationsScreen";
import ChatListScreen from "../screens/common/ChatListScreen";
// import AIAssistantScreen from "../screens/mentee/AIAssistantScreen";
import { MaterialIcons } from "@expo/vector-icons";
import MenteeProfileScreen from "../screens/mentee/MenteeProfileScreen";
import MenteeMatchScreen from "../screens/mentee/MenteeMatchScreen";
import AiAssistantScreen from "../screens/mentee/AiAssistantScreen";
import MenteeChatListScreen from "../screens/mentee/MenteeChatListScreen";
import { useTranslation } from "react-i18next";
import { StyleSheet, Platform, View, Dimensions } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { defaultTheme } from "../theme/defaultTheme";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

export default function MenteeTabNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === defaultTheme;

  const tabBarBackground = () => {
    return (
      <BlurView
        intensity={Platform.OS === "ios" ? 25 : 100}
        tint={isDarkMode ? "dark" : "light"}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100%",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
        }}
      />
    );
  };

  return (
    // @ts-ignore
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarBackground: tabBarBackground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isDarkMode
            ? "rgba(18, 18, 18, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 85 : 60,
          paddingBottom: Platform.OS === "ios" ? 25 : 0,
          paddingTop: 0,
          width: width,
          ...Platform.select({
            ios: {
              shadowColor: isDarkMode ? "#000" : "#999",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
            },
            android: {
              elevation: 12,
              backgroundColor: isDarkMode
                ? "rgba(18, 18, 18, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
            },
          }),
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: isDarkMode
          ? "rgba(255, 255, 255, 0.5)"
          : "rgba(0, 0, 0, 0.4)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === "ios" ? 0 : -4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          height: Platform.OS === "ios" ? 50 : 56,
        },
      }}
    >
      <Tab.Screen
        name={t("profileBar")}
        component={MenteeProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name={t("matches")}
        component={MenteeMatchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="group" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name={t("aiAssistant")}
        component={AiAssistantScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="smart-toy" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name={t("notifications")}
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="notifications" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name={t("myConversations")}
        component={MenteeChatListScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="chat" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    padding: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
});
