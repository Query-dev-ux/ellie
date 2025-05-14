import { useEffect, useState } from 'react';
import type { TelegramWebApp } from '../types/telegram';
import { useUrlParams } from './useUrlParams';

// Функция для извлечения данных пользователя из URL-параметров
const extractUserFromQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Сначала проверяем новые параметры с префиксами
  let userId = urlParams.get('a_userId');
  let username = urlParams.get('b_username');
  
  // Если не нашли, проверяем старые параметры
  if (!userId) {
    userId = urlParams.get('userId');
    if (!username) {
      username = urlParams.get('username');
    }
  }
  
  if (userId) {
    return {
      id: userId, // Теперь id сохраняем как строку
      first_name: 'User',
      username: username || undefined,
      source: 'url_params'
    };
  }
  
  return null;
};

export const useTelegram = () => {
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null);
  const [parsedUser, setParsedUser] = useState<{ id: string | number; username?: string; first_name?: string } | null>(null);
  const urlParams = useUrlParams();

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
      
      // Используем данные из URL с новыми префиксами
      if (!tg.initDataUnsafe?.user && !parsedUser && urlParams.userId) {
        const userFromNewParams = {
          id: urlParams.userId,
          username: urlParams.username,
          first_name: urlParams.username || 'User',
          source: urlParams.source || 'url_new_params'
        };
        console.log('Using user data from new URL parameters:', userFromNewParams);
        setParsedUser(userFromNewParams);
      }
      
      // Если новые параметры не найдены, пытаемся использовать старые параметры
      else if (!tg.initDataUnsafe?.user && !parsedUser) {
        const userFromParams = extractUserFromQueryParams();
        if (userFromParams) {
          console.log('Using user data from old URL parameters:', userFromParams);
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
      // Если Telegram WebApp недоступен, сначала пробуем новые параметры
      if (urlParams.userId) {
        const userFromNewParams = {
          id: urlParams.userId,
          username: urlParams.username,
          first_name: urlParams.username || 'User',
          source: urlParams.source || 'url_new_params'
        };
        console.log('Telegram WebApp not available, using new URL parameters:', userFromNewParams);
        setParsedUser(userFromNewParams);
      } else {
        // Затем пробуем старые параметры
        const userFromParams = extractUserFromQueryParams();
        if (userFromParams) {
          console.log('Telegram WebApp not available, using old URL parameters:', userFromParams);
          setParsedUser(userFromParams);
        }
      }
    }
  }, [urlParams]);

  // В объекте user используем либо данные из Telegram WebApp, либо извлеченные из URL
  const user = telegram?.initDataUnsafe?.user || parsedUser;

  // Добавляем дополнительные поля из параметров URL
  const enhancedUser = user ? {
    ...user,
    country: urlParams.country,
    device: urlParams.device,
    source: urlParams.source || (user as any).source,
    actions: urlParams.actions
  } : null;

  return {
    tg: telegram,
    user: enhancedUser,
    urlParams,
    initDataStr: telegram?.initData || null,
    isSupported: Boolean(telegram),
    close: () => telegram?.close(),
    expand: () => telegram?.expand(),
  };
}; 