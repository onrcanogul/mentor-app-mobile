import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Category } from "../../domain/category";
import CategoryList from "../../components/mentor/profile/CategoryList";
import CategoryEditModal from "../../components/mentee/profile/modals/CategoryEditModal";
import LoadingSpinner from "../../utils/spinner";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toastrService from "../../services/toastr-service";
import userService from "../../services/user-service";
import categoryService from "../../services/category-service";
import ProfileCard from "../../components/common/ProfileCard";
import { useTheme } from "../../contexts/ThemeContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "../../navigation/types";

const GeneralProfileScreen = () => {
  const navigator =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { setRole, setAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    const currentUser = await userService.getCurrentUser();
    setUser(currentUser);
    setCategories(currentUser.categories || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await userService.logout();
    toastrService.success(t("logoutSuccess"));
    setAuthenticated(false);
    setRole(null);
    navigator.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
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

      await userService.uploadProfilePhoto(file, user.id);
      await fetchUser();
    }
  };

  const handleSaveCategories = async (updatedCategories: Category[]) => {
    try {
      const response = await categoryService.get(
        () => {},
        () => {}
      );
      const selectedCategories = response.filter((cat) =>
        updatedCategories.some((updated) => updated.id === cat.id)
      );

      setCategories(selectedCategories);
      await userService.updateCategories(user.id, selectedCategories);
      toastrService.success(t("categorySaveSuccess"));
      await fetchUser();
    } catch (error) {
      toastrService.error(t("categorySaveError"));
    }
  };

  if (!user) {
    return (
      <SafeAreaView
        style={[
          styles.safeContainer,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <LoadingSpinner visible={true} />
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
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchUser}
            tintColor={theme.colors.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          username={user.username}
          email={user.email}
          imageUrl={user.imageUrl}
          role="General"
          isOwn={true}
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
              isOwn={true}
              onEdit={() => setCategoryModalVisible(true)}
            />
          </Animated.View>
        </View>
      </ScrollView>

      <CategoryEditModal
        visible={categoryModalVisible}
        categories={categories}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategories}
      />

      <ConfirmationModal
        visible={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        onConfirm={handleLogout}
        message={t("sureLogout")}
        confirmText={t("logout")}
        cancelText={t("cancel")}
      />
    </SafeAreaView>
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
  sectionContainer: {
    marginBottom: 24,
    paddingVertical: 16,
  },
});

export default GeneralProfileScreen;
