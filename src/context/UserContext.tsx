"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateAnonymousUsername } from "@/lib/generateUsername";
import { fetchUserInfo } from "@/service/api";
import { UserType } from "@/types/types";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_AES_SECRET || "";

const encryptData = (data: object): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (cipherText: string): UserType | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Error decrypting user data:", error);
    return null;
  }
};

type UserContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = decryptData(storedUser);
          if (parsedUser) {
            setUser(parsedUser);
            return;
          }
        }

        const userInfo = await fetchUserInfo();
        if (!userInfo || !userInfo.ip)
          throw new Error("Failed to fetch user info");

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("ip", "==", userInfo.ip));
        const querySnapshot = await getDocs(q);

        let newUser: UserType;

        if (!querySnapshot.empty) {
          newUser = querySnapshot.docs[0].data() as UserType;
        } else {
          newUser = {
            username: generateAnonymousUsername(),
            ip: userInfo.ip,
            location: {
              city: userInfo.location?.city || "Unknown",
              state: userInfo.location?.state || "Unknown",
              country: userInfo.location?.country || "Unknown",
            },
            credit: 0,
            blackCard: false,
            gossips: [],
          };
          await setDoc(doc(usersRef, userInfo.ip), newUser);
        }
        setUser(newUser);
        sessionStorage.setItem("user", encryptData(newUser));
      } catch (error) {
        console.error("Error initializing user:", error);
        if (error instanceof Error) setError(error.message);
        else setError("An unknown error occurred");
      }
    };
    initializeUser();
  }, []);

  useEffect(() => {
    if (!user?.ip) return;
    const userRef = doc(db, "users", user.ip);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedUser = docSnap.data() as UserType;
        setUser(updatedUser);
        sessionStorage.setItem("user", encryptData(updatedUser));
      }
    });
    return () => unsubscribe();
  }, [user?.ip]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {error ? <div>Error: {error}</div> : children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
