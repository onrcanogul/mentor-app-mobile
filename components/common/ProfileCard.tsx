import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView, BlurTint } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ProfileCardProps {
  username: string;
  email: string;
  imageUrl?: string;
  role: string;
  isOwn: boolean;
  onImagePress?: () => void;
  onLogoutPress?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  username,
  email,
  imageUrl,
  role,
  isOwn,
  onImagePress,
  onLogoutPress,
}) => {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const CardBackground = Platform.OS === "ios" ? BlurView : View;
  const cardProps =
    Platform.OS === "ios"
      ? {
          intensity: 40,
          tint: "dark" as BlurTint,
        }
      : {
          style: {
            backgroundColor: theme.colors.background.secondary,
          },
        };

  return (
    <AnimatedView
      entering={FadeIn}
      style={[styles.container, { backgroundColor: "transparent" }]}
    >
      <AnimatedLinearGradient
        entering={FadeInDown}
        colors={[
          theme.colors.primary.main,
          `${theme.colors.primary.main}80`,
          `${theme.colors.primary.main}40`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      <CardBackground {...cardProps} style={styles.card}>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={isOwn ? onImagePress : undefined}
            style={styles.imageContainer}
          >
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require("../../assets/ai-icon.png")
              }
              style={[
                styles.profileImage,
                { borderColor: theme.colors.primary.main },
              ]}
            />
            {isOwn && (
              <View
                style={[
                  styles.editBadge,
                  { backgroundColor: theme.colors.background.secondary },
                ]}
              >
                <IconButton
                  icon="camera"
                  size={16}
                  iconColor={theme.colors.primary.main}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text
              variant="headlineMedium"
              style={[styles.username, { color: theme.colors.text.primary }]}
            >
              {username}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.email, { color: theme.colors.text.secondary }]}
            >
              {email}
            </Text>
            <View
              style={[
                styles.roleContainer,
                { backgroundColor: `${theme.colors.primary.main}15` },
              ]}
            >
              <Text
                variant="labelLarge"
                style={[styles.role, { color: theme.colors.primary.main }]}
              >
                {role}
              </Text>
            </View>
          </View>

          {isOwn && (
            <View style={styles.actions}>
              <IconButton
                icon="translate"
                size={24}
                iconColor={theme.colors.text.secondary}
                onPress={() => {
                  navigation.navigate("Settings");
                }}
              />
              <IconButton
                icon="logout"
                size={24}
                iconColor={theme.colors.error.main}
                onPress={onLogoutPress}
              />
            </View>
          )}
        </View>
      </CardBackground>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    opacity: 0.8,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    padding: 24,
  },
  imageContainer: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  editBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoContainer: {
    alignItems: "center",
  },
  username: {
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    marginBottom: 16,
  },
  roleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  role: {
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
});

export default ProfileCard;
