import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, BackHandler, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { Category } from "../../../../domain/category";
import categoryService from "../../../../services/category-service";
import menteeService from "../../../../services/mentee-service";
import toastrService from "../../../../services/toastr-service";
import * as SystemUI from "expo-system-ui";
import userService from "../../../../services/user-service";
import { useTranslation } from "react-i18next";

interface CategoryEditModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: (updatedCategories: Category[]) => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  visible,
  categories,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [dropdownItems, setDropdownItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await categoryService.get(
        () => {},
        () => {}
      );
      setAllCategories(response);
      setDropdownItems(
        response.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }))
      );
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategoryIds(categories.map((c) => c.id!));
  }, [categories]);

  // ✅ Geri tuşu desteği (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (visible) {
          onClose();
          return true; // Varsayılan davranışı engelle
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [visible]);

  // ✅ Navigation bar rengi korunsun (opsiyonel)
  useEffect(() => {
    if (visible && Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#121212");
    }
  }, [visible]);

  const handleSave = async () => {
    const selected = allCategories.filter((cat) =>
      selectedCategoryIds.includes(cat.id!)
    );
    const user = await userService.getCurrentUser();
    const response: boolean | undefined = await menteeService.addCategory(
      user.id,
      selected
    );
    if (response === true) {
      toastrService.success(t("categorySaveSuccess"));
      onSave(selected);
    } else {
      toastrService.error(t("categorySaveError"));
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose} // ✅ Android geri tuşu için gerekli
      statusBarTranslucent={true} // ✅ Üst barla uyumlu
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Kategorileri Seç</Text>

          <DropDownPicker
            multiple={true}
            min={0}
            max={10}
            searchable={true}
            searchPlaceholder={t("searchCategory")}
            placeholder={t("selectCategory")}
            placeholderStyle={{ color: "#FFFFFF" }}
            open={open}
            setOpen={setOpen}
            value={selectedCategoryIds}
            setValue={setSelectedCategoryIds}
            items={dropdownItems}
            setItems={setDropdownItems}
            mode="BADGE"
            badgeDotColors={["#FFD700", "#00FF99", "#FF6B6B"]}
            badgeTextStyle={{ color: "#FFFFFF" }}
            style={{
              backgroundColor: "#2C2C2C",
              borderColor: "#444",
              zIndex: 1000,
            }}
            dropDownContainerStyle={{
              backgroundColor: "#2C2C2C",
              borderColor: "#444",
            }}
            listItemLabelStyle={{ color: "#FFFFFF" }}
            searchTextInputStyle={{
              backgroundColor: "#1E1E1E",
              color: "#FFFFFF",
            }}
          />

          <View style={styles.actions}>
            <Button onPress={onClose} style={{ backgroundColor: "#FFD700" }}>
              İptal
            </Button>
            <Button style={{ backgroundColor: "#FFD700" }} onPress={handleSave}>
              Kaydet
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1E1E1E",
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFD700",
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default CategoryEditModal;
