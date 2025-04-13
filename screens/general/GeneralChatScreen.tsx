import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Chat } from "../../domain/chat";
import { Message } from "../../domain/message";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";
import { formatDate } from "../../utils/dateFormatter";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type RouteParams = {
  chatId: string;
};

const GeneralChatScreen = () => {
  const route = useRoute();
  const { chatId } = route.params as RouteParams;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchChat();
    }
  }, [currentUserId]);

  async function getCurrentUser() {
    const user = await userService.getCurrentUser();
    setCurrentUserId(user.id);
  }

  async function fetchChat() {
    if (!currentUserId) return;
    const chatResult = await chatService.getById(chatId);
    if (chatResult) {
      setChat(chatResult);
      navigation.setOptions({
        title: chatResult.match
          ? chatResult.match.sender.username
          : t("conversation"),
      });
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !currentUserId || !chat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: chat.id,
      content: message.trim(),
      senderId: currentUserId,
      createdDate: new Date(),
      isRead: false,
    };

    const updatedChat = {
      ...chat,
      messages: [...(chat.messages || []), newMessage],
    };

    setChat(updatedChat);
    setMessage("");

    try {
      await chatService.create(chat.id, newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    if (!currentUserId) return null;

    const isCurrentUser = item.senderId === currentUserId;
    const showDateSeparator =
      index === 0 ||
      new Date(item.createdDate).toDateString() !==
        new Date(chat?.messages?.[index - 1]?.createdDate || "").toDateString();

    return (
      <Animated.View entering={SlideInRight.delay(index * 50).springify()}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text
              style={[styles.dateText, { color: theme.colors.text.secondary }]}
            >
              {formatDate(new Date(item.createdDate))}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
            {
              backgroundColor: isCurrentUser
                ? theme.colors.primary.main
                : theme.colors.background.secondary,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isCurrentUser
                  ? theme.colors.text.primary
                  : theme.colors.text.primary,
              },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.timeText,
              {
                color: isCurrentUser
                  ? theme.colors.text.primary
                  : theme.colors.text.secondary,
              },
            ]}
          >
            {formatDate(new Date(item.createdDate))}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={chat?.messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.colors.background.secondary },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.primary,
              },
            ]}
            placeholder={t("typeMessage")}
            placeholderTextColor={theme.colors.text.disabled}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim()
                  ? theme.colors.primary.main
                  : theme.colors.text.disabled,
              },
            ]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Icon name="send" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GeneralChatScreen;
