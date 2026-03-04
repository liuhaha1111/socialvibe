import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Activity {
  id: string;
  title: string;
  image: string;
  location: string;
  date: string; // Display string like "周六 14:00" or raw date
  fullDate?: string; // ISO date for sorting
  time?: string;
  participants: number;
  needed: number;
  tag: string; // This corresponds to the category
  avatars: string[];
  full?: boolean;
  description?: string;
  isUserCreated?: boolean;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const initialActivities: Activity[] = [
  {
    id: '1',
    title: '零基础陶艺课',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP9x44qufWshcsMDgBOXi3FCgAtWCA-26ldv3R5XRN3v3D__umEEsbH-JruVs_5ox-yHZlkRUdDg9YdbNwcVSif2zTK60N3i6ZBkXZkZ10adkqFXZUDdsxY0V7cYGAu47Ba0KAKDMfWPSvY63ctYA8YYow6lIn0ADG4HuRfE2CRcHSwiEpnH8_cdPXmk1iAO3pA41l273E9gNvtAeCyzJdZGR2b5wpvgEMzG1KHK0tMNpTFfQKHTfLqdzTygxCg3nhec0xa4TSKg0',
    location: '静安区 · Studio A',
    date: '周六 14:00',
    participants: 2,
    needed: 1,
    tag: '手作体验',
    avatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVUS8QfNzBJ1Ax4yjB-Hh-ncjG28jSHzaeK6Vx-b9JSPRzlAm3sRJE2By0nn5NssMeAKPxEUADMWkfU9eUuoJMU3UN2Rg9OOQ4Pa0beUF5UoPO5PCkx3qzjQFRHQfCY7JfAjf6yA0glm7BoeQDC4JCDevasPRni2TFqmdvLCML9AMZ9XkrIOx-GNulrwhEXXGqtPj2aUbBEJMTP_yu7Z8mzeu6JsON4IDoHd0276m_9KrGDw4qeXmlkgvSjNm_rjdFx8r3NAx9MVs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlTsP3mg-8j8Nyuc7fW0zRMxop01BemT2slZPAcIc71WevDUVy0QubOQApydTFZ1IzWMfR7Jj2xLE6lXd3vgfXtClgqZ3jh-cNTIpYQs7PdEnvhSFY7chofQapDYmob0iM2AuTbrTC0L0N-gNgt1SHtntjJi3kvZ2RGBMaLg33GcJxuBTa7P4muS0OcsvdMvY9DNgAETCpT7f3JDnHDngNLZqIMDfaNUhDv9x_KHzXM-Sdd34FBSlYUZiTtLi3OjzKC-YkA82oXg4'
    ]
  },
  {
    id: '2',
    title: '卡坦岛 & 闲聊之夜',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsSqDri2d97GfwWaS0VVg62NDx0lxD9EyEWClhrdqzELKix8F9-xrpDFe7vJT1wcRLZOmlX6CpF-xjQjNVRFpNwzxXWWON73Tr6z2C0KzCD4jN18Y4fAxx8kJqqRGzFCfAOnwDvGTDosCSfHjxYJqo8vCtYLIII23WZIKRkRV35UrFSgcotNN9fS5gLc0-7yYCC7js8p7OkWpguXX9iAHOh7RulfWYDg-LEggRXIE8Kaz3eSXzPidTpawQlaAEAieTy7cbTltZJiM',
    location: '徐汇区 · 蓝色咖啡馆',
    date: '周日 18:00',
    participants: 1,
    needed: 3,
    tag: '桌游局',
    avatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJOLUBxGQQT4dzUoAcX6otYQZzMBJZXrPu0AXkrxYfzLrHapRPPWAee-R5yUO2CIBAMIn_M985Zyp7uOX20tDbrsYMkzq5k3RN0gb7QAMvQQznlSwUoF36D1Fw4KfL4Afh186DJ3WUaOB4KEUBLpwF13DZF9gbsmN_9Du0Pe8brNoQffEpiAfGziTCQztvq7PAMeZ_kkZLfR0Nd6PSKkLM3f9AxTUQhubEdRRiD2e_Lcbs_1igeLGSdzypZDecKKxWiifm1vmdim4'
    ]
  },
  {
    id: '3',
    title: '早间咖啡跑团',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDMAHT2D9iANNFqugigMC8hS4wp_L5EyRwSmWTsN2jsPmRArWOswEuSL7MmSfjrdWC5-fI9vhSZIa_Nm6Yj3IQt6BuhcpbC1fg5CK-_F3aCkXEd9HO7QHP7SUVNGtty3sfWtpN5886XC3CUWWo1O-odIuITHHHMuncCCqT9x-36xTYAcHNgqsn2Y-MwtUOPRWaLez12BK5lm7pOZsPdC6qslRSF0dvpuE4eXayNcXtGNVe8PdcTKo74VzPXqo8AVWY78Hp52rL2G4',
    location: '黄浦区 · 烘焙工坊',
    date: '周一 08:00',
    participants: 5,
    needed: 0,
    tag: '城市徒步',
    avatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAF5Nn70vvN1qd_3mSQ1ojKpuHzfuBgYxt-_yvvIbHzeznK5dsN2ovITwbAfpiNR4jPsLWpyAVvZ-BcvI67Ps0B5n5J0-fwj7h8Ax9KUvIEy7rB37Qt_mnSyf8PrdHFAMJybvj7s_-Gi7ECdxsoSnzUQHbPvRA4ZPI7uXZ5dJva2pHJLGKVT_b23rXD5dW-sUbfK79l6jlfzYDBDrXZy-k7NxK05J4W9jmHFXqMFRC83B474OicdVQfPZH-SuOx9tFbAGeb-dGtDIw'
    ],
    full: true
  }
];

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [favorites, setFavorites] = useState<string[]>([]);

  const addActivity = (activity: Activity) => {
    // Add new activity to the beginning of the list
    setActivities(prev => [activity, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <ActivityContext.Provider value={{ activities, addActivity, favorites, toggleFavorite, isFavorite }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within a ActivityProvider');
  }
  return context;
};