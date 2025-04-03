import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { useChatSocket } from "../../hooks/useChatSocket";
import messageService from "../../services/message-service";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";

import { Message } from "../../domain/message";
import { Chat, ChatStatus } from "../../domain/chat";
import { formatDate } from "../../utils/dateFormatter";
import LoadingSpinner from "../../utils/spinner";

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
      user: {
        username: string;
        avatarUrl?: string;
      };
    };
  };
}

const MenteeChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId, user } = route.params;
  const { t } = useTranslation();

  const [chat, setChat] = useState<Chat>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [chatEnded, setChatEnded] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    loadChat();
    console.log(chat);
  }, [chatId]);

  const loadChat = async () => {
    const response = await chatService.getById(
      chatId,
      () => {},
      () => {}
    );
    if (response) {
      setChat(response);
      console.log(response);
      console.log(chat);
      setMessages(response.messages);
      const currentUser = await userService.getCurrentUser();
      setCurrentUserId(currentUser.id);
      setChatEnded(response.status === ChatStatus.Closed);
    }
  };

  const { sendMessage } = useChatSocket(chatId, (senderId, message) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId,
      content: message,
      createdDate: new Date(),
      isRead: false,
      createdBy: "SYSTEM",
      isDeleted: false,
    };
    setMessages((prev) => [...prev, newMessage]);
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUserId || chatEnded) return;

    const newMsg: Message = {
      chatId,
      senderId: currentUserId,
      content: inputText,
      createdDate: new Date(),
      isRead: false,
      createdBy: "SYSTEM",
      isDeleted: false,
    };

    setInputText("");
    await sendMessage(currentUserId, inputText);
    await messageService.create(
      newMsg,
      () => {},
      () => console.warn("Mesaj DB'ye yazılamadı")
    );
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEndChat = async () => {
    const result = await chatService.close(chatId);
    if (result === true) {
      toastrService.success(t("endChatSuccess"));
      setChatEnded(true);
    } else {
      toastrService.error(t("endChatError"));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={styles.messageWrapper}>
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>{formatDate(item.createdDate)}</Text>
        </View>
      </View>
    );
  };

  if (!chat || !chat.match) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LoadingSpinner visible={true} />
      </SafeAreaView>
    );
  }
  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* 👤 HEADER */}
          <View style={styles.header}>
            <Image
              source={{
                uri: chat.match.experiencedUser.imageUrl,
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>
              {chat.match.experiencedUser.username ?? "Oo"}
            </Text>

            {/* ➕ Görüşmeyi Sonlandır Butonu */}
            {messages.length >= 10 && !chatEnded && (
              <TouchableOpacity
                style={styles.endChatButton}
                onPress={handleEndChat}
              >
                <Text style={styles.endChatText}>{t("endChat")}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 💬 MESSAGES */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id!}
            renderItem={renderMessage}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {/* 🚫 GÖRÜŞME BİTTİ UYARISI */}
          {chatEnded && (
            <Text style={styles.chatEndedText}>{t("chatHasEnded")}</Text>
          )}

          {/* ✍️ MESAJ GİRİŞ ALANI */}
          {!chatEnded && (
            <View style={styles.inputContainer}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                style={styles.input}
                placeholder={t("writeMessage")}
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                style={styles.sendButton}
              >
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default MenteeChatScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1, padding: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
    marginBottom: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  endChatButton: {
    marginLeft: "auto",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#C62828",
    borderRadius: 8,
  },
  endChatText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  messageWrapper: { marginVertical: 1 },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#075E54",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#1E1E1E",
  },
  messageText: { color: "#FFFFFF", fontSize: 16 },
  messageTime: {
    color: "#A0A0A0",
    fontSize: 12,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1E1E1E",
  },
  input: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 20,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#075E54",
    padding: 10,
    borderRadius: 20,
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  chatEndedText: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
});
