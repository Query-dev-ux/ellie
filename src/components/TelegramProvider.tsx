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
    
    try {
      await logAppOpen({
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        telegramTheme: tg.themeParams ? { ...tg.themeParams } : 'not_available',
        version: tg.version || 'unknown',
        // Используем извлеченные данные, если доступны
        extractedUserId: userData?.id || extractedUserId,
        extractedUsername: userData?.username || extractedUsername,
        // Сохраняем информацию о состоянии initData
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        userDataStatus: tg.initDataUnsafe?.user ? 'available' : 'unavailable',
        rawInitDataSample: tg.initData ? (tg.initData.length > 50 ? tg.initData.substring(0, 50) + '...' : tg.initData) : null
      });
      console.log('App open logged successfully');
    } catch (error) {
      console.error('Failed to log app open:', error);
    }
  }, [tg, logAppOpen, extractedUserId, extractedUsername]);

  // Эффект для инициализации Telegram WebApp
  useEffect(() => {
    const initializeTelegramWebApp = () => {
      try {
        const telegram = window?.Telegram?.WebApp;
        if (telegram) {
          console.log('Telegram WebApp is available, initializing...');
          
          // Вызываем ready() для активации WebApp
          telegram.ready();
          
          // Логируем информацию об initData и initDataUnsafe
          console.log('Raw initData:', telegram.initData);
          console.log('initData length:', telegram.initData?.length || 0);
          console.log('InitDataUnsafe object:', telegram.initDataUnsafe);
          
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