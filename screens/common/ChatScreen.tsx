import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
import { useTheme } from "../../contexts/ThemeContext";
import { Message, MessageType } from "../../domain/message";
import { Chat, ChatStatus } from "../../domain/chat";
import { formatDate } from "../../utils/dateFormatter";

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

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId, user } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [chat, setChat] = useState<Chat>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [chatEnded, setChatEnded] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  useFocusEffect(
    useCallback(() => {
      const loadChat = async () => {
        const response = await chatService.getById(
          chatId,
          () => {},
          () => {}
        );
        if (response) {
          setChat(response);
          setMessages(response.messages);
          const currentUser = await userService.getCurrentUser();
          setCurrentUserId(currentUser.id);
          setChatEnded(response.status === ChatStatus.Closed);
        }
      };
      loadChat();
    }, [chatId])
  );

  const { sendMessage } = useChatSocket(chatId, (message) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdDate: new Date(message.createdDate),
      isRead: message.isRead,
      createdBy: "SYSTEM",
      isDeleted: false,
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      duration: message.duration,
    };

    setMessages((prev) => {
      const messageExists = prev.some(
        (msg) =>
          msg.senderId === newMessage.senderId &&
          msg.content === newMessage.content &&
          Math.abs(
            new Date(msg.createdDate).getTime() -
              new Date(newMessage.createdDate).getTime()
          ) < 1000
      );

      if (!messageExists) {
        const updatedMessages = [...prev, newMessage];
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100
        );
        return updatedMessages;
      }
      return prev;
    });
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUserId || chatEnded) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: currentUserId,
      content: inputText,
      createdDate: new Date(),
      isRead: false,
      createdBy: "SYSTEM",
      isDeleted: false,
      messageType: MessageType.Text,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await sendMessage(currentUserId, inputText);

      await messageService.create(
        newMsg,
        () => {},
        () => console.warn("Mesaj DB'ye yazılamadı")
      );
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== newMsg.id));
      toastrService.error(t("messageSendError"));
    }
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

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <View
          style={[
            styles.header,
            { borderBottomColor: theme.colors.card.border },
          ]}
        >
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=OnurcanOgul`,
            }}
            style={styles.avatar}
          />
          <Text style={[styles.username, { color: theme.colors.text.primary }]}>
            {"Onurcan Oğul"}
          </Text>
          {!chatEnded && (
            <TouchableOpacity
              style={[
                styles.endChatButton,
                { backgroundColor: theme.colors.button.primary },
              ]}
              onPress={handleEndChat}
            >
              <Text
                style={[
                  styles.endChatText,
                  { color: theme.colors.button.text },
                ]}
              >
                {t("endChat")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageWrapper}>
              <View
                style={[
                  styles.messageContainer,
                  item.senderId === currentUserId
                    ? [
                        styles.myMessage,
                        { backgroundColor: theme.colors.button.primary },
                      ]
                    : [
                        styles.otherMessage,
                        { backgroundColor: theme.colors.card.background },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {formatDate(item.createdDate)}
                </Text>
              </View>
            </View>
          )}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {chatEnded ? (
          <Text
            style={[
              styles.chatEndedText,
              { color: theme.colors.text.secondary },
            ]}
          >
            {t("chatHasEnded")}
          </Text>
        ) : (
          <View
            style={[
              styles.inputContainer,
              { borderColor: theme.colors.card.border },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.input.background,
                  color: theme.colors.input.text,
                  borderColor: theme.colors.input.border,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t("writeMessage")}
              placeholderTextColor={theme.colors.input.placeholder}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.button.primary },
              ]}
              onPress={handleSendMessage}
            >
              <Text
                style={[styles.sendText, { color: theme.colors.button.text }]}
              >
                ➤
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  container: { flex: 1, padding: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  endChatButton: {
    marginLeft: "auto",
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 10,
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
