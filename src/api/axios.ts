// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token before each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle responses + errors globally
api.interceptors.response.use(
  (response) => {
    // Only allow 200 / 201 as success
    if (![200, 201].includes(response.status)) {
      return Promise.reject(
        new Error(`Unexpected status code: ${response.status}`)
      );
    }
    return response; // ✅ unwrap data so caller gets pure JSON
  },
  async (error) => {
    // Handle unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in-otp";
      }
    }

    // Extract error message for easier use in UI
    const message =
      error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      "Unknown API error";

    return Promise.reject(new Error(message));
  }
);

export default api;
