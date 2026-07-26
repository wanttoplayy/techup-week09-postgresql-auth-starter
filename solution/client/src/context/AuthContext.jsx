import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { apiClient, requireEndpoint } from "../api/apiClient.js";
import { API_ENDPOINTS } from "../config/apiEndpoints.js";

const AuthContext = createContext(null);
const tokenKey = "blog-studio-token";
const userKey = "blog-studio-user";

function readStoredUser() {
  const storedUser = localStorage.getItem(userKey);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem(userKey);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  async function register(formData) {
    const endpoint = requireEndpoint("register", API_ENDPOINTS.register);
    const response = await apiClient.post(endpoint, formData);
    return response.data;
  }

  async function login(formData) {
    const endpoint = requireEndpoint("login", API_ENDPOINTS.login);
    const response = await apiClient.post(endpoint, formData);

    localStorage.setItem(tokenKey, response.data.token);
    localStorage.setItem(userKey, JSON.stringify(response.data.user));
    setUser(response.data.user);

    return response.data;
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && localStorage.getItem(tokenKey)),
      register,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
