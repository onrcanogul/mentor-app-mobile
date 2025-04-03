import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Notification } from "../../domain/notification";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import notificationService from "../../services/notification-service";
import { formatDate } from "../../utils/dateFormatter";
import LoadingSpinner from "../../utils/spinner";
import userService from "../../services/user-service";

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [])
  );

  async function fetch() {
    const user = await userService.getCurrentUser();
    var notifications = await notificationService.get(
      user.id,
      () => {},
      () => {}
    );
    setNotifications(
      notifications.sort((a, b) => Number(a.isRead) - Number(b.isRead))
    );
  }

  const markAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      var result = await notificationService.read(notification.id);
      if (result) {
        setNotifications((prev) =>
          prev
            .map((notif) =>
              notif === notification ? { ...notif, isRead: true } : notif
            )
            .sort((a, b) => Number(a.isRead) - Number(b.isRead))
        );
      }
    }
    if (notification.type === "match") {
      navigator.navigate("MentorMatch");
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity onPress={() => markAsRead(item)}>
      <Card style={[styles.card, item.isRead ? styles.read : styles.unread]}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>
            {item.type === "match"
              ? `🤝 ${t("matchNotificationTitle")}`
              : item.type === "message"
              ? `💬 ${t("messageNotificationTitle")}`
              : "🔔 Sistem Güncellemesi"}
          </Text>
          <Text style={styles.message}>{t(item.content)}</Text>
          <Text style={styles.time}>{formatDate(item.createdDate)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>📢 {t("notifications")}</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item: Notification) => item.id!}
          renderItem={renderNotification}
          refreshing={isLoading} // 👈 refresh indicator
          onRefresh={fetch} // 👈 aşağı çekilince fetch çalışır
          ListEmptyComponent={
            !isLoading && (
              <Text
                style={{ color: "#888", textAlign: "center", marginTop: 20 }}
              >
                {t("noNotifications")}
              </Text>
            )
          }
        />
      </SafeAreaView>
      {/* <LoadingSpinner visible={isLoading} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  unread: {
    backgroundColor: "#252525", // 🔥 Okunmamış bildirimler daha parlak
  },
  read: {
    backgroundColor: "#1E1E1E", // 🔥 Okunmuş bildirimler daha soluk
    opacity: 0.6, // 🔥 Daha şeffaf gösterilsin
  },
  cardContent: {
    flexDirection: "column",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700", // 🔥 Daha belirgin başlık rengi
  },
  message: {
    fontSize: 14,
    color: "#A0A0A0",
    marginVertical: 5,
  },
  time: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});

export default NotificationsScreen;
