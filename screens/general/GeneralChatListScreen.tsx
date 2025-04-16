import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
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
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type RootStackParamList = {
  GeneralChat: { chatId: string };
  AIChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GeneralChatListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
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
    setLoading(true);
    const chatResult = await chatService.getForCommunity(
      userId,
      () => {},
      () => {}
    );
    if (chatResult) setChats(chatResult);
    console.log(chatResult);
    setLoading(false);
  }

  async function fetchAIChats(userId: string) {
    setLoading(true);
    const aiResult = await aiAssistantService.getPrevious(userId);
    setAiChats(aiResult || []);
    setLoading(false);
  }

  const renderChat = ({ item, index }: { item: Chat; index: number }) => {
    if (!item.match || !currentUserId) return null;

    const isCurrentUserExperienced = currentUserId === item.match.receiverId;
    const otherUser = isCurrentUserExperienced
      ? item.match.sender
      : item.match.receiver;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      otherUser.username
    )}&background=random`;

    return (
      <AnimatedTouchable
        entering={FadeInRight.delay(index * 100).springify()}
        style={styles.chatContainer}
        onPress={() => navigation.navigate("GeneralChat", { chatId: item.id })}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.name, { color: theme.colors.text.primary }]}>
              {otherUser.username}
            </Text>
            <Text style={[styles.time, { color: theme.colors.text.secondary }]}>
              {formatDate(item.createdDate)}
            </Text>
          </View>
          <Text
            style={[styles.lastMessage, { color: theme.colors.text.secondary }]}
          >
            {item.messages?.[item.messages.length - 1]?.content ??
              t("noMessages")}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  };

  const renderAIChat = ({ item, index }: { item: AIChat; index: number }) => {
    const truncatedTitle =
      item.title && item.title.length > 25
        ? item.title.slice(0, 25) + "..."
        : item.title || "AI Asistan";

    return (
      <AnimatedTouchable
        entering={FadeInRight.delay(index * 100).springify()}
        style={styles.chatContainer}
        onPress={() => navigation.navigate("AIChat", { chatId: item.id })}
      >
        <View
          style={[
            styles.aiAvatar,
            { backgroundColor: theme.colors.primary.main },
          ]}
        >
          <Text style={styles.aiEmoji}>🤖</Text>
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.name, { color: theme.colors.text.primary }]}>
              {truncatedTitle}
            </Text>
            <Text style={[styles.time, { color: theme.colors.text.secondary }]}>
              {formatDate(item.createdDate)}
            </Text>
          </View>
          <Text
            style={[styles.lastMessage, { color: theme.colors.text.secondary }]}
            numberOfLines={1}
          >
            {item.messages?.[item.messages.length - 1]?.content ??
              t("noMessages")}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["top"]}
    >
      <View
        style={[
          styles.tabRow,
          { backgroundColor: theme.colors.background.secondary },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "normal" && {
              borderBottomColor: theme.colors.primary.main,
              borderBottomWidth: 3,
            },
          ]}
          onPress={() => setActiveTab("normal")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "normal"
                    ? theme.colors.primary.main
                    : theme.colors.text.disabled,
              },
            ]}
          >
            {t("chats")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "ai" && {
              borderBottomColor: theme.colors.primary.main,
              borderBottomWidth: 3,
            },
          ]}
          onPress={() => setActiveTab("ai")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "ai"
                    ? theme.colors.primary.main
                    : theme.colors.text.disabled,
              },
            ]}
          >
            {t("aiAssistant")}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "normal" ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          refreshing={isLoading}
          onRefresh={getCurrentUser}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: theme.colors.text.disabled },
              ]}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={aiChats}
          keyExtractor={(item) => item.id}
          renderItem={renderAIChat}
          refreshing={isLoading}
          onRefresh={getCurrentUser}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: theme.colors.text.disabled },
              ]}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  listContainer: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    opacity: 0.08,
  },
  chatContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  aiEmoji: {
    fontSize: 24,
  },
});

export default GeneralChatListScreen;
