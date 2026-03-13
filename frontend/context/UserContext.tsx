import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet, apiPut } from "../lib/api";

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  email: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface ProfileApi {
  id: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  email: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

const defaultUser: UserProfile = {
  id: "",
  name: "User",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
  bio: "",
  email: "",
  location: "",
  latitude: null,
  longitude: null
};

function mapApiToUser(profile: ProfileApi): UserProfile {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar_url,
    bio: profile.bio || "",
    email: profile.email || "",
    location: profile.location || "",
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const refreshUser = useCallback(async () => {
    const data = await apiGet<ProfileApi>("/api/v1/me/profile");
    setUser(mapApiToUser(data));
  }, []);

  useEffect(() => {
    refreshUser().catch((error) => {
      console.error("Failed to load user profile:", error);
    });
  }, [refreshUser]);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    const payload: Record<string, string> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.email !== undefined) {
      const normalized = updates.email.trim();
      if (normalized) {
        payload.email = normalized;
      }
    }
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.latitude !== undefined) payload.latitude = updates.latitude;
    if (updates.longitude !== undefined) payload.longitude = updates.longitude;

    const data = await apiPut<ProfileApi>("/api/v1/me/profile", payload);
    setUser(mapApiToUser(data));
  }, []);

  return <UserContext.Provider value={{ user, updateUser, refreshUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
