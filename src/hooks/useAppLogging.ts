import { useState, useEffect } from 'react';
import { useTelegram } from './useTelegram';

// URL вашего сервиса, который будет записывать в Google Sheets
// Относительный URL для текущего домена - наиболее надежный вариант
const LOG_SERVICE_URL = '/api/logAppEvent';

interface LogEvent {
  event: string;
  userId: number | null;
  username: string | null;
  timestamp: string;
  additionalData?: Record<string, any>;
}

/**
 * Хук для логирования событий в Mini App
 */
export const useAppLogging = () => {
  const { tg, user, initDataStr } = useTelegram();
  const [isLogServiceAvailable, setIsLogServiceAvailable] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Проверим соединение с сервисом логирования при инициализации
  useEffect(() => {
    // Проверка выполняется только в реальной среде Telegram WebApp
    if (tg) {
      console.log('TelegramWebApp initialized, checking log service availability');
      console.log('User data in useAppLogging:', user);
      console.log('InitData available:', !!initDataStr);
      
      // Расширенная диагностика
      if (!user) {
        console.warn('User data not available in WebApp');
        if (initDataStr) {
          console.log('Raw initData available, sample:', 
            initDataStr.length > 100 ? initDataStr.substring(0, 100) + '...' : initDataStr);
          try {
            const params = new URLSearchParams(initDataStr);
            console.log('initData params:', 
              Array.from(params.entries()).map(([key, val]) => `${key}: ${val.length > 50 ? val.substring(0, 50) + '...' : val}`).join(', '));
            
            // Проверяем, есть ли параметр user
            if (params.has('user')) {
              console.log('User param found in initData:', params.get('user'));
            } else {
              console.warn('No user param in initData');
            }
          } catch (error) {
            console.error('Failed to parse initData in useAppLogging hook:', error);
          }
        } else {
          console.warn('No initData available at all');
        }
      }
      
      checkLogServiceAvailability();
    } else {
      console.warn('TelegramWebApp not available');
    }
  }, [tg, user, initDataStr]);

  // Проверка доступности сервиса логирования
  const checkLogServiceAvailability = async () => {
    try {
      // Проверяем доступность сервиса с помощью OPTIONS запроса
      const response = await fetch(LOG_SERVICE_URL, {
        method: 'OPTIONS'
      });
      
      const isAvailable = response.ok;
      console.log(`Log service availability check: ${isAvailable ? 'available' : 'unavailable'}`);
      setIsLogServiceAvailable(isAvailable);
      setIsInitialized(true);
    } catch (error) {
      console.error('Log service availability check failed:', error);
      setIsLogServiceAvailable(false);
      setIsInitialized(true);
    }
  };

  // Функция для определения данных по устройству и стране
  const getDeviceAndCountryInfo = () => {
    // Получаем полный код локали пользователя
    const country = navigator.language || 'unknown';
    
    // Определяем устройство из userAgent
    let device = 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      device = 'iOS';
    } else if (ua.includes('android')) {
      device = 'Android';
    } else if (ua.includes('windows')) {
      device = 'Windows';
    } else if (ua.includes('macintosh') || ua.includes('mac os')) {
      device = 'Mac';
    } else if (ua.includes('linux')) {
      device = 'Linux';
    }
    
    return {
      country,  // Полный код локали (например, "ru-RU")
      device,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  };

  // Функция для получения идентификатора пользователя из URL-параметров
  const getUserInfoFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const username = urlParams.get('username');
    
    return { 
      urlUserId: userId ? parseInt(userId, 10) : null,
      urlUsername: username || null
    };
  };

  // Функция для логирования событий
  const logEvent = async (
    event: string,
    additionalData?: Record<string, any>
  ): Promise<boolean> => {
    if (!isInitialized) {
      console.warn('Logging service not yet initialized');
      return false;
    }
    
    if (!isLogServiceAvailable) {
      console.warn('Logging service is not available');
      return false;
    }

    if (!event) {
      console.error('Event name is required for logging');
      return false;
    }

    try {
      // Получаем информацию об устройстве и стране
      const deviceAndCountryInfo = getDeviceAndCountryInfo();
      
      // Получаем дополнительную информацию из URL-параметров
      const urlUserInfo = getUserInfoFromUrl();
      
      // Определяем реальный идентификатор пользователя
      // Приоритет: 1) Данные из WebApp, 2) Данные из URL-параметров
      const userId = user?.id || urlUserInfo.urlUserId;
      const username = user?.username || urlUserInfo.urlUsername;
      
      // Создаем полные данные для логирования
      const enhancedAdditionalData = {
        ...deviceAndCountryInfo,
        ...additionalData,
        debug: {
          hasUser: !!user,
          userIdType: user?.id ? typeof user.id : 'undefined',
          hasInitData: !!initDataStr,
          initDataLength: initDataStr?.length || 0
        }
      };
      
      // Проверка наличия данных пользователя
      if (!userId && !username && event !== 'app_error') {
        console.warn('User data not available, logging app_error instead');
        return await logEvent('error_app', { 
          originalEvent: event,
          error: 'User data not available',
          additionalData: enhancedAdditionalData 
        });
      }

      const logData: LogEvent = {
        event,
        userId,
        username,
        timestamp: new Date().toISOString(),
        additionalData: enhancedAdditionalData
      };

      console.log('Sending log event:', logData);

      // Отправляем данные на облачную функцию
      const response = await fetch(LOG_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      // Проверка ответа
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Logging failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Log event result:', result);
      
      return true;
    } catch (error) {
      console.error('Failed to log event:', error);
      
      // В случае ошибки пытаемся записать информацию об ошибке локально
      try {
        const errorData = {
          timestamp: new Date().toISOString(),
          event,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        };
        
        // Сохраняем ошибку в localStorage для возможности восстановления
        const errors = JSON.parse(localStorage.getItem('logging_errors') || '[]');
        errors.push(errorData);
        localStorage.setItem('logging_errors', JSON.stringify(errors.slice(-10))); // Храним последние 10 ошибок
      } catch (storageError) {
        console.error('Failed to store error in localStorage:', storageError);
      }
      
      return false;
    }
  };

  // Логирование открытия мини-приложения
  const logAppOpen = async (additionalData?: Record<string, any>): Promise<boolean> => {
    console.log('Logging app_opened event');
    return await logEvent('open_app', additionalData);
  };

  // Логирование закрытия мини-приложения
  const logAppClose = async (additionalData?: Record<string, any>): Promise<boolean> => {
    console.log('Logging app_closed event');
    return await logEvent('close_app', additionalData);
  };

  // Логирование действий пользователя
  const logUserAction = async (
    action: string,
    actionData?: Record<string, any>
  ): Promise<boolean> => {
    console.log(`Logging user action: ${action}`);
    return await logEvent(action, actionData);
  };

  return {
    logEvent,
    logAppOpen,
    logAppClose,
    logUserAction,
    isLogServiceAvailable,
    isInitialized
  };
}; 