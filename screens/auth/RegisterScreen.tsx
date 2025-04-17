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

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t("auth.usernameRequired");
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = t("auth.usernameTooShort");
      isValid = false;
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("auth.fullNameRequired");
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t("auth.emailRequired");
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("auth.invalidEmail");
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("auth.passwordRequired");
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = t("auth.passwordTooShort");
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.confirmPasswordRequired");
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordsDoNotMatch");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await userService.register(
      {
        userName: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userRole: userType,
      },
      () => {
        toastrService.success(t("auth.registerSuccess"));
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
        return t("auth.mentorTitle");
      case UserType.Mentee:
        return t("auth.menteeTitle");
      default:
        return t("auth.communityTitle");
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
              {t("auth.createAccount")}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label={t("auth.username")}
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              mode="outlined"
              style={[
                styles.input,
                { backgroundColor: theme.colors.input.background },
              ]}
              textColor={theme.colors.input.text}
              outlineColor={
                errors.username ? theme.colors.error : theme.colors.input.border
              }
              activeOutlineColor={theme.colors.button.primary}
              error={!!errors.username}
              left={
                <TextInput.Icon
                  icon="account"
                  color={theme.colors.text.secondary}
                />
              }
            />
            {errors.username && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.username}
              </Text>
            )}

            <TextInput
              label={t("auth.fullName")}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange("fullName", value)}
              mode="outlined"
              style={[
                styles.input,
                { backgroundColor: theme.colors.input.background },
              ]}
              textColor={theme.colors.input.text}
              outlineColor={
                errors.fullName ? theme.colors.error : theme.colors.input.border
              }
              activeOutlineColor={theme.colors.button.primary}
              error={!!errors.fullName}
              left={
                <TextInput.Icon
                  icon="account-card"
                  color={theme.colors.text.secondary}
                />
              }
            />
            {errors.fullName && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.fullName}
              </Text>
            )}

            <TextInput
              label={t("auth.email")}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              mode="outlined"
              style={[
                styles.input,
                { backgroundColor: theme.colors.input.background },
              ]}
              textColor={theme.colors.input.text}
              outlineColor={
                errors.email ? theme.colors.error : theme.colors.input.border
              }
              activeOutlineColor={theme.colors.button.primary}
              error={!!errors.email}
              left={
                <TextInput.Icon
                  icon="email"
                  color={theme.colors.text.secondary}
                />
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.email}
              </Text>
            )}

            <TextInput
              label={t("auth.password")}
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry={!showPassword}
              mode="outlined"
              style={[
                styles.input,
                { backgroundColor: theme.colors.input.background },
              ]}
              textColor={theme.colors.input.text}
              outlineColor={
                errors.password ? theme.colors.error : theme.colors.input.border
              }
              activeOutlineColor={theme.colors.button.primary}
              error={!!errors.password}
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
            {errors.password && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.password}
              </Text>
            )}

            <TextInput
              label={t("auth.confirmPassword")}
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              secureTextEntry={!showConfirmPassword}
              mode="outlined"
              style={[
                styles.input,
                { backgroundColor: theme.colors.input.background },
              ]}
              textColor={theme.colors.input.text}
              outlineColor={
                errors.confirmPassword
                  ? theme.colors.error
                  : theme.colors.input.border
              }
              activeOutlineColor={theme.colors.button.primary}
              error={!!errors.confirmPassword}
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
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}

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
              {t("auth.register")}
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
                {t("auth.alreadyHaveAccount")}{" "}
                <Text
                  style={[
                    styles.loginTextBold,
                    { color: theme.colors.text.accent },
                  ]}
                >
                  {t("auth.login")}
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
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 8,
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
