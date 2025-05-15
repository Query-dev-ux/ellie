import { useEffect, useState } from 'react';
import type { TelegramWebApp } from '../types/telegram';

// Функция для извлечения данных пользователя из URL-параметров
const extractUserFromQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const username = urlParams.get('username');
  
  if (userId) {
    return {
      id: parseInt(userId, 10),
      first_name: 'User',
      username: username || undefined,
      source: 'url_params'
    };
  }
  
  return null;
};

export const useTelegram = () => {
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null);
  const [parsedUser, setParsedUser] = useState<{ id: number; username?: string; first_name?: string } | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      setTelegram(tg);

      // Пытаемся получить данные пользователя из initData, если они недоступны в initDataUnsafe
      if (!tg.initDataUnsafe?.user && tg.initData) {
        try {
          console.log('Trying to extract user data from initData string');
          // Парсим данные из URL-encoded строки initData
          const params = new URLSearchParams(tg.initData);
          if (params.has('user')) {
            const extractedUser = JSON.parse(params.get('user') || '{}');
            console.log('Extracted user data from initData:', extractedUser);
            setParsedUser(extractedUser);
          }
        } catch (error) {
          console.error('Failed to parse user data from initData:', error);
        }
      }
      
      // Пытаемся получить данные пользователя из URL-параметров, если они все еще недоступны
      if (!tg.initDataUnsafe?.user && !parsedUser) {
        const userFromParams = extractUserFromQueryParams();
        if (userFromParams) {
          console.log('Using user data from URL parameters in useTelegram:', userFromParams);
          setParsedUser(userFromParams);
        }
      }

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
    } else {
      // Даже если Telegram WebApp недоступен, пытаемся получить данные пользователя из URL
      const userFromParams = extractUserFromQueryParams();
      if (userFromParams) {
        console.log('Telegram WebApp not available, but found user data in URL parameters:', userFromParams);
        setParsedUser(userFromParams);
      }
    }
  }, []);

  // Пытаемся извлечь пользователя из URL при каждом изменении адреса
  useEffect(() => {
    // Следим за изменениями в URL (например, при переходах в приложении)
    const handleURLChange = () => {
      if (!telegram?.initDataUnsafe?.user && !parsedUser) {
        const userFromParams = extractUserFromQueryParams();
        if (userFromParams) {
          console.log('URL changed, found user data in parameters:', userFromParams);
          setParsedUser(userFromParams);
        }
      }
    };

    // Добавляем обработчик для отслеживания изменений URL
    window.addEventListener('popstate', handleURLChange);
    
    // При первой загрузке тоже проверяем URL
    handleURLChange();
    
    // Очистка обработчика при размонтировании компонента
    return () => {
      window.removeEventListener('popstate', handleURLChange);
    };
  }, [telegram, parsedUser]);

  // В объекте user используем либо данные из Telegram WebApp, либо извлеченные из URL
  const user = telegram?.initDataUnsafe?.user || parsedUser;

  return {
    tg: telegram,
    user,
    initDataStr: telegram?.initData || null,
    isSupported: Boolean(telegram),
    close: () => telegram?.close(),
    expand: () => telegram?.expand(),
  };
}; 