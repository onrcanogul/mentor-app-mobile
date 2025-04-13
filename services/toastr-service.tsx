import Toast from "react-native-toast-message";

class ToastrService {
  success(title: string, message?: string) {
    Toast.show({
      type: "success",
      text1: title ?? "Başarılı !",
      text2: message,
      position: "top",
      visibilityTime: 4000,
      topOffset: 20,
    });
  }

  error(title: string, message?: string) {
    Toast.show({
      type: "error",
      text1: title ?? "Hata !",
      text2: message,
      position: "top",
      visibilityTime: 4000,
      topOffset: 20,
    });
  }

  info(title: string, message?: string) {
    Toast.show({
      type: "info",
      text1: title ?? "Uyarı !",
      text2: message,
      position: "top",
      visibilityTime: 4000,
      topOffset: 20,
    });
  }
}

export default new ToastrService();
