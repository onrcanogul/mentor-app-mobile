import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Platform, View, Dimensions } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { defaultTheme } from "../theme/defaultTheme";

import GeneralChatListScreen from "../screens/general/GeneralChatListScreen";
import NotificationsScreen from "../screens/common/NotificationsScreen";
import GeneralMatchScreen from "../screens/general/GeneralMatchScreen";
import GeneralProfileScreen from "../screens/general/GeneralProfileScreen";
import GeneralAIAssistantScreen from "../screens/general/GeneralAIAssistantScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

export default function CommonSideNavigationBar() {
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
        component={GeneralProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" color={color} size={24} />
          ),
        }}
      />

      <Tab.Screen
        name={t("matches")}
        component={GeneralMatchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="group" color={color} size={24} />
          ),
        }}
      />

      <Tab.Screen
        name={t("aiAssistant")}
        component={GeneralAIAssistantScreen}
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
        component={GeneralChatListScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="forum" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
