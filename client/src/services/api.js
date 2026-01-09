import axios from "axios";

// Helper to get the correct API Base URL
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Remove trailing slash if present
  if (url.endsWith("/")) url = url.slice(0, -1);
  // Append /api if not present
  if (!url.endsWith("/api")) url += "/api";
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
