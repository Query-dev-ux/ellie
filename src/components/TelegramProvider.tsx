import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

type TelegramProviderProps = {
  children: React.ReactNode;
};

export const TelegramContext = React.createContext<{
  tg: any | null;
}>({ tg: null });

const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [tg, setTg] = useState<any | null>(null);

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