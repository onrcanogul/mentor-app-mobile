import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
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

import aiAssistantService from "../../services/ai-assistant-service";
import { AIChat } from "../../domain/aichat";
import { AIMessage, AIMessageSender } from "../../domain/aimessage";
import userService from "../../services/user-service";
import {
  formatDate,
  formatMessageTime,
  formatDayForChat,
} from "../../utils/dateFormatter";

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
  data: AIMessage[];
}

const MessageItem = React.memo(
  ({ item, isMe }: { item: AIMessage; isMe: boolean }) => {
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
          <Text style={styles.messageText}>{item.message}</Text>
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

const AiChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { chatId } = route.params;
  const sendButtonScale = useSharedValue(1);

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [chat, setChat] = useState<AIChat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const flatListRef = useRef<FlatList<MessageGroup>>(null);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [chatId])
  );

  const load = async () => {
    setLoading(true);
    try {
      const chat = await aiAssistantService.getChat(chatId);
      if (chat !== null) {
        setChat(chat);
        setMessages(chat.messages);
        setCurrentUserId((await userService.getCurrentUser()).id);
      }
    } catch (error) {
      console.error("AI Chat verisi çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || !currentUserId || isTyping) return;

    sendButtonScale.value = withSequence(withSpring(0.8), withSpring(1));

    const newMessage: AIMessage = {
      id: `${Date.now()}`,
      aiChatId: chatId,
      message: inputText,
      sender: AIMessageSender.Mentee,
      createdDate: new Date(),
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
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    setIsTyping(false);
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

  const renderItem = ({ item, index }: { item: AIMessage; index: number }) => {
    const isMe = item.sender !== AIMessageSender.Ai;
    return <MessageItem item={item} isMe={isMe} />;
  };

  const renderDateSeparator = ({ date }: { date: string }) => {
    return <DateSeparator date={new Date(date)} />;
  };

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
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
    typingIndicator: {
      padding: theme.spacing.m,
      marginHorizontal: theme.spacing.m,
      backgroundColor: theme.colors.background.tertiary,
      borderRadius: theme.borderRadius.medium,
      alignSelf: "flex-start",
      marginVertical: theme.spacing.s,
    },
    typingText: {
      color: theme.colors.text.secondary,
      fontStyle: "italic",
      fontSize: 14,
    },
    emptyText: {
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginTop: theme.spacing.xl,
      fontStyle: "italic",
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      alignItems: "center",
      borderTopWidth: 1,
      borderColor: theme.colors.background.secondary,
      backgroundColor: theme.colors.background.primary,
      marginBottom: Platform.OS === "ios" ? theme.spacing.m : 0,
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
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Reanimated.View entering={FadeIn} style={styles.header}>
          <Image
            source={require("../../assets/ai-icon.png")}
            style={styles.avatar}
          />
          <Text style={styles.username}>{t("aiAssistant")}</Text>
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
          refreshing={loading}
          onRefresh={load}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{
            paddingVertical: theme.spacing.m,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <Reanimated.View entering={FadeIn} style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {t("aiAssistant")} yazıyor...
                </Text>
              </Reanimated.View>
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <Reanimated.Text entering={FadeIn} style={styles.emptyText}>
                {t("noMessages")} 💬
              </Reanimated.Text>
            )
          }
        />

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
            disabled={isTyping}
          >
            <Text style={styles.sendText}>➤</Text>
          </AnimatedTouchable>
        </Reanimated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AiChatScreen;
