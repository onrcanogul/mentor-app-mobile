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

export default api;
