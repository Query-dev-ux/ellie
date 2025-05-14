import type { UserAction } from './models';

// Расширенный интерфейс пользователя
export interface EnhancedUser {
  id: string | number; // Может быть строкой из URL или числом из Telegram
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  // Дополнительные поля
  country?: string;
  device?: string;
  source?: string;
  actions?: UserAction[];
}

// Интерфейс для Telegram WebApp
export interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  backgroundColor: string;
  textColor: string;
  headerColor: string;
  version?: string;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  openLink: (url: string) => void;
  initData: string; // Raw строка инициализационных данных от Telegram
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    query_id?: string;
    auth_date?: number;
    hash?: string;
    start_param?: string; // Параметр, переданный при запуске мини-приложения
  };
}

// Глобальное объявление для Window
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
} 