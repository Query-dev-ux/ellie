import { useEffect, useState } from 'react';

interface TelegramWebApp {
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
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    query_id?: string;
    auth_date?: string;
    hash?: string;
  };
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      setTelegram(tg);

      // При монтировании компонента устанавливаем цвета
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#000000');
      
      if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2678b6');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#50a8eb');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');
      }
    }
  }, []);

  return {
    tg: telegram,
    user: telegram?.initDataUnsafe?.user,
    isSupported: Boolean(telegram),
    close: () => telegram?.close(),
    expand: () => telegram?.expand(),
  };
}; 