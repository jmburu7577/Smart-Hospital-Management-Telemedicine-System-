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

  supabaseLogin: (email: string, password: string) => Promise<{ user: User }>;
  supabaseSignup: (
    email: string,
    password: string,
    role: Role,
    fullName: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure role tables exist
async function ensureRoleRecord(profile: { id: string; role: Role }) {
  if (profile.role === "patient") {
    await supabase.from("patients").upsert(
      [{ id: profile.id }],
      { onConflict: "id" }
    );
  }

  if (profile.role === "doctor") {
    await supabase.from("doctors").upsert(
      [{ id: profile.id, specialty: "General Practice" }],
      { onConflict: "id" }
    );
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // INIT AUTH
  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem("afya_user");
        if (saved) {
          setUser(JSON.parse(saved));
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
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
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
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

  // MOCK LOGIN (optional)
  const login = (role: Role) => {
    const mockUser: User = {
      id: role === "doctor" ? "doc-1" : role === "admin" ? "admin-1" : "pat-1",
      name: role === "doctor" ? "Dr. Johnson" : "John Doe",
      email: `${role}@example.com`,
      role,
    };

    setUser(mockUser);
    localStorage.setItem("afya_user", JSON.stringify(mockUser));
  };

  // LOGOUT
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("afya_user");
    localStorage.removeItem("isLoggedIn");
    await supabase.auth.signOut();
  };

  // LOGIN (FIXED — NO SQUIGGLY ANYMORE)
  const supabaseLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const supabaseUser: User = {
      id: profile.id,
      name: profile.full_name || "",
      email: profile.email || "",
      role: profile.role,
    };

    setUser(supabaseUser);
    localStorage.setItem("afya_user", JSON.stringify(supabaseUser));

    return { user: supabaseUser };
  };

  // SIGNUP (FULL FIXED)
  const supabaseSignup = async (
    email: string,
    password: string,
    role: Role,
    fullName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");

    await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      },
    ]);

    await ensureRoleRecord({
      id: data.user.id,
      role,
    });

    const user: User = {
      id: data.user.id,
      name: fullName,
      email,
      role,
    };

    localStorage.setItem("afya_user", JSON.stringify(user));
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