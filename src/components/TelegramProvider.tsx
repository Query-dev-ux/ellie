import React, { useEffect, useState, useCallback } from 'react';
import type { TelegramWebApp } from '../types/telegram';
import { useAppLogging } from '../hooks/useAppLogging';

type TelegramProviderProps = {
  children: React.ReactNode;
};

export const TelegramContext = React.createContext<{
  tg: TelegramWebApp | null;
}>({ tg: null });

// Добавляем определение для process.env, чтобы TypeScript не ругался
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
  };
};

// Функция для извлечения данных пользователя из URL-параметров
const extractUserFromQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const username = urlParams.get('username');
  
  if (userId) {
    console.log('Extracted userId from URL parameters:', userId);
    return {
      id: parseInt(userId, 10),
      username: username || undefined,
      first_name: 'User',
      source: 'url_params'
    };
  }
  
  return null;
};

const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [extractedUserId, setExtractedUserId] = useState<number | null>(null);
  const [extractedUsername, setExtractedUsername] = useState<string | null>(null);
  const { logAppOpen, logAppClose, isInitialized: isLoggingInitialized } = useAppLogging();

  // Функция для логирования открытия приложения
  const handleAppOpen = useCallback(async () => {
    if (!tg) {
      console.warn('Cannot log app_open: Telegram WebApp is not available');
      return;
    }
    
    // Подробное логирование данных пользователя
    console.log('Telegram WebApp initData:', {
      hasInitData: !!tg.initData,
      initDataLength: tg.initData?.length,
      initDataUnsafe: tg.initDataUnsafe || 'not available',
      user: tg.initDataUnsafe?.user || 'user data not available',
      userId: tg.initDataUnsafe?.user?.id,
      username: tg.initDataUnsafe?.user?.username,
      authDate: tg.initDataUnsafe?.auth_date,
      hash: tg.initDataUnsafe?.hash ? 'hash exists' : 'no hash',
    });
    
    // Извлечение данных пользователя из initData, если они недоступны в initDataUnsafe
    let userData = null;
    if (!tg.initDataUnsafe?.user && tg.initData) {
      try {
        // Попытка извлечь данные из URL-encoded initData
        const params = new URLSearchParams(tg.initData);
        if (params.has('user')) {
          userData = JSON.parse(params.get('user') || '{}');
          console.log('Extracted user data from initData:', userData);
          
          // Сохраняем извлеченные данные для дальнейшего использования
          if (userData && userData.id) {
            setExtractedUserId(userData.id);
            setExtractedUsername(userData.username || null);
          }
        } else {
          // Печатаем все параметры для диагностики
          console.log('initData params:', Array.from(params.entries()));
        }
      } catch (error) {
        console.error('Failed to parse user data from initData:', error);
      }
    }
    
    // Если данные пользователя все еще недоступны, пробуем получить их из URL-параметров
    if (!userData && !tg.initDataUnsafe?.user && (extractedUserId !== null || extractedUsername !== null)) {
      userData = {
        id: extractedUserId,
        username: extractedUsername,
        source: 'url_params'
      };
      console.log('Using user data from URL parameters:', userData);
    }
    
    try {
      await logAppOpen({
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        extractedUserId: userData?.id || extractedUserId,
        extractedUsername: userData?.username || extractedUsername
      });
      console.log('App open logged successfully');
    } catch (error) {
      console.error('Failed to log app open:', error);
    }
  }, [tg, logAppOpen, extractedUserId, extractedUsername]);

  // Функция для определения метода запуска
  const detectLaunchMethod = useCallback(() => {
    // Собираем информацию о запуске
    const diagnostics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      search: window.location.search,
      referrer: document.referrer,
      isInIframe: window !== window.parent,
      isHttps: window.location.protocol === 'https:',
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };
    
    // Проверяем параметры URL для извлечения userId и username
    const urlParams = new URLSearchParams(window.location.search);
    diagnostics.hasUserIdParam = urlParams.has('userId');
    diagnostics.hasUsernameParam = urlParams.has('username');
    if (urlParams.has('userId')) {
      diagnostics.userIdFromURL = urlParams.get('userId');
    }
    if (urlParams.has('username')) {
      diagnostics.usernameFromURL = urlParams.get('username');
    }
    
    // Определяем, запущено ли приложение через Telegram
    if (window.Telegram?.WebApp) {
      diagnostics.isTelegramAvailable = true;
      diagnostics.telegramVersion = window.Telegram.WebApp.version || 'unknown';
      diagnostics.hasInitData = !!window.Telegram.WebApp.initData;
      diagnostics.hasUser = !!window.Telegram.WebApp.initDataUnsafe?.user;
      
      // Проверка параметров URL
      diagnostics.hasStartApp = urlParams.has('startapp') || urlParams.has('start_app');
      diagnostics.hasStartParam = urlParams.has('start_param');
      diagnostics.urlParamsList = Array.from(urlParams.keys());
      
      // Получаем start_param из initDataUnsafe, если он там есть
      // Используем as any, чтобы обойти проблему с типами
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe as any;
      if (initDataUnsafe && initDataUnsafe.start_param) {
        diagnostics.startParamFromInitData = initDataUnsafe.start_param;
      }
    } else {
      diagnostics.isTelegramAvailable = false;
      diagnostics.isBrowser = true;
    }
    
    return diagnostics;
  }, []);

  // Эффект для инициализации Telegram WebApp
  useEffect(() => {
    const initializeTelegramWebApp = () => {
      try {
        // Соберем информацию о способе запуска
        const diagnostics = detectLaunchMethod();
        console.log('Launch diagnostics:', diagnostics);
        
        // Проверяем, есть ли данные пользователя в URL-параметрах
        const userFromParams = extractUserFromQueryParams();
        if (userFromParams) {
          setExtractedUserId(userFromParams.id);
          setExtractedUsername(userFromParams.username || null);
          console.log('Set user data from URL parameters:', userFromParams);
        }
        
        const telegram = window?.Telegram?.WebApp;
        if (telegram) {
          console.log('Telegram WebApp is available, initializing...');
          
          // Вызываем ready() для активации WebApp
          telegram.ready();
          
          // Логируем информацию об initData и initDataUnsafe
          console.log('Raw initData:', telegram.initData);
          console.log('initData length:', telegram.initData?.length || 0);
          console.log('InitDataUnsafe object:', telegram.initDataUnsafe);
          
          // Если initData отсутствует, но Telegram доступен, это может указывать на проблему
          if (!telegram.initData) {
            console.warn('Telegram WebApp is available but initData is missing!');
            console.warn('This may indicate that the app was not launched properly via Telegram bot');
            
            // Выводим предупреждение для пользователя в режиме разработки
            if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
              alert('Внимание! Приложение запущено без данных инициализации Telegram. Для правильной работы запустите приложение через бота в Telegram.');
            }
          }
          
          // Пытаемся извлечь данные пользователя из initData, если они недоступны в initDataUnsafe
          if (!telegram.initDataUnsafe?.user && telegram.initData) {
            try {
              // Попытка извлечь данные из URL-encoded initData
              const params = new URLSearchParams(telegram.initData);
              if (params.has('user')) {
                const userData = JSON.parse(params.get('user') || '{}');
                console.log('Extracted user data at initialization:', userData);
                
                // Сохраняем извлеченные данные для дальнейшего использования
                if (userData && userData.id) {
                  setExtractedUserId(userData.id);
                  setExtractedUsername(userData.username || null);
                }
              } else {
                // Логируем все параметры для диагностики
                console.log('initData params during initialization:', Array.from(params.entries()));
              }
            } catch (error) {
              console.error('Failed to parse user data from initData during initialization:', error);
            }
          }
          
          // Используем spread оператор для избежания проблем с типами
          setTg({...telegram});
          setIsInitialized(true);
          
          console.log('Telegram WebApp initialized successfully');
          
          // Установка цветов темы Telegram
          document.documentElement.style.setProperty('--tg-theme-bg-color', telegram.backgroundColor);
          document.documentElement.style.setProperty('--tg-theme-text-color', telegram.textColor);
          
          // Используем themeParams для buttonColor и buttonTextColor
          if (telegram.themeParams) {
            document.documentElement.style.setProperty('--tg-theme-button-color', telegram.themeParams.button_color);
            document.documentElement.style.setProperty('--tg-theme-button-text-color', telegram.themeParams.button_text_color);
          }
        } else {
          console.warn('Telegram WebApp is not available');
          
          // Проверяем, запущено ли приложение в среде Telegram
          if (window.location.host.includes('t.me') || /Telegram/i.test(navigator.userAgent)) {
            console.log('App may be running in Telegram but WebApp API is not available');
          }
          
          setIsInitialized(true); // Отмечаем, что инициализация завершена, даже если не удалась
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setIsInitialized(true);
      }
    };

    // Инициализируем Telegram WebApp
    initializeTelegramWebApp();
  }, [detectLaunchMethod]);

  // Эффект для логирования открытия приложения после инициализации
  useEffect(() => {
    // Логируем открытие приложения только когда и Telegram WebApp и система логирования инициализированы
    if (isInitialized && isLoggingInitialized && tg) {
      handleAppOpen();
    }
  }, [isInitialized, isLoggingInitialized, tg, handleAppOpen]);

  // Эффект для логирования закрытия приложения
  useEffect(() => {
    if (!tg) return;
    
    // Логируем закрытие мини-приложения
    const handleBeforeUnload = () => {
      logAppClose({
        closeTime: new Date().toISOString(),
        sessionDuration: Math.floor((Date.now() - (tg.initDataUnsafe?.auth_date || 0) * 1000) / 1000),
        extractedUserId,
        extractedUsername
      }).catch(error => console.error('Failed to log app close:', error));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Очистка обработчика при размонтировании
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tg, logAppClose, extractedUserId, extractedUsername]);

  return (
    <TelegramContext.Provider value={{ tg }}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramProvider; 