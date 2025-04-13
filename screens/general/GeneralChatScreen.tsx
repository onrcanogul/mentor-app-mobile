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
import { useTranslation } from "react-i18next";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

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
    };
  };
}

const GeneralChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId } = route.params;
  const { t } = useTranslation();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await chatService.getById(
          chatId,
          () => {},
          () => {}
        );
        if (response) {
          setChat(response);
          setMessages(response.messages);
          setChatEnded(response.status === ChatStatus.Closed);

          const currentUser = await userService.getCurrentUser();
          setCurrentUserId(currentUser.id);
        }
      } catch (error) {
        console.error("Chat verisi çekilemedi", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

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
      () => {}
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

  if (isLoading || !chat) {
    return <LoadingSpinner visible={true} />;
  }

  const userInfo = chat.match.sender;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: userInfo.imageUrl || "https://placehold.co/40x40" }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {userInfo.username ?? "Kullanıcı"}
          </Text>

          {messages.length >= 10 && !chatEnded && (
            <TouchableOpacity
              style={styles.endChatButton}
              onPress={handleEndChat}
            >
              <Text style={styles.endChatText}>{t("endChat")}</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id!}
          renderItem={renderMessage}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {chatEnded && (
          <Text style={styles.chatEndedText}>{t("chatHasEnded")}</Text>
        )}

        {!chatEnded && (
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="mic" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="videocam" size={20} color="#FFF" />
            </TouchableOpacity>
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
  );
};

export default GeneralChatScreen;

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
  endChatText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  messageWrapper: { marginVertical: 1 },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#075E54" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#1E1E1E" },
  messageText: { color: "#FFFFFF", fontSize: 16 },
  messageTime: {
    color: "#A0A0A0",
    fontSize: 12,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1E1E1E",
    padding: 10,
  },
  mediaButton: {
    marginRight: 10,
    padding: 6,
    backgroundColor: "#2E2E2E",
    borderRadius: 20,
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
  sendText: { color: "#FFFFFF", fontSize: 18 },
  chatEndedText: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
});
