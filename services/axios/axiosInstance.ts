import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const domain = "https://mentorapp-webapi.fly.dev";
const api = axios.create({
  baseURL: `${domain}/api`,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${domain}/api/user/login-with-refresh`,
          {
            refreshToken,
          }
        );

        if (response.data.isSuccessful && response.data.data) {
          // Save new tokens
          await AsyncStorage.setItem(
            "accessToken",
            response.data.data.accessToken
          );
          await AsyncStorage.setItem(
            "refreshToken",
            response.data.data.refreshToken
          );

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and throw error
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("role");
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
