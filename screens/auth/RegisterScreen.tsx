import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, RadioButton } from "react-native-paper";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { UserType } from "../../domain/user";
import { useTranslation } from "react-i18next";

type RootStackParamList = {
  Register: { userType: UserType };
};

type RegisterScreenRouteProp = RouteProp<RootStackParamList, "Register">;

const RegisterScreen: React.FC = () => {
  const route = useRoute<RegisterScreenRouteProp>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { userType } = route.params;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<"Mentor" | "Mentee">("Mentee");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    await userService.register(
      {
        userName: fullName,
        fullName,
        email,
        password,
        confirmPassword,
        userRole: userRole === "Mentor" ? 0 : 1,
      },
      () => {
        toastrService.success(t("registerSuccess"));
        navigation.navigate("Home");
        setLoading(false);
      },
      () => {
        toastrService.error(t("registerSuccess"));
        setLoading(false);
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>📝 {t("register")}</Text>

      <TextInput
        label={t("fullName")}
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={styles.input}
        textColor="#FFFFFF"
        theme={inputTheme}
      />

      <TextInput
        label={t("email")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
        textColor="#FFFFFF"
        theme={inputTheme}
      />

      <TextInput
        label={t("password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        textColor="#FFFFFF"
        theme={inputTheme}
      />

      <TextInput
        label={t("confirmPassword")}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        textColor="#FFFFFF"
        theme={inputTheme}
      />

      <View style={styles.radioContainer}>
        <RadioButton.Group
          onValueChange={(value) => setUserRole(value as "Mentor" | "Mentee")}
          value={userRole}
        >
          <View style={styles.radioRow}>
            <RadioButton value="Mentor" color="#FFD700" />
            <Text style={styles.radioText}>Mentor</Text>
            <RadioButton value="Mentee" color="#FFD700" />
            <Text style={styles.radioText}>Mentee</Text>
          </View>
        </RadioButton.Group>
      </View>

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        {t("register")}
      </Button>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login", { userType })}
      >
        <Text style={styles.linkText}>{t("alreadyHaveAccount")}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const inputTheme = {
  colors: {
    primary: "#FFD700",
    text: "#FFFFFF",
    placeholder: "#AAAAAA",
    background: "#1E1E1E",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#1E1E1E",
  },
  radioContainer: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioText: {
    color: "#FFFFFF",
    fontSize: 15,
    marginRight: 25,
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

export default RegisterScreen;
