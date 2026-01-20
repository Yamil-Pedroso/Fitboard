/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { IUser } from "@/services/usersService";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser as apiLogout,
} from "@/services/usersService";
import axiosInstance from "@/api/axiosConfig";

type RegisterInput = {
  email: string;
  username: string;
  password: string;
  avatarFile?: File;
};

type AuthContextType = {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthContext not found");
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);

  console.log("AuthProvider render", { user });

  // 1) Sync token -> axios header (si no tienes interceptor que lea localStorage en cada request)
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }, [token]);

  // 2) Cargar /me al montar si hay token (con guard de unmount y manejo 401)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
        if (mounted) setUser(me);
      } catch (e: any) {
        // si expira/401, limpiar sesión
        localStorage.removeItem("token");
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function register(input: RegisterInput) {
    try {
      setError(null);
      setLoading(true);
      await registerUser(input); // crea la cuenta
      const { token, user } = await loginUser(input.email, input.password); // login
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Registration failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setError(null);
      setLoading(true);
      const { token, user } = await loginUser(email, password);
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  const logout = useCallback(() => {
    // Con Bearer basta con limpiar el token local.
    void apiLogout().catch(() => {});
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // si falla (401/403), cerrar sesión
      logout();
    }
  }, [token, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      error,
      register,
      login,
      logout,
      refreshMe,
    }),
    [user, token, isLoading, error, logout, refreshMe]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
