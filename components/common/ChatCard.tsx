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

interface ChatCardProps {
  item: Chat;
  currentUserId: string;
}

const ChatCard = ({ item, currentUserId }: ChatCardProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  if (!item.match || !currentUserId) return null;

  const isCurrentUserExperienced = currentUserId === item.match.receiverId;

  const otherUser = isCurrentUserExperienced
    ? item.match.sender
    : item.match.receiver;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Chat", { chatId: item.id })}
    >
      <View style={styles.chatContainer}>
        <Image source={{ uri: "asd" }} style={styles.avatar} />
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

const styles = StyleSheet.create({
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

export default ChatCard;
