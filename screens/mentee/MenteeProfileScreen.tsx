import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Card, Text, Avatar, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import GoalList from "../../components/mentee/profile/GoalList";
import ContactInfo from "../../components/mentee/profile/ContactInfo";
import CategorySelection from "../../components/mentee/profile/CategorySelection";
import MeetingStats from "../../components/mentee/profile/MeetingStats";
import ContactEditModal from "../../components/mentee/profile/modals/ContactEditModal";
import CategoryEditModal from "../../components/mentee/profile/modals/CategoryEditModal";
import GoalsEditModal from "../../components/mentee/profile/modals/GoalEditModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import CategoryList from "../../components/mentor/profile/CategoryList";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/user-service";
import menteeService from "../../services/mentee-service";
import toastrService from "../../services/toastr-service";
import { Mentee } from "../../domain/mentee";
import { Contact } from "../../domain/contact";
import api from "../../services/axios/axiosInstance";
import LoadingSpinner from "../../utils/spinner";

const MenteeProfileScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigator = useNavigation();
  const { setRole, setAuthenticated } = useAuth();

  const [userId, setUserId] = useState<string | null>(null);
  const [mentee, setMentee] = useState<Mentee>();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goals, setGoals] = useState(mentee?.goals);
  const [isOwn, setIsOwn] = useState<boolean>(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contact, setContact] = useState<Contact>({
    email: mentee?.user.email!,
  });
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categories, setCategories] = useState(mentee?.categories);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch();
  }, []);

  async function fetch() {
    setLoading(true);
    const user = await userService.getCurrentUser();
    const param = (route.params as any)?.menteeId;
    const userId = param || user?.id;
    setUserId(userId);
    setIsOwn(userId == user.id);

    const mentee = await menteeService.get(userId);
    if (mentee) {
      setMentee(mentee);
      setGoals(mentee.goals);
      setCategories(mentee.categories);
      setContact({ email: mentee.user.email });
      console.log(mentee.user.imageUrl);
      console.log(mentee);
      console.log(goals);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await userService.logout();
    toastrService.success(t("logoutSuccess"));
    setRole(null);
    setAuthenticated(false);
    setTimeout(() => {
      navigator.navigate("Home");
    }, 1000);
  };

  const handleImageUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Galeriye erişim izni gerekli.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: result.assets[0].mimeType,
      };

      await userService.uploadProfilePhoto(file, mentee.userId);
    }
  };

  if (!mentee || !mentee.categories || !mentee.goals) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LoadingSpinner visible={!mentee} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetch}
              tintColor="#FFD700"
            />
          }
        >
          {/* Profil Başlığı */}
          <Card style={styles.profileCard}>
            <View style={styles.header}>
              <TouchableOpacity onPress={isOwn ? handleImageUpload : undefined}>
                {mentee.user.imageUrl ? (
                  <Image
                    source={{ uri: mentee.user.imageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Image
                    source={{
                      uri: `https://ui-avatars.com/api/?name=OnurcanOgul`,
                    }}
                    style={styles.avatarImage}
                  />
                )}
              </TouchableOpacity>

              <View style={styles.nameSection}>
                <Text style={styles.nameText}>{mentee.user.username}</Text>
                <Text style={styles.roleText}>Mentee</Text>
                <Text style={styles.roleText}>{contact.email}</Text>
              </View>

              {isOwn && (
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="cog"
                    iconColor="#FFD700"
                    size={22}
                    onPress={() => navigator.navigate("Settings")}
                  />
                  <IconButton
                    icon="logout"
                    iconColor="#FF6B6B"
                    size={22}
                    onPress={() => setLogoutDialogVisible(true)}
                  />
                </View>
              )}
            </View>
          </Card>

          {/* Kategoriler */}
          <CategoryList
            categories={mentee.categories!}
            onEdit={() => setCategoryModalVisible(true)}
            isOwn={isOwn}
          />
          {/* Hedefler */}
          <GoalList
            goals={goals!}
            onEdit={() => setGoalModalVisible(true)}
            isOwn={isOwn}
          />

          {/* Modals */}
          {isOwn && (
            <>
              <GoalsEditModal
                visible={goalModalVisible}
                goals={mentee.goals!}
                onClose={() => setGoalModalVisible(false)}
                onSave={(updated) => setGoals(updated)}
              />
              <ContactEditModal
                visible={contactModalVisible}
                contact={contact}
                onClose={() => setContactModalVisible(false)}
                onSave={(updated) => setContact(updated)}
              />
              <CategoryEditModal
                visible={categoryModalVisible}
                categories={mentee?.categories ?? []}
                onClose={() => setCategoryModalVisible(false)}
                onSave={(updated) => setCategories(updated)}
              />
            </>
          )}
        </ScrollView>

        <ConfirmationModal
          visible={logoutDialogVisible}
          onClose={() => setLogoutDialogVisible(false)}
          onConfirm={handleLogout}
          message={t("sureLogout")}
          confirmText={t("logout")}
          cancelText={t("cancel")}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  profileCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginBottom: 15,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarFallback: {
    backgroundColor: "#333",
  },
  nameSection: {
    marginLeft: 15,
    flex: 1,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  roleText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 5,
  },
});

export default MenteeProfileScreen;
