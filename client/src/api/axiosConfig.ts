import axios from "axios";

const baseURL = "https://api.yampe.dev/api/v1";
// const baseURL = "http://localhost:3010/api/v1";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
