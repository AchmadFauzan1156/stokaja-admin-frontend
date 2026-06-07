"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  apiPost,
  apiGet,
  setTokens,
  clearTokens,
  getAccessToken,
} from "@/lib/api";

import { disconnectSocket } from "@/lib/socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiGet("/users/profil");
      const userData = {
        id: res.data._id || res.data.id,
        fullName: res.data.namaLengkap,
        email: res.data.email,
        role: res.data.role,
      };
      
      if (userData.role === "pelanggan") {
        clearTokens();
        setUser(null);
      } else {
        setUser(userData);
      }
    } catch (error) {
      if (error && (error.status === 401 || error.status === 403)) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // --- AUTH GUARD ROUTING ---
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ["/", "/LoginPage", "/SplashScreen"];
      const isPublicRoute = publicRoutes.includes(pathname);
      const adminOnlyRoutes = ["/users", "/categories", "/reports"];

      if (!user && !isPublicRoute) {
        // Jika belum login tapi akses halaman private, tendang ke login
        router.replace("/LoginPage");
      } else if (user && (pathname === "/LoginPage" || pathname === "/")) {
        // Jika sudah login tapi akses halaman login, arahkan ke dashboard
        router.replace("/dashboard");
      } else if (user && user.role === "kasir" && adminOnlyRoutes.includes(pathname)) {
        // Kasir dilarang mengakses manajemen user, kategori, dan laporan
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  // --- LOGIN ---
  const login = async (email, password) => {
    const res = await apiPost("/login", { email, password });

    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);

      const userData = {
        id: res.data.user.id,
        fullName: res.data.user.namaLengkap,
        email: res.data.user.email,
        role: res.data.user.role,
      };

      if (userData.role === "pelanggan") {
        clearTokens();
        throw new Error("Akses ditolak! Aplikasi ini khusus Admin & Kasir.");
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return userData;
    }

    throw new Error(res.pesan || "Login gagal");
  };


  // --- LOGOUT ---
  const logout = async () => {
    try {
      await apiPost("/logout", {});
    } catch {
      // Tetap lanjut logout meskipun API error
    }
    disconnectSocket(); // Putuskan koneksi Socket.io
    clearTokens();
    setUser(null);
  };

  // --- REFRESH PROFIL ---
  const refreshProfile = async () => {
    try {
      const res = await apiGet("/users/profil");
      const mapped = {
        id: res.data._id || res.data.id,
        fullName: res.data.namaLengkap,
        email: res.data.email,
        role: res.data.role,
      };
      setUser(mapped);
      return mapped;
    } catch {
      return null;
    }
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const isKasir = user?.role === "kasir";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        isAdmin,
        isKasir,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
