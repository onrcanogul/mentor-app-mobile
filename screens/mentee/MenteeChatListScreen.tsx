import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chat } from "../../domain/chat";
import { AIChat } from "../../domain/aichat";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/dateFormatter";
import chatService from "../../services/chat-service";
import aiAssistantService from "../../services/ai-assistant-service";
import userService from "../../services/user-service";

const MenteeChatListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [aiChats, setAiChats] = useState<AIChat[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"normal" | "ai">("normal");

  useFocusEffect(
    useCallback(() => {
      getCurrentUser();
    }, [])
  );

  async function getCurrentUser() {
    const userId = (await userService.getCurrentUser()).id;
    setCurrentUserId(userId);
    fetchChats(userId);
    fetchAIChats(userId);
  }

  async function fetchChats(userId: string) {
    const chatResult = await chatService.get(
      userId,
      () => {},
      () => {}
    );
    console.log(chatResult);
    if (chatResult) setChats(chatResult);
  }

  async function fetchAIChats(userId: string) {
    const aiResult = await aiAssistantService.getPrevious(userId);
    setAiChats(aiResult || []);
  }

  const renderChat = ({ item }: { item: Chat }) => {
    if (!item.match || !currentUserId) return null;

    const isCurrentUserExperienced =
      currentUserId === item.match.experiencedUserId;

    const otherUser = isCurrentUserExperienced
      ? item.match.inexperiencedUser
      : item.match.experiencedUser;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("MenteeChat", { chatId: item.id })}
      >
        <View style={styles.chatContainer}>
          <View>
            <Text style={styles.name}>
              {item.match.experiencedUser.username}
            </Text>
            <Text style={styles.lastMessage}>
              {item.messages?.[item.messages.length - 1]?.content ??
                t("noMessages")}
            </Text>
          </View>
          <Text style={styles.time}>{formatDate(item.createdDate)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAIChat = ({ item }: { item: AIChat }) => {
    const truncatedTitle =
      item.title && item.title.length > 20
        ? item.title.slice(0, 20) + "..."
        : item.title || "🧠 AI Asistan";

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("AIChat", { chatId: item.id })}
      >
        <View style={styles.aiChatContainer}>
          <View>
            <Text style={styles.name}>{truncatedTitle}</Text>
            <Text style={styles.lastMessage}>
              {item.messages?.[item.messages.length - 1]?.content ??
                t("noMessages")}
            </Text>
          </View>
          <Text style={styles.time}>{formatDate(item.createdDate)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "normal" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("normal")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "normal" && styles.activeTabText,
                ]}
              >
                💬 {t("myConversations")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "ai" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("ai")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "ai" && styles.activeTabText,
                ]}
              >
                🧠 {t("aiAssistant")}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "normal" ? (
            <FlatList
              data={chats.filter((chat) => !chat.isAiChat)}
              keyExtractor={(item) => item.id}
              renderItem={renderChat}
              refreshing={isLoading}
              onRefresh={() => fetchChats}
            />
          ) : (
            <FlatList
              data={aiChats}
              renderItem={renderAIChat}
              refreshing={isLoading}
              onRefresh={() => fetchAIChats}
            />
          )}
        </View>
      </SafeAreaView>
      {/* <LoadingSpinner visible={isLoading} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  aiChatContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  lastMessage: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  time: {
    fontSize: 12,
    color: "#FFD700",
    marginLeft: "auto",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    marginBottom: 15,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: "#FFD700",
  },
  tabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#000000",
  },
});

export default MenteeChatListScreen;
