import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Reanimated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendMedia: (type: "image" | "video" | "audio", uri: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendMedia,
  isRecording,
  onStartRecording,
  onStopRecording,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const mediaMenuOpacity = useSharedValue(0);
  const recordingWidth = useSharedValue(0);
  const recordingOpacity = useSharedValue(0);
  const recordingPulse = useSharedValue(1);

  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.s,
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background.secondary,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.s,
      marginRight: theme.spacing.s,
    },
    input: {
      flex: 1,
      color: theme.colors.text.primary,
      fontSize: 16,
      paddingVertical: theme.spacing.s,
      maxHeight: 100,
    },
    mediaButton: {
      padding: theme.spacing.s,
    },
    sendButton: {
      padding: theme.spacing.s,
      backgroundColor: theme.colors.primary.main,
      borderRadius: theme.borderRadius.large,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    mediaMenu: {
      position: "absolute",
      bottom: "100%",
      left: theme.spacing.s,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.s,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    mediaMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.s,
    },
    mediaMenuText: {
      marginLeft: theme.spacing.s,
      color: theme.colors.text.primary,
      fontSize: 16,
    },
    recordingIndicator: {
      position: "absolute",
      bottom: "100%",
      left: theme.spacing.s,
      backgroundColor: theme.colors.error.main,
      padding: theme.spacing.s,
      borderRadius: theme.borderRadius.medium,
      flexDirection: "row",
      alignItems: "center",
    },
    recordingText: {
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.s,
    },
  });

  const mediaMenuStyle = useAnimatedStyle(() => {
    return {
      opacity: mediaMenuOpacity.value,
      transform: [
        {
          scale: withSpring(mediaMenuOpacity.value),
        },
      ],
    };
  });

  const recordingStyle = useAnimatedStyle(() => {
    return {
      width: recordingWidth.value,
      opacity: recordingOpacity.value,
      transform: [
        {
          scale: recordingPulse.value,
        },
      ],
    };
  });

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleMediaPress = () => {
    setShowMediaMenu(!showMediaMenu);
    mediaMenuOpacity.value = withSpring(showMediaMenu ? 0 : 1);
  };

  const handleMediaSelect = (type: "image" | "video" | "audio") => {
    // TODO: Implement media selection
    setShowMediaMenu(false);
    mediaMenuOpacity.value = withSpring(0);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t("typeMessage")}
          placeholderTextColor={theme.colors.text.secondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={styles.mediaButton} onPress={handleMediaPress}>
          <Icon name="attachment" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Icon name="send" size={20} color={theme.colors.text.primary} />
      </TouchableOpacity>

      {showMediaMenu && (
        <Reanimated.View style={[styles.mediaMenu, mediaMenuStyle]}>
          <TouchableOpacity
            style={styles.mediaMenuItem}
            onPress={() => handleMediaSelect("image")}
          >
            <Icon name="image" size={24} color={theme.colors.text.primary} />
            <Text style={styles.mediaMenuText}>{t("image")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaMenuItem}
            onPress={() => handleMediaSelect("video")}
          >
            <Icon name="video" size={24} color={theme.colors.text.primary} />
            <Text style={styles.mediaMenuText}>{t("video")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaMenuItem}
            onPress={() => handleMediaSelect("audio")}
          >
            <Icon
              name="microphone"
              size={24}
              color={theme.colors.text.primary}
            />
            <Text style={styles.mediaMenuText}>{t("audio")}</Text>
          </TouchableOpacity>
        </Reanimated.View>
      )}

      {isRecording && (
        <Reanimated.View style={[styles.recordingIndicator, recordingStyle]}>
          <Icon name="microphone" size={24} color={theme.colors.text.primary} />
          <Text style={styles.recordingText}>{t("recording")}</Text>
        </Reanimated.View>
      )}
    </View>
  );
};

export default React.memo(ChatInput);
