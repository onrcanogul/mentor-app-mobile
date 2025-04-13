import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App"; // Burada App.tsx veya doğru dosyanın yolu kullanılmalı
import { useTheme } from "../../contexts/ThemeContext";

type AuthScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Auth" // Bu ekranın ismi
>;

type Props = {
  navigation: AuthScreenNavigationProp;
};

const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const isLoggedIn = true; // Simüle edilen token durumu

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border,
            borderWidth: 1,
          },
        ]}
      >
        <Card.Content>
          <Title style={[styles.title, { color: theme.colors.text.accent }]}>
            Mentor Match
          </Title>
          <Paragraph
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            Hikayenizi Başlatın!
          </Paragraph>
        </Card.Content>
        {isLoggedIn ? (
          <Button
            mode="contained"
            style={[
              styles.button,
              { backgroundColor: theme.colors.button.primary },
            ]}
            labelStyle={{ color: theme.colors.button.text }}
            onPress={() => navigation.navigate("Home")}
          >
            Hoş geldiniz!
          </Button>
        ) : (
          <View>
            <Button
              mode="contained"
              style={[
                styles.button,
                { backgroundColor: theme.colors.button.primary },
              ]}
              labelStyle={{ color: theme.colors.button.text }}
              onPress={() => navigation.navigate("Login")}
            >
              Giriş Yap
            </Button>
            <Button
              mode="outlined"
              style={[
                styles.button,
                { borderColor: theme.colors.button.primary },
              ]}
              labelStyle={{ color: theme.colors.button.primary }}
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
  },
  card: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
});

export default AuthScreen;
