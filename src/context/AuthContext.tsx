"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface UserProfile {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoUrl: string;
  stacks: string[];
  credit: number;
  createdAt: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateUser = useCallback(
    async (fbUser: FirebaseUser): Promise<UserProfile | null> => {
      try {
        const idToken = await fbUser.getIdToken();

        const response = await fetch("/api/auth/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0],
            photoUrl: fbUser.photoURL || "",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch/create user profile");
        }

        const data = await response.json();
        return data.user;
      } catch (err) {
        console.error("Error fetching/creating user:", err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userProfile = await fetchOrCreateUser(fbUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchOrCreateUser]);

  const signIn = async () => {
    if (!auth || !googleProvider) {
      setError("Sign-in is not configured. Add Firebase credentials to .env.local");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userProfile = await fetchOrCreateUser(result.user);
      setUser(userProfile);
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    setError(null);

    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
