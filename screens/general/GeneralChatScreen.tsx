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
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Chat } from "../../domain/chat";
import { Message, MessageType } from "../../domain/message";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";
import {
  formatDate,
  formatMessageTime,
  formatDayForChat,
} from "../../utils/dateFormatter";
import Reanimated, {
  FadeIn,
  FadeInRight,
  FadeInLeft,
  SlideInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

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

type RouteParams = {
  chatId: string;
};

const GeneralChatScreen = () => {
  const route = useRoute();
  const { chatId } = route.params as RouteParams;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const sendButtonScale = useSharedValue(1);
  const inputScale = useSharedValue(1);
  const inputWidth = useSharedValue("100%" as any);
  const recordingWidth = useSharedValue("0%" as any);
  const recordingOpacity = useSharedValue(0);
  const recordingPulse = useSharedValue(1);

  const [chat, setChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout>();
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<MessageGroup>>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);

  useEffect(() => {
    getCurrentUser();
    requestPermissions();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchChat();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isLongPressing) {
      inputWidth.value = withTiming("0%", { duration: 300 });
      recordingWidth.value = withTiming("100%", { duration: 300 });
      recordingOpacity.value = withTiming(1, { duration: 300 });
      recordingPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      );
    } else {
      inputWidth.value = withTiming("100%", { duration: 300 });
      recordingWidth.value = withTiming("0%", { duration: 300 });
      recordingOpacity.value = withTiming(0, { duration: 300 });
      recordingPulse.value = 1;
    }
  }, [isLongPressing]);

  const inputStyle = useAnimatedStyle(() => ({
    width: inputWidth.value,
    opacity: recordingOpacity.value === 1 ? 0 : 1,
  }));

  const recordingStyle = useAnimatedStyle(() => ({
    width: recordingWidth.value,
    opacity: recordingOpacity.value,
  }));

  const recordingIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: recordingPulse.value }],
      opacity: recordingPulse.value,
    };
  });

  const handlePressIn = () => {
    longPressTimeout.current = setTimeout(() => {
      setIsLongPressing(true);
      startRecording();
    }, 500);
  };

  const handlePressOut = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    if (isLongPressing) {
      setIsLongPressing(false);
      stopRecording();
    } else {
      inputWidth.value = withTiming("100%", { duration: 300 });
      recordingWidth.value = withTiming("0%", { duration: 300 });
      recordingOpacity.value = withTiming(0, { duration: 300 });
      recordingPulse.value = 1;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();

    if (cameraStatus !== "granted" || audioStatus !== "granted") {
      Alert.alert(
        t("permissionRequired"),
        t("cameraAndAudioPermissionRequired"),
        [{ text: t("ok") }]
      );
    }
  };

  async function getCurrentUser() {
    const user = await userService.getCurrentUser();
    setCurrentUserId(user.id);
  }

  async function fetchChat() {
    if (!currentUserId) return;
    const chatResult = await chatService.getById(
      chatId,
      () => {},
      () => {}
    );
    if (chatResult) {
      setChat(chatResult);
      navigation.setOptions({
        title: chatResult.match
          ? chatResult.match.sender.username
          : t("conversation"),
      });
    }
  }

  const startRecording = async () => {
    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsLoading(false);
      Alert.alert(t("error"), t("failedToStartRecording"));
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsLoading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      if (uri) {
        // Here you would typically upload the audio file to your server
        // For now, we'll just create a mock message
        const audioMessage: Message = {
          id: Date.now().toString(),
          chatId: chatId,
          senderId: currentUserId!,
          content: t("audioMessage"),
          mediaUrl: uri,
          duration: recordingTime,
          messageType: MessageType.Audio,
          isRead: false,
          createdDate: new Date(),
        };

        const updatedChat = {
          ...chat!,
          messages: [...(chat?.messages || []), audioMessage],
        };

        setChat(updatedChat);

        try {
          await chatService.create(
            { id: chatId, messages: [audioMessage] },
            () => {},
            () => {}
          );
        } catch (error) {
          console.error("Error sending audio message:", error);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to stop recording", err);
      setIsLoading(false);
      Alert.alert(t("error"), t("failedToStopRecording"));
    }
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // Here you would typically upload the image to your server
        // For now, we'll just create a mock message
        const imageMessage: Message = {
          id: Date.now().toString(),
          chatId: chatId,
          senderId: currentUserId!,
          content: t("imageMessage"),
          mediaUrl: imageUri,
          messageType: MessageType.Image,
          isRead: false,
          createdDate: new Date(),
        };

        const updatedChat = {
          ...chat!,
          messages: [...(chat?.messages || []), imageMessage],
        };

        setChat(updatedChat);

        try {
          await chatService.create(
            { id: chatId, messages: [imageMessage] },
            () => {},
            () => {}
          );
        } catch (error) {
          console.error("Error sending image message:", error);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to pick image", err);
      setIsLoading(false);
      Alert.alert(t("error"), t("failedToPickImage"));
    }
  };

  const startVideoRecording = async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(t("permissionRequired"), t("cameraPermissionRequired"));
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoUri = result.assets[0].uri;
        setVideoUri(videoUri);

        // Get video duration
        const { sound } = await Audio.Sound.createAsync({ uri: videoUri });
        const status = await sound.getStatusAsync();
        const duration = status.isLoaded ? status.durationMillis / 1000 : 0;
        await sound.unloadAsync();

        // Here you would typically upload the video to your server
        // For now, we'll just create a mock message
        const videoMessage: Message = {
          id: Date.now().toString(),
          chatId: chatId,
          senderId: currentUserId!,
          content: t("videoMessage"),
          mediaUrl: videoUri,
          duration: duration,
          messageType: MessageType.Video,
          isRead: false,
          createdDate: new Date(),
        };

        const updatedChat = {
          ...chat!,
          messages: [...(chat?.messages || []), videoMessage],
        };

        setChat(updatedChat);

        try {
          await chatService.create(
            { id: chatId, messages: [videoMessage] },
            () => {},
            () => {}
          );
        } catch (error) {
          console.error("Error sending video message:", error);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to record video", err);
      setIsLoading(false);
      Alert.alert(t("error"), t("failedToRecordVideo"));
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUserId || !chat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: chat.id,
      content: inputText.trim(),
      senderId: currentUserId,
      messageType: MessageType.Text,
      isRead: false,
      createdDate: new Date(),
    };

    const updatedChat = {
      ...chat,
      messages: [...(chat.messages || []), newMessage],
    };

    setChat(updatedChat);
    setInputText("");

    try {
      await chatService.create(
        { id: chat.id, messages: [newMessage] },
        () => {},
        () => {}
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const groupedMessages = useMemo(() => {
    const messages = chat?.messages || [];
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
  }, [chat?.messages]);

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === currentUserId;
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
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background.secondary,
      backgroundColor: theme.colors.background.primary,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.s,
      backgroundColor: theme.colors.primary.light,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: theme.colors.text.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    username: {
      color: theme.colors.text.primary,
      fontSize: 18,
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.background.secondary,
      paddingHorizontal: 8,
      paddingVertical: 8,
      paddingBottom: Platform.OS === "ios" ? 24 : 8,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 25,
      paddingHorizontal: 8,
      minHeight: 40,
    },
    input: {
      flex: 1,
      color: theme.colors.text.primary,
      fontSize: 16,
      paddingVertical: Platform.OS === "ios" ? 8 : 6,
      paddingHorizontal: 4,
      maxHeight: 100,
    },
    mediaMenuButton: {
      width: 35,
      height: 35,
      justifyContent: "center",
      alignItems: "center",
    },
    sendButton: {
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary.main,
      marginLeft: 8,
    },
    sendIcon: {
      color: theme.colors.text.primary,
    },
    recordingContainer: {
      flexDirection: "row",
      alignItems: "center",
      position: "absolute",
      left: 40,
      right: 0,
      height: "100%",
    },
    recordingText: {
      color: theme.colors.text.primary,
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    attachmentMenu: {
      position: "absolute",
      bottom: "100%",
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background.primary,
      padding: 8,
      marginBottom: 5,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    },
    attachmentMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
    },
    attachmentMenuText: {
      color: theme.colors.text.primary,
      marginLeft: 12,
      fontSize: 16,
      fontWeight: "500",
    },
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <Reanimated.View entering={FadeIn} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(chat?.match?.sender?.username || "Kullanıcı")}
              </Text>
            </View>
            <Text style={styles.username}>
              {chat?.match?.sender?.username ?? "Kullanıcı"}
            </Text>
          </View>
        </Reanimated.View>

        <View style={{ flex: 1 }}>
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
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            contentContainerStyle={{
              paddingTop: theme.spacing.m,
              paddingBottom: theme.spacing.m,
            }}
            style={{
              flex: 1,
              backgroundColor: theme.colors.background.primary,
            }}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            inverted={false}
          />
        </View>

        <Reanimated.View entering={SlideInDown} style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.mediaMenuButton}
              onPress={() => setShowMediaMenu(!showMediaMenu)}
            >
              <Icon
                name="plus-circle"
                size={24}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>

            <Reanimated.View style={inputStyle}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                style={styles.input}
                placeholder={t("typeMessage")}
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={1}
                maxLength={1000}
              />
            </Reanimated.View>

            <Reanimated.View style={recordingStyle}>
              <View style={styles.recordingContainer}>
                <Text
                  style={[
                    styles.recordingText,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {t("recording")} {recordingTime}s
                </Text>
              </View>
            </Reanimated.View>
          </View>

          <AnimatedTouchable
            style={[styles.sendButton]}
            onPress={inputText.trim() ? sendMessage : startRecording}
            onPressIn={!inputText.trim() ? handlePressIn : undefined}
            onPressOut={!inputText.trim() ? handlePressOut : undefined}
          >
            <Icon
              name={inputText.trim() ? "send" : "microphone"}
              size={22}
              style={styles.sendIcon}
            />
          </AnimatedTouchable>

          {showMediaMenu && (
            <View style={styles.attachmentMenu}>
              <TouchableOpacity
                style={styles.attachmentMenuItem}
                onPress={() => {
                  pickImage();
                  setShowMediaMenu(false);
                }}
              >
                <Icon
                  name="image"
                  size={24}
                  color={theme.colors.text.primary}
                />
                <Text style={styles.attachmentMenuText}>{t("chat.image")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentMenuItem}
                onPress={() => {
                  startVideoRecording();
                  setShowMediaMenu(false);
                }}
              >
                <Icon
                  name="video"
                  size={24}
                  color={theme.colors.text.primary}
                />
                <Text style={styles.attachmentMenuText}>{t("chat.video")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Reanimated.View>
      </KeyboardAvoidingView>

      <Modal transparent={true} visible={isLoading} animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GeneralChatScreen;
