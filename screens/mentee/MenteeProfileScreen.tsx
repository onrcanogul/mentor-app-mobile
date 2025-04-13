import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import GoalList from "../../components/mentee/profile/GoalList";
import ContactEditModal from "../../components/mentee/profile/modals/ContactEditModal";
import CategoryEditModal from "../../components/mentee/profile/modals/CategoryEditModal";
import GoalsEditModal from "../../components/mentee/profile/modals/GoalEditModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import CategoryList from "../../components/mentor/profile/CategoryList";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import userService from "../../services/user-service";
import menteeService from "../../services/mentee-service";
import toastrService from "../../services/toastr-service";
import { Mentee } from "../../domain/mentee";
import { Contact } from "../../domain/contact";
import LoadingSpinner from "../../utils/spinner";
import ProfileCard from "../../components/common/ProfileCard";

const MenteeProfileScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigator = useNavigation();
  const { setRole, setAuthenticated } = useAuth();
  const { theme } = useTheme();

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
  const [categories, setCategories] = useState(mentee?.user.categories);
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
      setCategories(mentee.user.categories);
      setContact({ email: mentee.user.email });
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await userService.logout();
    toastrService.success(t("logoutSuccess"));
    setRole(null);
    setAuthenticated(false);
    setTimeout(() => {
      navigator.navigate("Home" as never);
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

  if (!mentee || !mentee.user.categories || !mentee.goals) {
    return (
      <SafeAreaView
        style={[
          styles.safeContainer,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <LoadingSpinner visible={!mentee} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView
        style={[
          styles.safeContainer,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetch}
              tintColor={theme.colors.primary.main}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <ProfileCard
            username={mentee.user.username}
            email={mentee.user.email}
            imageUrl={mentee.user.imageUrl}
            role="Mentee"
            isOwn={isOwn}
            onImagePress={handleImageUpload}
            onLogoutPress={() => setLogoutDialogVisible(true)}
          />

          <View style={styles.content}>
            <CategoryList
              categories={mentee.user.categories!}
              onEdit={() => setCategoryModalVisible(true)}
              isOwn={isOwn}
            />

            <View style={styles.divider} />

            <GoalList
              goals={goals!}
              onEdit={() => setGoalModalVisible(true)}
              isOwn={isOwn}
            />
          </View>
        </ScrollView>

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
              categories={mentee?.user.categories ?? []}
              onClose={() => setCategoryModalVisible(false)}
              onSave={async (updated) => {
                setCategories(updated);
                setCategoryModalVisible(false);
                await fetch();
              }}
            />
          </>
        )}

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
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 24,
  },
});

export default MenteeProfileScreen;
