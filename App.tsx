import "./i18n";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MentorTabNavigator from "./bars/MentorNavigationBar";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import HomeScreen from "./screens/home/HomeScreen";
import MentorProfileScreen from "./screens/mentor/MentorProfileScreen";
import ChatScreen from "./screens/common/ChatScreen";
import MenteeTabNavigator from "./bars/MenteeNavigationBar";
import AiAssistantScreen from "./screens/mentee/AiAssistantScreen";
import MenteeProfileScreen from "./screens/mentee/MenteeProfileScreen";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { navigationRef } from "./RootNavigation";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserType } from "./domain/user";
import { ActivityIndicator } from "react-native-paper";
import { View } from "react-native";
import SettingsScreen from "./screens/common/SettingsScreen";
import AiChatScreen from "./screens/mentee/AiChatScreen";
import MentorMatchScreen from "./screens/mentor/MentorMatchScreen";
import MenteeMatchScreen from "./screens/mentee/MenteeMatchScreen";
import MenteeChatScreen from "./screens/mentee/MenteeChatScreen";
import MentorChatScreen from "./screens/mentor/MentorChatScreen";
import { StatusBar } from "expo-status-bar";

const Stack = createStackNavigator();

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        marginTop: 20,
        borderLeftColor: "#00FF99",
        backgroundColor: "#1E1E1E",
      }}
      text1Style={{ color: "#FFFFFF" }}
      text2Style={{ color: "#FFFFFF" }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        marginTop: 20,
        borderLeftColor: "#FF6B6B",
        backgroundColor: "#1E1E1E",
      }}
      text1Style={{ color: "#FFFFFF" }}
      text2Style={{ color: "#FFFFFF" }}
    />
  ),
};

const AppNavigator = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <>
      {/* StatusBar'ı Burada Ayarlıyoruz */}
      <StatusBar style="light" backgroundColor="#121212" />

      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        {isAuthenticated && role === UserType.Mentor ? (
          <>
            <Stack.Screen name="Main" component={MentorTabNavigator} />
          </>
        ) : isAuthenticated && role === UserType.Mentee ? (
          <>
            <Stack.Screen name="Main" component={MenteeTabNavigator} />
            <Stack.Screen name="AIAssistant" component={AiAssistantScreen} />
          </>
        ) : !isAuthenticated || role == null ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <></>
        )}

        {/* Ortak Ekranlar */}

        <Stack.Screen name="Mentor" component={MentorProfileScreen} />
        <Stack.Screen name="Mentee" component={MenteeProfileScreen} />
        <Stack.Screen name="MentorMatch" component={MentorMatchScreen} />
        <Stack.Screen name="MenteeMatch" component={MenteeMatchScreen} />
        <Stack.Screen name="MenteeChat" component={MenteeChatScreen} />
        <Stack.Screen name="MentorChat" component={MentorChatScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AIChat" component={AiChatScreen} />
      </Stack.Navigator>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
