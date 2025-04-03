import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App"; // Burada App.tsx veya doğru dosyanın yolu kullanılmalı

type AuthScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Auth" // Bu ekranın ismi
>;

type Props = {
  navigation: AuthScreenNavigationProp;
};

const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const isLoggedIn = true; // Simüle edilen token durumu

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Mentor Match</Title>
          <Paragraph style={styles.subtitle}>Hikayenizi Başlatın!</Paragraph>
        </Card.Content>
        {isLoggedIn ? (
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            Hoş geldiniz!
          </Button>
        ) : (
          <View>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => navigation.navigate("Login")}
            >
              Giriş Yap
            </Button>
            <Button
              mode="outlined"
              style={styles.button}
              onPress={() => navigation.navigate("Register")}
            >
              Kayıt Ol
            </Button>
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  card: {
    width: "85%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4F46E5",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
});

export default AuthScreen;
