import AsyncStorage from "@react-native-async-storage/async-storage";
import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Mentor } from "../domain/mentor";
import { LoginModel, RegisterModel, User, UserType } from "../domain/user";
import api from "./axios/axiosInstance";
import { jwtDecode } from "jwt-decode";
import toastrService from "./toastr-service";
import i18n from "../i18n";
import { Category } from "../domain/category";

interface DecodedToken {
  name: string;
  Role: string;
  email: string;
  exp: number;
  Id: string;
}

class UserService {
  endpoint = "/user";

  async get(
    userId: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<Mentor> = (
      await api.get(`${this.endpoint}/${userId}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
      return response.data;
    } else {
      errorCallback();
    }
  }

  async addCategory(userId: string, category: Category[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/add-category/${userId}`, category)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async login(
    dto: Partial<LoginModel>,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    try {
      const response = await api.post<ServiceResponse<Token>>(
        `${this.endpoint}/login`,
        dto
      );

      const resData = response.data;
      if (resData.isSuccessful && resData.data) {
        await AsyncStorage.setItem("accessToken", resData.data.accessToken);
        await AsyncStorage.setItem("refreshToken", resData.data.refreshToken);
        await AsyncStorage.setItem(
          "role",
          dto.role === UserType.Mentor
            ? "Mentor"
            : dto.role === UserType.Mentee
            ? "Mentee"
            : "General"
        );
        await AsyncStorage.setItem("isAuthenticated", "true");

        successCallback();
        return resData.data;
      } else {
        errorCallback();
      }
    } catch (error) {
      console.log(error.response.data.errors);
      toastrService.error(i18n.t(error.response.data.errors[0]));
      errorCallback();
    }
  }

  async logout() {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("isAuthenticated");
  }

  async loginWithRefreshToken(
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const storedRole = await AsyncStorage.getItem("role");
    if (!refreshToken || !storedRole) return errorCallback();

    try {
      const response = await api.post<ServiceResponse<Token>>(
        `${this.endpoint}/login-with-refresh/${refreshToken}`
      );

      const resData = response.data;
      if (resData.isSuccessful && resData.data) {
        await AsyncStorage.setItem("accessToken", resData.data.accessToken);
        await AsyncStorage.setItem("refreshToken", resData.data.refreshToken);
        await AsyncStorage.setItem("role", storedRole);
        successCallback();
        return resData.data;
      } else {
        await this.logout();
        errorCallback();
      }
    } catch (error) {
      await this.logout();
      errorCallback();
    }
  }

  async uploadProfilePhoto(file: any, userId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const response = await api.post(`${this.endpoint}/upload-pp`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async register(
    user: Partial<RegisterModel>,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    try {
      // Validate required fields
      if (
        !user.userName ||
        !user.email ||
        !user.password ||
        !user.confirmPassword ||
        !user.fullName
      ) {
        toastrService.error(i18n.t("allFieldsRequired"));
        errorCallback();
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        toastrService.error(i18n.t("invalidEmail"));
        errorCallback();
        return;
      }

      // Validate password strength
      if (user.password.length < 8) {
        toastrService.error(i18n.t("passwordTooShort"));
        errorCallback();
        return;
      }

      // Validate password match
      if (user.password !== user.confirmPassword) {
        toastrService.error(i18n.t("passwordsDoNotMatch"));
        errorCallback();
        return;
      }

      const response: ServiceResponse<Mentor> = (
        await api.post(`${this.endpoint}/register`, user)
      ).data;

      if (response.isSuccessful) {
        successCallback();
        return response.data;
      } else {
        toastrService.error(i18n.t("registrationFailed"));
        errorCallback();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        toastrService.error(i18n.t(error.response.data.errors[0]));
      } else {
        toastrService.error(i18n.t("unexpectedError"));
      }
      errorCallback();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return null;
      const decoded: DecodedToken = jwtDecode(token);
      return {
        id: decoded.Id,
        email: decoded.email,
        username: decoded.name,
        role: decoded.Role,
        imageUrl: "",
      };
    } catch (error) {
      console.error("Token çözümlenemedi:", error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return false;

      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  async updateCategories(userId: string, categories: Category[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/categories/${userId}`, categories)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
      return false;
    }
  }
}

export default new UserService();
