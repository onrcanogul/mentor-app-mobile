import "./i18n";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MentorTabNavigator from "./bars/MentorNavigationBar";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import HomeScreen from "./screens/home/HomeScreen";
import MentorProfileScreen from "./screens/mentor/MentorProfileScreen";
import MenteeTabNavigator from "./bars/MenteeNavigationBar";
import AiAssistantScreen from "./screens/mentee/AiAssistantScreen";
import MenteeProfileScreen from "./screens/mentee/MenteeProfileScreen";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { navigationRef } from "./RootNavigation";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserType } from "./domain/user";
import { ActivityIndicator, View } from "react-native";
import SettingsScreen from "./screens/common/SettingsScreen";
import AiChatScreen from "./screens/mentee/AiChatScreen";
import MentorMatchScreen from "./screens/mentor/MentorMatchScreen";
import MenteeMatchScreen from "./screens/mentee/MenteeMatchScreen";
import MenteeChatScreen from "./screens/mentee/MenteeChatScreen";
import MentorChatScreen from "./screens/mentor/MentorChatScreen";
import { StatusBar } from "expo-status-bar";
import CommonSideNavigationBar from "./bars/CommonSideNavigationBar";
import GeneralMatchScreen from "./screens/general/GeneralMatchScreen";
import GeneralProfileScreen from "./screens/general/GeneralProfileScreen";
import GeneralChatScreen from "./screens/general/GeneralChatScreen";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import userService from "./services/user-service";

const Stack = createStackNavigator();

const ToastWrapper = () => {
  const { theme } = useTheme();

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          marginTop: 20,
          borderLeftColor: theme.colors.success.main,
          backgroundColor: theme.colors.background.secondary,
          borderRadius: 12,
          height: 60,
          width: "90%",
          maxWidth: 400,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.text.primary,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          marginTop: 20,
          borderLeftColor: theme.colors.error.main,
          backgroundColor: theme.colors.background.secondary,
          borderRadius: 12,
          height: 60,
          width: "90%",
          maxWidth: 400,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.text.primary,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
        }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{
          marginTop: 20,
          borderLeftColor: theme.colors.primary.main,
          backgroundColor: theme.colors.background.secondary,
          borderRadius: 12,
          height: 60,
          width: "90%",
          maxWidth: 400,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.text.primary,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
        }}
      />
    ),
  };

  return <Toast config={toastConfig} />;
};

const AppNavigator = () => {
  const { isAuthenticated, role, isLoading, setAuthenticated, setRole } =
    useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const [isAuth, user] = await Promise.all([
          userService.isAuthenticated(),
          userService.getCurrentUser(),
        ]);

        if (isAuth && user) {
          setAuthenticated(true);
          if (user.role === "Mentor") setRole(UserType.Mentor);
          else if (user.role === "Mentee") setRole(UserType.Mentee);
          else if (user.role === "General") setRole(UserType.General);
        }
      } catch (error) {
        console.error("Initial auth check error:", error);
      }
    };

    checkInitialAuth();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={theme.colors.background.primary}
      />

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
        ) : isAuthenticated && role === UserType.General ? (
          <>
            <Stack.Screen name="Main" component={CommonSideNavigationBar} />
            <Stack.Screen name="GeneralMatch" component={GeneralMatchScreen} />
            <Stack.Screen
              name="GeneralProfile"
              component={GeneralProfileScreen}
            />
            <Stack.Screen name="GeneralChat" component={GeneralChatScreen} />
          </>
        ) : !isAuthenticated || role === null ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <></>
        )}
        <Stack.Screen name="Mentor" component={MentorProfileScreen} />
        <Stack.Screen name="Mentee" component={MenteeProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AIChat" component={AiChatScreen} />
        <Stack.Screen name="MentorMatch" component={MentorMatchScreen} />
        <Stack.Screen name="MenteeMatch" component={MenteeMatchScreen} />
        <Stack.Screen name="MenteeChat" component={MenteeChatScreen} />
        <Stack.Screen name="MentorChat" component={MentorChatScreen} />
      </Stack.Navigator>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
          <ToastWrapper />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
