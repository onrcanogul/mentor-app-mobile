import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context"; // Safe Area eklendi
import { Chat } from "../../domain/chat";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../utils/spinner";
import { formatDate } from "../../utils/dateFormatter";
import chatService from "../../services/chat-service";
import userService from "../../services/user-service";
import { useTheme } from "../../contexts/ThemeContext";
import Reanimated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type RootStackParamList = {
  MentorChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MentorChat"
>;

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const ChatListItem = React.memo(
  ({
    item,
    index,
    onPress,
  }: {
    item: Chat;
    index: number;
    onPress: () => void;
  }) => {
    const scale = useSharedValue(1);
    const { theme } = useTheme();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
      chatContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.s,
        borderRadius: theme.borderRadius.medium,
      },
      name: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.text.primary,
      },
      lastMessage: {
        fontSize: 14,
        color: theme.colors.text.secondary,
      },
      time: {
        fontSize: 12,
        color: theme.colors.primary.main,
        marginLeft: "auto",
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const onPressIn = () => {
      scale.value = withSpring(0.95);
    };

    const onPressOut = () => {
      scale.value = withSpring(1);
    };

    if (!item.match) return null;

    const otherUser = item.match.sender;

    return (
      <AnimatedTouchable
        entering={FadeInDown.delay(index * 100).springify()}
        exiting={FadeOut}
        style={[animatedStyle]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <Reanimated.View style={styles.chatContainer}>
          <View>
            <Text style={styles.name}>{otherUser.username}</Text>
            <Text style={styles.lastMessage}>
              {item.messages?.[item.messages.length - 1]?.content ??
                t("noMessages")}
            </Text>
          </View>
          <Text style={styles.time}>{formatDate(item.createdDate)}</Text>
        </Reanimated.View>
      </AnimatedTouchable>
    );
  }
);

const MentorChatListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const [chatsFromDb, setChatsFromDb] = useState<Chat[]>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const refreshAnim = useSharedValue(0);

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.m,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.m,
    },
  });

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

  const renderChat = useCallback(
    ({ item, index }: { item: Chat; index: number }) => {
      return (
        <ChatListItem
          item={item}
          index={index}
          onPress={() => navigation.navigate("MentorChat", { chatId: item.id })}
        />
      );
    },
    [navigation]
  );

  const onRefresh = async () => {
    setLoading(true);
    refreshAnim.value = withTiming(1, { duration: 1000 });
    await fetch();
    refreshAnim.value = withTiming(0);
    setLoading(false);
  };

  const refreshStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${refreshAnim.value * 360}deg` }],
    };
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Reanimated.Text style={[styles.header, refreshStyle]}>
          💬 {t("myConversations")}
        </Reanimated.Text>
        <FlatList
          data={chatsFromDb}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          refreshing={isLoading}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default MentorChatListScreen;
