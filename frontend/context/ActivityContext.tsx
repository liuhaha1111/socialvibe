import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiDelete, apiGet, apiPost } from "../lib/api";
import { useAuth } from "./AuthContext";

export interface Activity {
  id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  fullDate?: string;
  time?: string;
  participants: number;
  needed: number;
  tag: string;
  avatars: string[];
  full?: boolean;
  description?: string;
  isUserCreated?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
}

interface CreateActivityInput {
  title: string;
  image_url?: string;
  location: string;
  start_time: string;
  category: string;
  description?: string;
  max_participants: number;
  latitude: number;
  longitude: number;
}

interface ActivityListFilters {
  q?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

interface ActivityApi {
  id: string;
  title: string;
  image_url: string | null;
  location: string;
  start_time: string;
  category: string;
  description: string | null;
  participant_count: number;
  max_participants: number;
  is_favorite?: boolean;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number;
}

interface ActivityContextType {
  activities: Activity[];
  createActivity: (payload: CreateActivityInput) => Promise<void>;
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  refreshActivities: (filters?: ActivityListFilters) => Promise<void>;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop";

function formatDateAndTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  });
  const time = d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return { date: `${date} ${time}`, time };
}

function mapApiToActivity(api: ActivityApi): Activity {
  const participants = api.participant_count;
  const needed = Math.max(api.max_participants - participants, 0);
  const { date, time } = formatDateAndTime(api.start_time);
  const avatarCount = Math.min(Math.max(participants, 1), 3);

  return {
    id: api.id,
    title: api.title,
    image: api.image_url || DEFAULT_IMAGE,
    location: api.location,
    date,
    fullDate: api.start_time,
    time,
    participants,
    needed,
    tag: api.category,
    avatars: Array.from({ length: avatarCount }, () => DEFAULT_AVATAR),
    full: needed === 0,
    description: api.description || "",
    isUserCreated: true,
    latitude: api.latitude,
    longitude: api.longitude,
    distanceKm: api.distance_km
  };
}

function buildActivitiesPath(filters?: ActivityListFilters): string {
  if (!filters) {
    return "/api/v1/activities";
  }

  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.latitude !== undefined) params.set("latitude", filters.latitude.toString());
  if (filters.longitude !== undefined) params.set("longitude", filters.longitude.toString());
  if (filters.radius_km !== undefined) params.set("radius_km", filters.radius_km.toString());
  const query = params.toString();
  return query ? `/api/v1/activities?${query}` : "/api/v1/activities";
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessToken } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const refreshActivities = useCallback(async (filters?: ActivityListFilters) => {
    const remote = await apiGet<ActivityApi[]>(buildActivitiesPath(filters));
    setActivities(remote.map(mapApiToActivity));
    setFavorites(remote.filter((x) => x.is_favorite).map((x) => x.id));
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !getAccessToken()) {
      return;
    }
    refreshActivities().catch((error) => {
      // Keep UI usable even if backend is temporarily unavailable.
      console.error("Failed to load activities:", error);
    });
  }, [getAccessToken, isAuthenticated, isLoading, refreshActivities]);

  const createActivity = useCallback(async (payload: CreateActivityInput) => {
    const created = await apiPost<ActivityApi>("/api/v1/activities", payload);
    setActivities((prev) => [mapApiToActivity(created), ...prev]);
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const prev = favorites;
      const currentlyFavorite = prev.includes(id);
      const next = currentlyFavorite ? prev.filter((x) => x !== id) : [...prev, id];
      setFavorites(next);

      try {
        if (currentlyFavorite) {
          await apiDelete(`/api/v1/me/favorites/${id}`);
        } else {
          await apiPost<null>(`/api/v1/me/favorites/${id}`);
        }
      } catch (error) {
        setFavorites(prev);
        throw error;
      }
    },
    [favorites]
  );

  const isFavorite = useMemo(() => {
    const set = new Set(favorites);
    return (id: string) => set.has(id);
  }, [favorites]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        createActivity,
        favorites,
        toggleFavorite,
        isFavorite,
        refreshActivities
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
