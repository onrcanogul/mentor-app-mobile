import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import aiAssistantService from "../../services/ai-assistant-service";
import toastrService from "../../services/toastr-service";
import { AIChat } from "../../domain/aichat";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import userService from "../../services/user-service";

const GeneralAIAssistantScreen = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const [title, setTitle] = useState("");
  const [chats, setChats] = useState<AIChat[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const startChat = async () => {
    if (title.trim() === "") return;

    setIsCreating(true);
    const chat = await aiAssistantService.startChat({
      userId: (await userService.getCurrentUser()).id,
      title,
      createdBy: "SYSTEM",
    });

    if (chat) {
      toastrService.success(t("aiChatRedirect"));
      setChats((prev) => [...prev, chat]);
      setTitle("");

      setTimeout(() => {
        navigator.navigate("AIChat", { chatId: chat.id });
        setIsCreating(false);
      }, 1000);
    } else {
      toastrService.error(t("chatStartError"));
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const chats = await aiAssistantService.getPrevious(
      (
        await userService.getCurrentUser()
      ).id
    );
    if (chats) setChats(chats);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{t("aiAssistant")} 🤖</Text>
      <Text style={styles.description}>{t("welcomeAIMessage")}</Text>

      <TextInput
        placeholder={t("chatTitle")}
        placeholderTextColor="#888"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity
        style={[styles.newChatButton, isCreating && { opacity: 0.6 }]}
        onPress={startChat}
        disabled={isCreating}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          {isCreating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.newChatText}>{t("startNewChat")}</Text>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.subTitle}>📚 {t("previousChats")}</Text>
      <FlatList
        style={{ flex: 1 }}
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              navigator.navigate("AIChat", {
                chatId: item.id,
              })
            }
          >
            <Text style={styles.chatQuestion}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
  },
  description: { color: "#CCCCCC", marginBottom: 20, fontSize: 14 },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A0A0A0",
    marginTop: 20,
    marginBottom: 10,
  },
  chatItem: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  chatQuestion: {
    color: "#FFFFFF",
  },
  newChatButton: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  newChatText: {
    color: "#121212",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
});

export default GeneralAIAssistantScreen;
