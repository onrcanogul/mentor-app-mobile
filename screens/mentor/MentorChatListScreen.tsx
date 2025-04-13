import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chat } from "../../domain/chat";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/dateFormatter";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type RootStackParamList = {
  MentorChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MentorChatListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [isLoading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCurrentUser();
    }, [])
  );

  async function getCurrentUser() {
    const user = await userService.getCurrentUser();
    setCurrentUserId(user.id);
    fetchChats(user.id);
  }

  async function fetchChats(userId: string) {
    setLoading(true);
    const chatResult = await chatService.get(
      userId,
      () => {},
      () => {}
    );
    if (chatResult) setChats(chatResult);
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
        onPress={() => navigation.navigate("MentorChat", { chatId: item.id })}
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

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["top"]}
    >
      <View style={styles.container}>
        <Text style={[styles.header, { color: theme.colors.text.primary }]}>
          💬 {t("myConversations")}
        </Text>
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
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
});

export default MentorChatListScreen;
