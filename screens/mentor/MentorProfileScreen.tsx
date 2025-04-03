import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { Card, Text, Avatar, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
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

const MentorProfileScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigator = useNavigation();
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
      setCategories(fetchedMentor.categories || []);
    }
    setLoading(false);
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

      await userService.uploadProfilePhoto(file, mentor.userId);
    }
  };

  const handleLogout = async () => {
    await userService.logout();
    toastrService.success(t("logoutSuccess"));
    setRole(null);
    setAuthenticated(false);
    navigator.navigate("Home");
  };

  if (!mentor || !mentor.user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LoadingSpinner visible={!mentor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMentor}
            tintColor="#FFD700"
          />
        }
      >
        <Card style={styles.profileCard}>
          <View style={styles.header}>
            <TouchableOpacity onPress={isOwn ? handleImageUpload : undefined}>
              {mentor.user.imageUrl ? (
                <Image
                  source={{ uri: mentor.user.imageUrl }}
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
              <Text style={styles.nameText}>{mentor.user.username}</Text>
              <Text style={styles.roleText}>Mentor</Text>
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

        <CategoryList
          categories={categories}
          onEdit={() => setCategoryModalVisible(true)}
          isOwn={isOwn}
        />
        <SkillList
          skills={skills}
          onEdit={() => setSkillModalVisible(true)}
          isOwn={isOwn}
        />
        <ExperienceList
          experiences={experiences}
          onEdit={() => setExperienceModalVisible(true)}
          isOwn={isOwn}
        />
        <EducationList
          educations={educations}
          onEdit={() => setEducationModalVisible(true)}
          isOwn={isOwn}
        />
        <CertificateList
          certificates={certificates}
          onEdit={() => setCertificateModalVisible(true)}
          isOwn={isOwn}
        />
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
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});
