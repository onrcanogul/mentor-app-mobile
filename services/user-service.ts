import AsyncStorage from "@react-native-async-storage/async-storage";
import ServiceResponse from "../domain/base/serviceResponse";
import { Mentor } from "../domain/mentor";
import { LoginModel, RegisterModel, User, UserType } from "../domain/user";
import api from "./axios/axiosInstance";
import { jwtDecode } from "jwt-decode";
import toastrService from "./toastr-service";
import i18n from "../i18n";

interface DecodedToken {
  name: string;
  role: string;
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
            : ""
        );

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
  }

  async loginWithRefreshToken(
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) return errorCallback();

    try {
      const response = await api.post<ServiceResponse<Token>>(
        `${this.endpoint}/login-with-refresh`,
        { refreshToken }
      );

      const resData = response.data;
      if (resData.isSuccessful && resData.data) {
        await AsyncStorage.setItem("accessToken", resData.data.accessToken);
        await AsyncStorage.setItem("refreshToken", resData.data.refreshToken);
        successCallback();
        return resData.data;
      } else {
        errorCallback();
      }
    } catch (error) {
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
      const response: ServiceResponse<Mentor> = (
        await api.post(`${this.endpoint}/register`, user)
      ).data;
      if (response.isSuccessful) {
        successCallback();
        return response.data;
      }
    } catch (error) {
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
        email: "onurcan@gmail.com",
        username: decoded.name,
        role: decoded.role,
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
}

export default new UserService();
