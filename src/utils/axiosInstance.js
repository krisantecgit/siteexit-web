import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "https://api-uat.taprootcrm.com/",
  // baseURL: "http://192.168.0.180:4567", 
});

// Add a request interceptor to attach the token from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  if (token) {
    config.headers["Authorization"] = `Token ${token}`; // Add the token to the request headers
  }

  config.headers["domain"] = "uat.taprootcrm.com";
  // config.headers["domain"] = "192.168.0.180"; 
  // config.headers["domain"] = "192.168.100.114";
  // config.headers["domain"] = "central";
  // config.headers["domain"] = window.location.hostname.replace("www.", "");

// const host = window.location.hostname.replace("www.", "");
// config.headers["domain"] = host;


  return config;
});

export default axiosInstance;
