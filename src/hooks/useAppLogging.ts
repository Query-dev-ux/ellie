import { useState, useEffect } from 'react';
import { useTelegram } from './useTelegram';

// URL вашего сервиса, который будет записывать в Google Sheets
// URL для Cloudflare Worker
const LOG_SERVICE_URL = 'https://ellie.query-dclxv1.workers.dev/api/logAppEvent';
// Для тестирования можно использовать любой сервис, который покажет полученные данные
// например: 'https://webhook.site/your-unique-id'

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
  const { tg, user } = useTelegram();
  const [isLogServiceAvailable, setIsLogServiceAvailable] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Проверим соединение с сервисом логирования при инициализации
  useEffect(() => {
    // Проверка выполняется только в реальной среде Telegram WebApp
    if (tg) {
      console.log('TelegramWebApp initialized, checking log service availability');
      checkLogServiceAvailability();
    } else {
      console.warn('TelegramWebApp not available');
    }
  }, [tg]);

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
      // Проверка наличия данных пользователя
      if (!user && event !== 'app_error') {
        console.warn('User data not available, logging app_error instead');
        return await logEvent('app_error', { 
          originalEvent: event,
          error: 'User data not available',
          additionalData 
        });
      }

      const logData: LogEvent = {
        event,
        userId: user?.id || null,
        username: user?.username || null,
        timestamp: new Date().toISOString(),
        additionalData: {
          ...additionalData,
          userAgent: navigator.userAgent
        }
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
    return await logEvent('app_opened', additionalData);
  };

  // Логирование закрытия мини-приложения
  const logAppClose = async (additionalData?: Record<string, any>): Promise<boolean> => {
    console.log('Logging app_closed event');
    return await logEvent('app_closed', additionalData);
  };

  // Логирование действий пользователя
  const logUserAction = async (
    action: string,
    actionData?: Record<string, any>
  ): Promise<boolean> => {
    console.log(`Logging user action: ${action}`);
    return await logEvent(`user_action:${action}`, actionData);
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