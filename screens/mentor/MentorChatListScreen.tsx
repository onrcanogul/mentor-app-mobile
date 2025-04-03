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
import { SafeAreaView } from "react-native-safe-area-context"; // Safe Area eklendi
import { Chat } from "../../domain/chat";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../utils/spinner";
import { formatDate } from "../../utils/dateFormatter";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";

const MentorChatListScreen = () => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const [chatsFromDb, setChatsFromDb] = useState<Chat[]>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      fetch();
      getCurrentUser();
    }, [])
  );

  async function fetch() {
    const user = await userService.getCurrentUser();
    var chats = await chatService.get(
      user.id,
      () => {},
      () => {}
    );
    setChatsFromDb(chats);
  }

  async function getCurrentUser() {
    setCurrentUserId("4d11f77a-ea4d-4e91-ad5c-f44ed7b75c61");
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
        onPress={() => navigation.navigate("MentorChat", { chatId: item.id })}
      >
        <View style={styles.chatContainer}>
          <View>
            <Text style={styles.name}>{otherUser.username}</Text>
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
          <Text style={styles.header}>💬 {t("myConversations")}</Text>
          <FlatList
            data={chatsFromDb}
            keyExtractor={(item) => item.id}
            renderItem={renderChat}
            refreshing={isLoading} // 👈 refresh indicator
            onRefresh={fetch} // 👈 aşağı çekilince fetch çalışır
          />
        </View>
      </SafeAreaView>
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
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
});

export default MentorChatListScreen;
