// components/common/ConfirmationModal.tsx

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  StatusBar,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { BlurView, BlurTint } from "expo-blur";
import { IconButton } from "react-native-paper";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  message,
  confirmText = "Evet",
  cancelText = "İptal",
}) => {
  const { theme } = useTheme();
  const ModalBackground = Platform.OS === "ios" ? BlurView : View;
  const modalProps =
    Platform.OS === "ios"
      ? { intensity: 80, tint: "dark" as BlurTint }
      : { style: { backgroundColor: "rgba(0, 0, 0, 0.85)" } };

  return (
    <>
      {Platform.OS === "android" && visible && (
        <StatusBar
          backgroundColor="rgba(0, 0, 0, 0.85)"
          barStyle="light-content"
        />
      )}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View
          style={[styles.container, { backgroundColor: "rgba(0, 0, 0, 0.85)" }]}
        >
          <Pressable onPress={onClose} style={styles.overlay}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.card.background },
              ]}
            >
              <View style={styles.modal}>
                <View style={styles.header}>
                  <IconButton
                    icon="alert-circle"
                    size={32}
                    iconColor={theme.colors.primary.main}
                  />
                </View>

                <Text
                  style={[styles.message, { color: theme.colors.text.primary }]}
                >
                  {message}
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[
                      styles.button,
                      styles.cancelButton,
                      { borderColor: theme.colors.input.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {cancelText}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onConfirm}
                    style={[
                      styles.button,
                      styles.confirmButton,
                      { backgroundColor: theme.colors.error.main },
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        styles.confirmText,
                        { color: theme.colors.error.contrastText },
                      ]}
                    >
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 320,
    maxWidth: "90%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modal: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmText: {
    color: "#FFFFFF",
  },
});

export default ConfirmationModal;
