import { useEffect, useState } from 'react';
import type { TelegramWebApp } from '../types/telegram';

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