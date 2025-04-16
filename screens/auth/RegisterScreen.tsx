import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { UserType } from "../../domain/user";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { userType } = route.params;
  const { theme } = useTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toastrService.error(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    await userService.register(
      {
        userName: username,
        email,
        password,
        userRole: userType,
        confirmPassword,
        fullName: username,
      },
      () => {
        toastrService.success(t("registerSuccess"));
        navigation.navigate("Login", { userType });
        setLoading(false);
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
        <ScrollView showsVerticalScrollIndicator={false}>
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
              {t("createAccount")}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label={t("username")}
              value={username}
              onChangeText={setUsername}
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
                  icon="account"
                  color={theme.colors.text.secondary}
                />
              }
            />

            <TextInput
              label={t("email")}
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
              keyboardType="email-address"
              autoCapitalize="none"
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
                <TextInput.Icon
                  icon="lock"
                  color={theme.colors.text.secondary}
                />
              }
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  color={theme.colors.text.secondary}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TextInput
              label={t("confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
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
                  icon="lock-check"
                  color={theme.colors.text.secondary}
                />
              }
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  color={theme.colors.text.secondary}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              style={[
                styles.registerButton,
                { backgroundColor: theme.colors.button.primary },
              ]}
              labelStyle={[
                styles.registerButtonText,
                { color: theme.colors.button.text },
              ]}
            >
              {t("register")}
            </Button>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login", { userType })}
              style={styles.loginLink}
            >
              <Text
                style={[
                  styles.loginText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {t("alreadyHaveAccount")}{" "}
                <Text
                  style={[
                    styles.loginTextBold,
                    { color: theme.colors.text.accent },
                  ]}
                >
                  {t("login")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  registerButton: {
    paddingVertical: 8,
    marginTop: 24,
    borderRadius: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: "600",
  },
});

export default RegisterScreen;
