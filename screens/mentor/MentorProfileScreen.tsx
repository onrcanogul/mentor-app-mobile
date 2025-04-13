import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../contexts/ThemeContext";
import userService from "../../services/user-service";
import { Mentor } from "../../domain/mentor";
import { Badge } from "../../domain/badge";
import { Certificate } from "../../domain/certificate";
import { Education } from "../../domain/education";
import { Experience } from "../../domain/experience";
import { Skill } from "../../domain/skill";
import CertificateList from "../../components/mentor/profile/CertificateList";
import EducationList from "../../components/mentor/profile/EducationList";
import SkillList from "../../components/mentor/profile/SkillList";
import ExperienceList from "../../components/mentor/profile/ExperienceList";
import CertificateEditModal from "../../components/mentor/profile/modals/CeritificateEditModal";
import EducationEditModal from "../../components/mentor/profile/modals/EducationEditModal";
import SkillEditModal from "../../components/mentor/profile/modals/SkillEditModal";
import ExperienceEditModal from "../../components/mentor/profile/modals/ExperienceEditModal";
import mentorService from "../../services/mentor-service";
import { Category } from "../../domain/category";
import CategoryEditModal from "../../components/mentor/profile/modals/CategoryEditModal";
import CategoryList from "../../components/mentor/profile/CategoryList";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toastrService from "../../services/toastr-service";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import LoadingSpinner from "../../utils/spinner";
import ProfileCard from "../../components/common/ProfileCard";
import Animated, { FadeInDown } from "react-native-reanimated";

const MentorProfileScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [mentor, setMentor] = useState<Mentor>();
  const { setRole, setAuthenticated } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const [isOwn, setIsOwn] = useState<boolean>(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [educationModalVisible, setEducationModalVisible] = useState(false);
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    fetchMentor();
  }, []);

  const fetchMentor = async () => {
    setLoading(true);
    const user = await userService.getCurrentUser();
    const userId = (route.params as any)?.mentorId || user?.id;
    setIsOwn(userId === user?.id);
    const fetchedMentor = await mentorService.get(userId);
    if (fetchedMentor) {
      setMentor(fetchedMentor);
      setBadges(fetchedMentor.badges || []);
      setCertificates(fetchedMentor.certificates || []);
      setEducations(fetchedMentor.educations || []);
      setSkills(fetchedMentor.skills || []);
      setExperiences(fetchedMentor.experiences || []);
      setCategories(fetchedMentor.user.categories || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert(t("galleryPermissionRequired"));
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

      await userService.uploadProfilePhoto(file, mentor.userId);
      await fetchMentor();
    }
  };

  const handleLogout = async () => {
    await userService.logout();
    toastrService.success(t("logoutSuccess"));
    setRole(null);
    setAuthenticated(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    headerGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 150,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    sectionContainer: {
      marginBottom: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background.tertiary,
    },
    lastSection: {
      borderBottomWidth: 0,
    },
  });

  if (!mentor || !mentor.user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LoadingSpinner visible={!mentor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <ScrollView
        style={[styles.container]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMentor}
            tintColor={theme.colors.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          username={mentor.user.username}
          email={mentor.user.email}
          imageUrl={mentor.user.imageUrl}
          role="Mentor"
          isOwn={isOwn}
          onImagePress={handleImageUpload}
          onLogoutPress={() => setLogoutDialogVisible(true)}
        />

        <View style={styles.content}>
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.sectionContainer}
          >
            <CategoryList
              categories={categories}
              onEdit={() => setCategoryModalVisible(true)}
              isOwn={isOwn}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.sectionContainer}
          >
            <SkillList
              skills={skills}
              onEdit={() => setSkillModalVisible(true)}
              isOwn={isOwn}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.sectionContainer}
          >
            <ExperienceList
              experiences={experiences}
              onEdit={() => setExperienceModalVisible(true)}
              isOwn={isOwn}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.sectionContainer}
          >
            <EducationList
              educations={educations}
              onEdit={() => setEducationModalVisible(true)}
              isOwn={isOwn}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500)}
            style={[styles.sectionContainer, styles.lastSection]}
          >
            <CertificateList
              certificates={certificates}
              onEdit={() => setCertificateModalVisible(true)}
              isOwn={isOwn}
            />
          </Animated.View>
        </View>
      </ScrollView>

      {isOwn && (
        <>
          <CertificateEditModal
            visible={certificateModalVisible}
            certificates={certificates}
            onClose={() => setCertificateModalVisible(false)}
            onSave={(updated) => setCertificates(updated)}
          />
          <EducationEditModal
            visible={educationModalVisible}
            educations={educations}
            onClose={() => setEducationModalVisible(false)}
            onSave={(updated) => setEducations(updated)}
          />
          <SkillEditModal
            visible={skillModalVisible}
            skills={skills}
            onClose={() => setSkillModalVisible(false)}
            onSave={(updated) => setSkills(updated)}
          />
          <CategoryEditModal
            visible={categoryModalVisible}
            categories={categories}
            onClose={() => setCategoryModalVisible(false)}
            onSave={(updated) => setCategories(updated)}
          />
          <ExperienceEditModal
            visible={experienceModalVisible}
            experiences={experiences}
            onClose={() => setExperienceModalVisible(false)}
            onSave={(updated) => setExperiences(updated)}
          />
        </>
      )}

      <ConfirmationModal
        visible={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        onConfirm={async () => {
          setLogoutDialogVisible(false);
          await handleLogout();
        }}
        message={t("sureLogout")}
        confirmText={t("logout")}
        cancelText={t("cancel")}
      />
    </SafeAreaView>
  );
};

export default MentorProfileScreen;
