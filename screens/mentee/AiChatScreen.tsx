import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { formatDate } from "../../utils/dateFormatter";
import aiAssistantService from "../../services/ai-assistant-service";
import { AIChat } from "../../domain/aichat";
import { AIMessage, AIMessageSender } from "../../domain/aimessage";
import userService from "../../services/user-service";
import { useTranslation } from "react-i18next";

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

const AiChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const { chatId, user } = route.params;
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [chat, setChat] = useState<AIChat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const flatListRef = useRef<FlatList<AIMessage>>(null);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [chatId])
  );
  const load = async () => {
    const chat = await aiAssistantService.getChat(chatId);
    if (chat !== null) {
      setChat(chat);
      setMessages(chat.messages);
      setCurrentUserId((await userService.getCurrentUser()).id);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || !currentUserId) return;

    const newMessage: AIMessage = {
      id: `${Date.now()}`,
      aiChatId: chatId,
      message: inputText,
      sender: AIMessageSender.Mentee,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const response = await aiAssistantService.askQuestion(
      chatId,
      inputText,
      AIMessageSender.Mentee
    );

    if (response) {
      setMessages((prev) => [...prev, response]);
    }

    setIsTyping(false);
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: AIMessage;
    index: number;
  }) => {
    const isMe = item.sender !== AIMessageSender.Ai;
    return (
      <View style={styles.messageWrapper}>
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.messageTime}>{formatDate(item.createdDate)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/ai-icon.png")}
            style={styles.avatar}
          />
          <Text style={styles.username}>{t("aiAssistant")}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id!}
          renderItem={renderMessage}
          refreshing={loading}
          onRefresh={load}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>{t("aiAssistant")}...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>{t("noMessages")} 💬</Text>
            )
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            style={styles.input}
            placeholder="Mesaj yaz..."
            placeholderTextColor="#A0A0A0"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AiChatScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  messageWrapper: { marginVertical: 1, maxWidth: "100%" },
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
  typingIndicator: {
    padding: 10,
    alignSelf: "flex-start",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    marginVertical: 5,
  },
  typingText: { color: "#A0A0A0", fontStyle: "italic" },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1E1E1E",
    marginBottom: Platform.OS === "ios" ? 10 : 0,
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
});
