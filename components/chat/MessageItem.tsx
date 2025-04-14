import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import Reanimated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { Message, MessageType } from "../../domain/message";
import { formatMessageTime } from "../../utils/dateFormatter";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface MessageItemProps {
  item: Message;
  isMe: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ item, isMe }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
    mediaContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    mediaText: {
      marginLeft: 8,
      fontSize: 16,
    },
    imageContainer: {
      borderRadius: 8,
      overflow: "hidden",
    },
    messageImage: {
      width: 200,
      height: 200,
      borderRadius: 8,
    },
  });

  const renderMessageContent = () => {
    switch (item.messageType) {
      case MessageType.Audio:
        return (
          <View style={styles.mediaContainer}>
            <Icon
              name="microphone"
              size={24}
              color={theme.colors.text.primary}
            />
            <Text
              style={[styles.mediaText, { color: theme.colors.text.primary }]}
            >
              {t("audioMessage")} ({Math.floor(item.duration || 0)}s)
            </Text>
          </View>
        );
      case MessageType.Video:
        return (
          <View style={styles.mediaContainer}>
            <Icon name="video" size={24} color={theme.colors.text.primary} />
            <Text
              style={[styles.mediaText, { color: theme.colors.text.primary }]}
            >
              {t("videoMessage")} ({Math.floor(item.duration || 0)}s)
            </Text>
          </View>
        );
      case MessageType.Image:
        return (
          <View style={styles.imageContainer}>
            {item.mediaUrl && (
              <Image
                source={{ uri: item.mediaUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}
          </View>
        );
      default:
        return (
          <Text
            style={[
              styles.messageText,
              {
                color: theme.colors.text.primary,
              },
            ]}
          >
            {item.content}
          </Text>
        );
    }
  };

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
        {renderMessageContent()}
        <Text style={styles.messageTime}>
          {formatMessageTime(item.createdDate)}
        </Text>
      </View>
    </Reanimated.View>
  );
};

export default React.memo(MessageItem);
