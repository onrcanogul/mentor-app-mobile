import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { UserType } from "../../domain/user";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import toastrService from "../../services/toastr-service";
import userService from "../../services/user-service";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

type RootStackParamList = {
  Login: { userType: UserType };
};

type LoginScreenRouteProp = RouteProp<RootStackParamList, "Login">;

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<LoginScreenRouteProp>();
  const { userType } = route.params;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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
        }, 500);
      },
      () => {
        setLoading(false);
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>
        {userType === UserType.Mentee
          ? "👩‍🎓 Mentee"
          : userType === UserType.Mentor
          ? "🧑‍🏫 Mentor"
          : ""}{" "}
        | {t("login")}
      </Text>

      <TextInput
        label={t("emailOrUsername")}
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        textColor="#FFFFFF"
        theme={{
          colors: {
            primary: "#FFD700",
            text: "#FFFFFF",
            placeholder: "#AAAAAA",
            background: "#1E1E1E",
          },
        }}
      />

      <TextInput
        label={t("password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        textColor="#FFFFFF"
        theme={{
          colors: {
            primary: "#FFD700",
            text: "#FFFFFF",
            placeholder: "#AAAAAA",
            background: "#1E1E1E",
          },
        }}
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        {t("login")}
      </Button>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register", { userType })}
      >
        <Text style={styles.linkText}>{t("dontHaveAccount")}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 26,
    color: "#FFD700",
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#1E1E1E",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#121212",
    fontSize: 16,
  },
  linkText: {
    marginTop: 15,
    textAlign: "center",
    color: "#AAAAAA",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});

export default LoginScreen;
