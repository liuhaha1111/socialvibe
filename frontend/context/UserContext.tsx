import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  email: string;
  location: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  name: '阿乐',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhkhxXONjiHxIF09JVO1EAedj2JJIFMqlz8yRlgmYauMmNxNHsISRyF8Ct2Zbxrl2MmBgZ3DCJYd6HET4amiHuN3zl-iGzKWB2OFMdVZ5nPioYANOgdacZph6SDKf9Xfj9Dade8K-M4Oxd8B1E9CRcU5hkpMlWNBfwWZBdCk0LKpJKADwiF6xFo65IP1TjH0cJnhVfkA5CmQcgu0bkhALMdti0VJ__uLletms_2w1lbaGq-KMOeSWgAFyApHHid0KAUor7UR9FURc',
  bio: '热爱生活，喜欢探索城市的每一个角落。',
  email: 'ale@example.com',
  location: '上海'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};