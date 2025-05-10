import React, { useEffect, useState, useCallback } from 'react';
import type { TelegramWebApp } from '../types/telegram';
import { useAppLogging } from '../hooks/useAppLogging';

type TelegramProviderProps = {
  children: React.ReactNode;
};

export const TelegramContext = React.createContext<{
  tg: TelegramWebApp | null;
}>({ tg: null });

const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { logAppOpen, logAppClose, isInitialized: isLoggingInitialized } = useAppLogging();

  // Функция для логирования открытия приложения
  const handleAppOpen = useCallback(async () => {
    if (!tg) {
      console.warn('Cannot log app_open: Telegram WebApp is not available');
      return;
    }
    
    console.log('Logging app open with user data:', {
      userId: tg.initDataUnsafe?.user?.id,
      username: tg.initDataUnsafe?.user?.username
    });
    
    try {
      await logAppOpen({
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        telegramTheme: tg.themeParams ? { ...tg.themeParams } : 'not_available',
        version: tg.version || 'unknown'
      });
      console.log('App open logged successfully');
    } catch (error) {
      console.error('Failed to log app open:', error);
    }
  }, [tg, logAppOpen]);

  // Эффект для инициализации Telegram WebApp
  useEffect(() => {
    const initializeTelegramWebApp = () => {
      try {
        const telegram = window?.Telegram?.WebApp;
        if (telegram) {
          console.log('Telegram WebApp is available, initializing...');
          
          // Вызываем ready() для активации WebApp
          telegram.ready();
          
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
          setIsInitialized(true); // Отмечаем, что инициализация завершена, даже если не удалась
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setIsInitialized(true);
      }
    };

    // Инициализируем Telegram WebApp
    initializeTelegramWebApp();
  }, []);

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
        sessionDuration: Math.floor((Date.now() - (tg.initDataUnsafe?.auth_date || 0) * 1000) / 1000)
      }).catch(error => console.error('Failed to log app close:', error));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Очистка обработчика при размонтировании
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tg, logAppClose]);

  return (
    <TelegramContext.Provider value={{ tg }}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramProvider; 