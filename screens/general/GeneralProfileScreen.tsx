import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text, Avatar, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import userService from "../../services/user-service";
import { Category } from "../../domain/category";
import CategoryList from "../../components/mentor/profile/CategoryList";
import CategoryEditModal from "../../components/mentor/profile/modals/CategoryEditModal";
import LoadingSpinner from "../../utils/spinner";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toastrService from "../../services/toastr-service";
import ProfileCard from "../../components/common/ProfileCard";

const GeneralProfileScreen = () => {
  const navigator = useNavigation();
  const { t } = useTranslation();
  const { setRole, setAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

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
    setTimeout(() => {
      navigator.navigate("Home");
    }, 1000);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LoadingSpinner visible={true} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchUser} />
        }
      >
        <ProfileCard
          username={user.username}
          email={user.email}
          imageUrl={user.imageUrl}
          role="General"
          isOwn={true}
          onLogoutPress={handleLogout}
        />

        <CategoryList
          categories={categories}
          isOwn={true}
          onEdit={() => setCategoryModalVisible(true)}
        />
      </ScrollView>

      <CategoryEditModal
        visible={categoryModalVisible}
        categories={categories}
        onClose={() => setCategoryModalVisible(false)}
        onSave={(updated) => setCategories(updated)}
      />
    </SafeAreaView>
  );
};

export default GeneralProfileScreen;

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
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarFallback: {
    backgroundColor: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
});
