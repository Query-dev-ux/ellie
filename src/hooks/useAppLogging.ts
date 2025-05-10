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

  // Проверим соединение с сервисом логирования при инициализации
  useEffect(() => {
    // Проверка выполняется только в реальной среде Telegram WebApp
    if (tg) {
      checkLogServiceAvailability();
    }
  }, [tg]);

  // Проверка доступности сервиса логирования
  const checkLogServiceAvailability = async () => {
    try {
      // Отправляем ping запрос (можно закомментировать, если не нужно)
      // const response = await fetch(`${LOG_SERVICE_URL}/ping`);
      // setIsLogServiceAvailable(response.ok);
      
      // Для начальной настройки просто устанавливаем true
      setIsLogServiceAvailable(true);
    } catch (error) {
      console.error('Log service availability check failed:', error);
      setIsLogServiceAvailable(false);
    }
  };

  // Функция для логирования событий
  const logEvent = async (
    event: string,
    additionalData?: Record<string, any>
  ): Promise<boolean> => {
    if (!isLogServiceAvailable) {
      console.warn('Log service is not available');
      return false;
    }

    try {
      const logData: LogEvent = {
        event,
        userId: user?.id || null,
        username: user?.username || null,
        timestamp: new Date().toISOString(),
        additionalData
      };

      console.log('Logging event:', logData);

      // Вместо прямой записи в Google Sheets, отправляем данные на облачную функцию
      const response = await fetch(LOG_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        throw new Error(`Logging failed with status ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to log event:', error);
      return false;
    }
  };

  // Логирование открытия мини-приложения
  const logAppOpen = async (additionalData?: Record<string, any>): Promise<boolean> => {
    return await logEvent('app_opened', additionalData);
  };

  // Логирование закрытия мини-приложения
  const logAppClose = async (additionalData?: Record<string, any>): Promise<boolean> => {
    return await logEvent('app_closed', additionalData);
  };

  // Логирование действий пользователя
  const logUserAction = async (
    action: string,
    actionData?: Record<string, any>
  ): Promise<boolean> => {
    return await logEvent(`user_action:${action}`, actionData);
  };

  return {
    logEvent,
    logAppOpen,
    logAppClose,
    logUserAction,
    isLogServiceAvailable
  };
}; 