import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiDelete, apiGet, apiPost } from "../lib/api";

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
}

interface CreateActivityInput {
  title: string;
  image_url?: string;
  location: string;
  start_time: string;
  category: string;
  description?: string;
  max_participants: number;
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
}

interface ActivityContextType {
  activities: Activity[];
  createActivity: (payload: CreateActivityInput) => Promise<void>;
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  refreshActivities: () => Promise<void>;
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
    isUserCreated: true
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const refreshActivities = useCallback(async () => {
    const remote = await apiGet<ActivityApi[]>("/api/v1/activities");
    setActivities(remote.map(mapApiToActivity));
    setFavorites(remote.filter((x) => x.is_favorite).map((x) => x.id));
  }, []);

  useEffect(() => {
    refreshActivities().catch((error) => {
      // Keep UI usable even if backend is temporarily unavailable.
      console.error("Failed to load activities:", error);
    });
  }, [refreshActivities]);

  const createActivity = useCallback(async (payload: CreateActivityInput) => {
    const created = await apiPost<ActivityApi>("/api/v1/activities", payload);
    setActivities((prev) => [mapApiToActivity(created), ...prev]);
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const prev = favorites;
      const currentlyFavorite = prev.includes(id);
      const next = currentlyFavorite ? prev.filter((x) => x !== id) : Array.from(new Set([...prev, id]));
      setFavorites(next);

      // Some static mock IDs still exist on detail mock card.
      if (!isUuid(id)) {
        return;
      }

      try {
        if (currentlyFavorite) {
          await apiDelete(`/api/v1/me/favorites/${id}`);
        } else {
          await apiPost<null>(`/api/v1/me/favorites/${id}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (!currentlyFavorite && (message.includes("already exists") || message.includes("conflict"))) {
          // Treat duplicate create as idempotent success.
          setFavorites((value) => (value.includes(id) ? value : [...value, id]));
          return;
        }

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
