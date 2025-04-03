import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MentorProfileScreen from "../screens/mentor/MentorProfileScreen";
import MatchScreen from "../screens/mentor/MentorMatchScreen";
import NotificationsScreen from "../screens/common/NotificationsScreen";
import ChatListScreen from "../screens/common/ChatListScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import MentorChatListScreen from "../screens/mentor/MentorChatListScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E1E1E",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#A0A0A0",
      }}
    >
      <Tab.Screen
        name={t("profile")}
        component={MentorProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t("matches")}
        component={MatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t("notifications")}
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t("myConversations")}
        component={MentorChatListScreen} // Sohbet listesi ekranı
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
