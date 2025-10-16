// src/api/auth.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/"

export const sendOtp = async (mobile: string) => {
  return axios.post(`${API_URL}auth/send-otp/`, { mobile });
};

export const verifyOtp = async (mobile: string, otp: string) => {
  return axios.post(`${API_URL}auth/verify-otp/`, { mobile, otp });
};
