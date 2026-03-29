import axios from "axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/auth`;

export const loginRequest = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};

export const registerRequest = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};