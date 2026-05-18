import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api-uat.taprootcrm.com/",
  // baseURL: "http://192.168.0.180:4567",
});

// Attach token and domain header to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }

  config.headers["domain"] = "uat.taprootcrm.com";
  // config.headers["domain"] = window.location.hostname.replace("www.", "");

  return config;
});

export default axiosInstance;
