import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const getProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        console.log("User role from profile:", data.role);
        setRole(data.role);
      } else {
        console.log("Profile not found or error:", error);
        // Fallback: check email for admin
        const userEmail = user?.email;
        console.log("Checking user email for admin:", userEmail);
        if (userEmail === "marvellousbenji721@gmail.com") {
          setRole("admin");
          console.log("Admin role set from email");
        } else {
          setRole("user");
          console.log("Default user role set");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setRole("user");
    }
  };

  useEffect(() => {
    const clearUserData = () => {
      setUser(null);
      setSession(null);
      setRole(null);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        clearUserData();
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await getProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        await getProfile(session.user.id);
      } else {
        clearUserData();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    console.log("Signing up user:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });

    if (error) {
      console.error("Sign up error:", error);
      return { error };
    }

    if (data?.user) {
      console.log("User created, setting up profile...");
      // Check if this is the admin email
      const isAdmin = email === "marvellousbenji721@gmail.com";

      // Insert into profiles with role
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: data.user.id,
        full_name: fullName,
        role: isAdmin ? "admin" : "user",
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      } else {
        console.log("Profile created successfully");
        
        // AUTO-SIGN IN AFTER SIGN UP
        console.log("Auto-signing in after sign up...");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error("Auto-sign in error:", signInError);
        } else {
          console.log("Auto-sign in successful");
        }
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    console.log("Signing in:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
    } else {
      console.log("Sign in successful");
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log("Starting sign out process...");
  
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setRole(null);
  
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error("Sign out error:", error);
        return { error };
      }
  
      console.log("Sign out successful");
      return { error: null };
    } catch (err: any) {
      console.error("Unexpected sign out error:", err);
      return { error: err };
    }
  };
  
  const value = { user, session, loading, role, signUp, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};