import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { useTheme } from "../../contexts/ThemeContext";
import Reanimated, {
  FadeInRight,
  FadeInLeft,
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";

import { useChatSocket } from "../../hooks/useChatSocket";
import messageService from "../../services/message-service";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";
import toastrService from "../../services/toastr-service";

import { Message } from "../../domain/message";
import { Chat, ChatStatus } from "../../domain/chat";
import {
  formatDate,
  formatMessageTime,
  formatDayForChat,
} from "../../utils/dateFormatter";
import LoadingSpinner from "../../utils/spinner";

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
    };
  };
}

interface MessageGroup {
  date: string;
  data: Message[];
}

const MessageItem = React.memo(
  ({ item, isMe }: { item: Message; isMe: boolean }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      messageWrapper: {
        marginVertical: theme.spacing.xs,
        marginHorizontal: theme.spacing.s,
        maxWidth: "85%",
      },
      messageContainer: {
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.large,
        backgroundColor: theme.colors.background.secondary,
      },
      myMessage: {
        alignSelf: "flex-end",
        backgroundColor: theme.colors.primary.light,
        borderBottomRightRadius: theme.spacing.xs,
      },
      otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: theme.colors.background.tertiary,
        borderBottomLeftRadius: theme.spacing.xs,
      },
      messageText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.3,
        marginBottom: theme.spacing.xs,
        fontWeight: "400",
      },
      messageTime: {
        color: theme.colors.text.secondary,
        fontSize: 11,
        alignSelf: "flex-end",
        opacity: 0.8,
        marginTop: 4,
      },
    });

    return (
      <Reanimated.View
        entering={isMe ? FadeInRight.springify() : FadeInLeft.springify()}
        style={[
          styles.messageWrapper,
          isMe ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
      >
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {formatMessageTime(item.createdDate)}
          </Text>
        </View>
      </Reanimated.View>
    );
  }
);

const DateSeparator = ({ date }: { date: Date }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.background.secondary,
    },
    dateText: {
      color: theme.colors.text.secondary,
      fontSize: 12,
      marginHorizontal: theme.spacing.m,
      fontWeight: "500",
    },
  });

  return (
    <Reanimated.View entering={FadeIn} style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.dateText}>{formatDayForChat(date)}</Text>
      <View style={styles.line} />
    </Reanimated.View>
  );
};

const MentorChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { chatId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const sendButtonScale = useSharedValue(1);

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList<MessageGroup>>(null);

  useEffect(() => {
    loadChat();
  }, [chatId]);

  const loadChat = async () => {
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
    if (!inputText.trim() || !chat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: currentUserId,
      content: inputText.trim(),
      createdDate: new Date(),
      isRead: false,
      createdBy: currentUserId,
      isDeleted: false,
    };

    try {
      sendMessage(currentUserId, inputText.trim());
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      sendButtonScale.value = withSequence(
        withSpring(1.2, { damping: 2 }),
        withSpring(1, { damping: 2 })
      );

      await messageService.create(
        newMessage,
        () => {},
        () => {}
      );
    } catch (error) {
      console.error("Mesaj gönderilemedi", error);
      toastrService.error(t("messageNotSent"));
    }
  };

  const handleEndChat = async () => {
    if (!chat) return;

    try {
      await chatService.update(
        {
          ...chat,
          status: ChatStatus.Closed,
        },
        () => {},
        () => {}
      );
      setChatEnded(true);
      toastrService.success(t("chatEnded"));
    } catch (error) {
      console.error("Sohbet sonlandırılamadı", error);
      toastrService.error(t("chatNotEnded"));
    }
  };

  const sendButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sendButtonScale.value }],
    };
  });

  const groupedMessages = useMemo(() => {
    const groups: MessageGroup[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdDate);
      const dateString = messageDate.toDateString();

      const existingGroup = groups.find(
        (g) => new Date(g.date).toDateString() === dateString
      );

      if (existingGroup) {
        existingGroup.data.push(message);
      } else {
        groups.push({
          date: messageDate.toISOString(),
          data: [message],
        });
      }
    });

    return groups.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [messages]);

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === currentUserId;
    return <MessageItem item={item} isMe={isMe} />;
  };

  const renderDateSeparator = ({ date }: { date: string }) => {
    return <DateSeparator date={new Date(date)} />;
  };

  if (isLoading || !chat || !chat.match) {
    return <LoadingSpinner visible={true} />;
  }

  const otherUser = chat.match.sender;

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background.secondary,
      backgroundColor: theme.colors.background.primary,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.m,
    },
    username: {
      color: theme.colors.text.primary,
      fontSize: 18,
      fontWeight: "600",
    },
    endChatButton: {
      marginLeft: "auto",
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      backgroundColor: theme.colors.error.main,
      borderRadius: theme.borderRadius.small,
    },
    endChatText: {
      color: theme.colors.text.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      alignItems: "center",
      borderTopWidth: 1,
      borderColor: theme.colors.background.secondary,
      backgroundColor: theme.colors.background.primary,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.large,
      fontSize: 16,
      minHeight: 45,
    },
    sendButton: {
      marginLeft: theme.spacing.m,
      backgroundColor: theme.colors.primary.main,
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: "center",
      alignItems: "center",
    },
    sendText: {
      color: theme.colors.text.primary,
      fontSize: 20,
    },
    chatEndedText: {
      color: theme.colors.text.secondary,
      fontSize: 14,
      textAlign: "center",
      marginVertical: theme.spacing.m,
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing.m,
      borderRadius: theme.borderRadius.medium,
      marginHorizontal: theme.spacing.m,
    },
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <Reanimated.View entering={FadeIn} style={styles.header}>
          <Image
            source={{ uri: otherUser.imageUrl || "https://placehold.co/40x40" }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {otherUser.username ?? "Kullanıcı"}
          </Text>

          {messages.length >= 10 && !chatEnded && (
            <AnimatedTouchable
              entering={FadeIn.delay(500)}
              style={styles.endChatButton}
              onPress={handleEndChat}
            >
              <Text style={styles.endChatText}>{t("endChat")}</Text>
            </AnimatedTouchable>
          )}
        </Reanimated.View>

        <FlatList<MessageGroup>
          ref={flatListRef}
          data={groupedMessages}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <>
              {renderDateSeparator({ date: item.date })}
              {item.data.map((message, index) => (
                <React.Fragment key={message.id}>
                  {renderItem({ item: message, index })}
                </React.Fragment>
              ))}
            </>
          )}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingVertical: theme.spacing.m }}
          showsVerticalScrollIndicator={false}
        />

        {chatEnded && (
          <Reanimated.Text entering={FadeIn} style={styles.chatEndedText}>
            {t("chatHasEnded")}
          </Reanimated.Text>
        )}

        {!chatEnded && (
          <Reanimated.View entering={SlideInDown} style={styles.inputContainer}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              placeholder={t("writeMessage")}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={1}
            />
            <AnimatedTouchable
              onPress={handleSendMessage}
              style={[styles.sendButton, sendButtonStyle]}
            >
              <Text style={styles.sendText}>➤</Text>
            </AnimatedTouchable>
          </Reanimated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MentorChatScreen;
