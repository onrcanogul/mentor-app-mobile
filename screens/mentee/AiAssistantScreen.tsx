import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  View,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import aiAssistantService from "../../services/ai-assistant-service";
import toastrService from "../../services/toastr-service";
import { AIChat } from "../../domain/aichat";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import userService from "../../services/user-service";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  AIChat: { chatId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AIChat">;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AIAssistantScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const navigator = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [chats, setChats] = useState<AIChat[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const startChat = async () => {
    if (title.trim() === "") return;

    setIsCreating(true);
    const chat = await aiAssistantService.startChat({
      userId: (await userService.getCurrentUser()).id,
      title,
      createdBy: "SYSTEM",
    });

    if (chat) {
      buttonScale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );

      toastrService.success(t("aiChatRedirect"));
      setChats((prev) => [chat, ...prev]);
      setTitle("");

      setTimeout(() => {
        navigator.navigate("AIChat", { chatId: chat.id });
        setIsCreating(false);
      }, 1000);
    } else {
      toastrService.error(t("chatStartError"));
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const chats = await aiAssistantService.getPrevious(
      (
        await userService.getCurrentUser()
      ).id
    );
    if (chats) setChats(chats);
  };

  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["top"]}
    >
      <Animated.Text
        entering={FadeInDown.duration(600).springify()}
        style={[styles.title, { color: theme.colors.primary.main }]}
      >
        {t("aiAssistant")} 🤖
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.duration(600).delay(200).springify()}
        style={[styles.description, { color: theme.colors.text.secondary }]}
      >
        {t("welcomeAIMessage")}
      </Animated.Text>

      <AnimatedTextInput
        entering={FadeInDown.duration(600).delay(400).springify()}
        placeholder={t("chatTitle")}
        placeholderTextColor={theme.colors.text.disabled}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
          },
        ]}
        value={title}
        onChangeText={setTitle}
      />

      <AnimatedTouchable
        entering={FadeInDown.duration(600).delay(600).springify()}
        style={[
          styles.newChatButton,
          { backgroundColor: theme.colors.primary.main },
          isCreating && { opacity: 0.6 },
          animatedButtonStyle,
        ]}
        onPress={startChat}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isCreating}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          {isCreating ? (
            <ActivityIndicator color={theme.colors.text.primary} />
          ) : (
            <Animated.Text
              style={[styles.newChatText, { color: theme.colors.text.primary }]}
            >
              {t("startNewChat")}
            </Animated.Text>
          )}
        </View>
      </AnimatedTouchable>

      <Animated.Text
        entering={FadeInDown.duration(600).delay(800).springify()}
        style={[styles.subTitle, { color: theme.colors.text.secondary }]}
      >
        📚 {t("previousChats")}
      </Animated.Text>

      <Animated.FlatList
        entering={FadeIn.duration(600).delay(1000)}
        style={styles.list}
        data={chats}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={Layout.springify()}
        renderItem={({ item, index }) => (
          <AnimatedTouchable
            entering={SlideInRight.delay(index * 100)}
            style={[
              styles.chatItem,
              {
                backgroundColor: theme.colors.background.secondary,
              },
            ]}
            onPress={() => navigation.navigate("AIChat", { chatId: item.id })}
          >
            <Animated.Text
              style={[
                styles.chatQuestion,
                { color: theme.colors.text.primary },
              ]}
            >
              {item.title}
            </Animated.Text>
          </AnimatedTouchable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    marginBottom: 20,
    fontSize: 14,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  chatItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chatQuestion: {
    fontSize: 15,
    fontWeight: "500",
  },
  newChatButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  newChatText: {
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
});

export default AIAssistantScreen;
