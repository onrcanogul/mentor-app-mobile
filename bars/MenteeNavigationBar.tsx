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

const Tab = createBottomTabNavigator();

export default function MenteeTabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E1E1E",
          borderTopWidth: 0, // istenmeyen çizgiyi kaldırır
          paddingBottom: 0,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#A0A0A0",
      }}
    >
      <Tab.Screen
        name={t("profile")}
        component={MenteeProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={t("matches")}
        component={MenteeMatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name={t("aiAssistant")}
        component={AiAssistantScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="smart-toy" color={color} size={size} />
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
        component={MenteeChatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
