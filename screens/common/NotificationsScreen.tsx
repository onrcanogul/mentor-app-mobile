import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Notification } from "../../domain/notification";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import notificationService from "../../services/notification-service";
import { formatDate } from "../../utils/dateFormatter";
import LoadingSpinner from "../../utils/spinner";
import userService from "../../services/user-service";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, {
  FadeInDown,
  FadeOut,
  Layout,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const navigator = useNavigation();
  const { theme } = useTheme();
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
      navigator.navigate("MentorMatch" as never);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match":
        return "🤝";
      case "message":
        return "💬";
      default:
        return "🔔";
    }
  };

  const getNotificationGradient = (
    type: string,
    isRead: boolean
  ): [string, string] => {
    if (isRead) {
      return [
        theme.colors.background.secondary,
        theme.colors.background.secondary,
      ];
    }

    switch (type) {
      case "match":
        return [
          theme.colors.background.tertiary,
          `${theme.colors.primary.main}15`,
        ];
      case "message":
        return [
          theme.colors.background.tertiary,
          `${theme.colors.primary.light}15`,
        ];
      default:
        return [
          theme.colors.background.tertiary,
          theme.colors.background.tertiary,
        ];
    }
  };

  const renderNotification = ({ item, index }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      exiting={SlideOutLeft}
      layout={Layout.springify()}
      style={styles.animatedContainer}
    >
      <TouchableOpacity
        onPress={() => markAsRead(item)}
        style={styles.cardWrapper}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={getNotificationGradient(item.type, item.isRead)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.card,
            {
              opacity: item.isRead ? 0.7 : 1,
              borderColor: item.isRead
                ? theme.colors.card.border
                : `${theme.colors.primary.main}30`,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.title,
                {
                  color: item.isRead
                    ? theme.colors.text.secondary
                    : theme.colors.primary.main,
                },
              ]}
            >
              {t(
                item.type === "match"
                  ? "matchNotificationTitle"
                  : item.type === "message"
                  ? "messageNotificationTitle"
                  : "systemUpdate"
              )}
            </Text>
            <Text
              style={[
                styles.message,
                {
                  color: item.isRead
                    ? theme.colors.text.disabled
                    : theme.colors.text.secondary,
                },
              ]}
            >
              {t(item.content)}
            </Text>
            <Text style={[styles.time, { color: theme.colors.text.disabled }]}>
              {formatDate(item.createdDate)}
            </Text>
          </View>
          {!item.isRead && (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.colors.primary.main },
              ]}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <Text style={[styles.header, { color: theme.colors.text.primary }]}>
        📢 {t("notifications")}
      </Text>
      <FlatList
        data={notifications}
        keyExtractor={(item: Notification) => item.id!}
        renderItem={renderNotification}
        refreshing={isLoading}
        onRefresh={fetch}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !isLoading && (
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.emptyContainer}
            >
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.text.disabled },
                ]}
              >
                {t("noNotifications")}
              </Text>
            </Animated.View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  animatedContainer: {
    width: "100%",
    paddingHorizontal: 4,
  },
  cardWrapper: {
    marginBottom: 12,
    width: "100%",
  },
  card: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default NotificationsScreen;
