export interface Activity {
  id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  price?: number;
  host: {
    name: string;
    avatar: string;
    rating?: number;
  };
  tags: string[];
  participants: number;
  maxParticipants: number;
  participantAvatars: string[];
  status?: 'active' | 'full' | 'finished' | 'confirmed' | 'waitlist' | 'pending';
  category?: string;
  description?: string;
}

export interface User {
  name: string;
  avatar: string;
}

export type Tab = 'home' | 'saved' | 'chat' | 'profile';