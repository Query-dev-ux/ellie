import React, { useEffect, useState } from 'react';
import type { TelegramWebApp } from '../types/telegram';

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
      // Используем spread оператор для избежания проблем с типами
      setTg({...telegram});
      
      // Установка цветов темы Telegram
      document.documentElement.style.setProperty('--tg-theme-bg-color', telegram.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', telegram.textColor);
      
      // Используем themeParams для buttonColor и buttonTextColor
      if (telegram.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-button-color', telegram.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', telegram.themeParams.button_text_color);
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ tg }}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramProvider; 