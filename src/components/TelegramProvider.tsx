import React, { useEffect, useState } from 'react';

// Define a proper interface for Telegram WebApp object
interface TelegramWebApp {
  ready: () => void;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  openLink: (url: string) => void;
  close: () => void;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
  // Add other telegram methods/properties as needed
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

type TelegramProviderProps = {
  children: React.ReactNode;
};

export const TelegramContext = React.createContext<{
  tg: TelegramWebApp | null;
}>({ tg: null });

const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const telegram = window?.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      setTg(telegram);
      
      // Установка цветов темы Telegram
      document.documentElement.style.setProperty('--tg-theme-bg-color', telegram.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', telegram.textColor);
      document.documentElement.style.setProperty('--tg-theme-button-color', telegram.buttonColor);
      document.documentElement.style.setProperty('--tg-theme-button-text-color', telegram.buttonTextColor);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ tg }}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramProvider; 