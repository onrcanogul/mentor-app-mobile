import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { UserType } from "../../domain/user";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { userType } = route.params;
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuthenticated, setRole } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    await userService.login(
      { usernameOrEmail: email, password, role: userType },
      async () => {
        toastrService.success(t("loginSuccess"));
        setAuthenticated(true);
        setRole(userType);
        setTimeout(() => {
          navigation.navigate("Main");
          setLoading(false);
        }, 1000);
      },
      () => {
        setLoading(false);
      }
    );
  };

  const getUserIcon = () => {
    switch (userType) {
      case UserType.Mentor:
        return "account-tie";
      case UserType.Mentee:
        return "school";
      default:
        return "account-group";
    }
  };

  const getUserTitle = () => {
    switch (userType) {
      case UserType.Mentor:
        return "👨‍🏫 " + t("mentor");
      case UserType.Mentee:
        return "👩‍🎓 " + t("mentee");
      default:
        return "👥 " + t("communityMember");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={getUserIcon()}
            size={48}
            color={theme.colors.button.primary}
            style={styles.headerIcon}
          />
          <Text
            style={[styles.headerTitle, { color: theme.colors.text.primary }]}
          >
            {getUserTitle()}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.text.secondary },
            ]}
          >
            {t("welcomeBack")}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label={t("emailOrUsername")}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            textColor={theme.colors.input.text}
            outlineColor={theme.colors.input.border}
            activeOutlineColor={theme.colors.button.primary}
            left={
              <TextInput.Icon
                icon="email"
                color={theme.colors.text.secondary}
              />
            }
          />

          <TextInput
            label={t("password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={[
              styles.input,
              { backgroundColor: theme.colors.input.background },
            ]}
            textColor={theme.colors.input.text}
            outlineColor={theme.colors.input.border}
            activeOutlineColor={theme.colors.button.primary}
            left={
              <TextInput.Icon icon="lock" color={theme.colors.text.secondary} />
            }
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                color={theme.colors.text.secondary}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={[
              styles.loginButton,
              { backgroundColor: theme.colors.button.primary },
            ]}
            labelStyle={[
              styles.loginButtonText,
              { color: theme.colors.button.text },
            ]}
          >
            {t("login")}
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register", { userType })}
            style={styles.registerLink}
          >
            <Text
              style={[
                styles.registerText,
                { color: theme.colors.text.secondary },
              ]}
            >
              {t("dontHaveAccount")}{" "}
              <Text
                style={[
                  styles.registerTextBold,
                  { color: theme.colors.text.accent },
                ]}
              >
                {t("signUp")}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    paddingVertical: 8,
    marginTop: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerTextBold: {
    fontWeight: "600",
  },
});

export default LoginScreen;
