// Типы для данных в Firestore

// Тип для действий пользователя
export interface UserAction {
  type: string;
  timestamp: string;
  data?: Record<string, any>;
}

// Модель для хранения результата игры
export interface GameResult {
  id?: string;
  userId: string;
  username?: string;
  totalScore: number;
  stages: {
    [key: string]: {
      selectedOptionText: string;
      score: number;
    }
  };
  createdAt?: string;
  deviceInfo?: {
    country: string;
    device: string;
    platform: string;
  };
  source?: string;
  actions?: UserAction[];
}

// Модель для хранения пользовательских настроек
export interface UserSettings {
  id?: string;
  userId: string;
  username?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  lastVisit?: string;
  createdAt?: string;
  updatedAt?: string;
  country?: string;
  device?: string;
  source?: string;
}

// Модель для статистики использования
export interface UsageStats {
  id?: string;
  date: string;
  totalUsers: number;
  newUsers: number;
  completedGames: number;
  averageScore: number;
  platformStats: {
    [platform: string]: number;
  };
} 