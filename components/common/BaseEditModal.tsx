import React, { useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Platform,
  BackHandler,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import * as SystemUI from "expo-system-ui";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";

interface BaseEditModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveText?: string;
  cancelText?: string;
  loading?: boolean;
}

const BaseEditModal: React.FC<BaseEditModalProps> = ({
  visible,
  onClose,
  title,
  children,
  onSave,
  saveDisabled = false,
  saveText = "Save",
  cancelText = "Cancel",
  loading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [visible]);

  useEffect(() => {
    if (visible && Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#121212");
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.card.background },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: theme.colors.text.primary }]}
          >
            {title}
          </Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          <View style={styles.actions}>
            <Button
              onPress={onClose}
              mode="outlined"
              style={styles.button}
              textColor={theme.colors.text.primary}
            >
              {t(cancelText)}
            </Button>
            {onSave && (
              <Button
                onPress={onSave}
                mode="contained"
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.primary.main },
                ]}
                loading={loading}
                disabled={saveDisabled || loading}
              >
                {t(saveText)}
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  content: {
    maxHeight: 400,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
});

export default BaseEditModal;
