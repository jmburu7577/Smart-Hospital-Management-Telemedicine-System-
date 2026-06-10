import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Role = "patient" | "doctor" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  supabaseLogin?: (email: string, password: string) => Promise<void>;
  supabaseSignup?: (
    email: string,
    password: string,
    role: Role,
    fullName: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function ensureRoleRecord(profile: { id: string; role: Role }) {
  if (profile.role === "patient") {
    const { error } = await supabase
      .from("patients")
      .upsert([{ id: profile.id }], { onConflict: "id", ignoreDuplicates: false });

    if (error) {
      console.error("Error ensuring patient record:", error);
    }
  }

  if (profile.role === "doctor") {
    const { error } = await supabase
      .from("doctors")
      .upsert([{ id: profile.id, specialty: "General Practice" }], { onConflict: "id", ignoreDuplicates: false });

    if (error) {
      console.error("Error ensuring doctor record:", error);
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Load from localStorage first
      const savedUser = localStorage.getItem("afya_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // 2. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          await ensureRoleRecord({ id: profile.id, role: profile.role as Role });
          const supabaseUser: User = {
            id: profile.id,
            name: profile.full_name || "",
            email: profile.email || "",
            role: profile.role,
          };

          setUser(supabaseUser);
          localStorage.setItem("afya_user", JSON.stringify(supabaseUser));
        }
      }

      setLoading(false);
    };

    initAuth();

    // 3. Listen for auth changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            const supabaseUser: User = {
              id: profile.id,
              name: profile.full_name || "",
              email: profile.email || "",
              role: profile.role,
            };

            setUser(supabaseUser);
            localStorage.setItem("afya_user", JSON.stringify(supabaseUser));
          }
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("afya_user");
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  const login = (role: Role) => {
    const mockUser: User = {
      id:
        role === "doctor"
          ? "doc-1"
          : role === "admin"
            ? "admin-1"
            : "pat-1",
      name:
        role === "doctor"
          ? "Dr. Johnson"
          : role === "admin"
            ? "Admin User"
            : "John Doe",
      email: `${role}@example.com`,
      role,
    };

    setUser(mockUser);
    localStorage.setItem("afya_user", JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("afya_user");
    await supabase.auth.signOut();
  };

  const supabaseLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        const supabaseUser: User = {
          id: profile.id,
          name: profile.full_name || "",
          email: profile.email || "",
          role: profile.role as Role,
        };

        setUser(supabaseUser);
        localStorage.setItem("afya_user", JSON.stringify(supabaseUser));
      }
    }
  };

  const supabaseSignup = async (
    email: string,
    password: string,
    role: Role,
    fullName: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        supabaseLogin,
        supabaseSignup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}