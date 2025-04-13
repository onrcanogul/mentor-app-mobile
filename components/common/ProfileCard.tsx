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
import { defaultTheme } from "../../theme/defaultTheme";

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary.main, theme.colors.primary.dark]}
        style={styles.headerGradient}
      />
      <View style={styles.card}>
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
              style={styles.profileImage}
            />
            {isOwn && (
              <View style={styles.editBadge}>
                <IconButton
                  icon="camera"
                  size={16}
                  iconColor={theme.colors.text.primary}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text
              style={[styles.username, { color: theme.colors.text.primary }]}
            >
              {username}
            </Text>
            <Text
              style={[styles.email, { color: theme.colors.text.secondary }]}
            >
              {email}
            </Text>
            <View style={styles.roleContainer}>
              <Text style={[styles.role, { color: theme.colors.primary.main }]}>
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
                iconColor={theme.colors.text.secondary}
                onPress={onLogoutPress}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
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
        overflow: "hidden",
      },
    }),
  },
  content: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  imageContainer: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  role: {
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
});

export default ProfileCard;
