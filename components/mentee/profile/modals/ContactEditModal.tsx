import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  BackHandler,
  Platform,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { Contact } from "../../../../domain/contact";
import * as SystemUI from "expo-system-ui";

interface ContactEditModalProps {
  visible: boolean;
  onClose: () => void;
  contact: Contact;
  onSave: (updated: Contact) => void;
}

const ContactEditModal: React.FC<ContactEditModalProps> = ({
  visible,
  onClose,
  contact,
  onSave,
}) => {
  const [email, setEmail] = useState<string>(contact.email);

  const handleSave = () => {
    onSave({ email });
    onClose();
  };

  // ✅ Android geri tuşu kapatma
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

  // ✅ Navigation bar rengi Modal açıkken sabitlenir
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
      onRequestClose={onClose} // Android geri tuşu desteği
      statusBarTranslucent={true} // üst barla tam uyum
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>İletişim Bilgilerini Düzenle</Text>

          <TextInput
            placeholder="E-posta"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />

          <View style={styles.actions}>
            <Button onPress={onClose} style={{ backgroundColor: "#FFD700" }}>
              İptal
            </Button>
            <Button style={{ backgroundColor: "#FFD700" }} onPress={handleSave}>
              Kaydet
            </Button>
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
    backgroundColor: "#1E1E1E",
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFD700",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#2C2C2C",
    color: "#FFFFFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default ContactEditModal;
