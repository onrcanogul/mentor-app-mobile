import axios from "axios";

export const domain = "https://mentorapp-webapi.fly.dev";
const api = axios.create({
  baseURL: `${domain}/api`,
});

api.interceptors.request.use((config) => {
  const token = "asdasdasdasasdasd";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
