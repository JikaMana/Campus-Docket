import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Profile } from "@/lib/database.types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  profileError: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  async function fetchProfile(userId: string) {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const snapshot = await getDoc(doc(db, "profiles", userId));
      if (snapshot.exists()) {
        setProfile({
          id: snapshot.id,
          ...(snapshot.data() as Omit<Profile, "id">),
        });
        setProfileError(null);
      } else {
        setProfile(null);
        setProfileError(
          "No profile found for this account. Contact your administrator.",
        );
      }
    } catch (error) {
      setProfile(null);
      setProfileError(
        error instanceof Error ? error.message : "Failed to load profile",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      unsubscribeProfile?.();
      unsubscribeProfile = undefined;

      if (!firebaseUser) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      unsubscribeProfile = onSnapshot(
        doc(db, "profiles", firebaseUser.uid),
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile({
              id: snapshot.id,
              ...(snapshot.data() as Omit<Profile, "id">),
            });
            setProfileError(null);
          } else {
            setProfile(null);
            setProfileError(
              "No profile found for this account. Contact your administrator.",
            );
          }
          setProfileLoading(false);
        },
        (error) => {
          setProfile(null);
          setProfileError(error.message);
          setProfileLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, []);

  async function signOut() {
    await firebaseSignOut(auth);
    setProfile(null);
    setProfileError(null);
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.uid);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        profileError,
        signOut,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
