import { useState, useEffect } from 'react';
import type { UserAction } from '../types/models';

interface UrlParams {
  userId: string;
  username?: string;
  country?: string;
  device?: string;
  source?: string;
  actions: UserAction[];
}

/**
 * Хук для получения параметров из URL.
 * 
 * Параметры именуются с префиксами (a_, b_, c_, и т.д.), 
 * но возвращаются уже без префиксов для удобства использования.
 */
export const useUrlParams = (): UrlParams => {
  const [params, setParams] = useState<UrlParams>({
    userId: '',
    actions: []
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Извлекаем параметры из URL
    const userId = urlParams.get('a_userId') || '';
    const username = urlParams.get('b_username') || undefined;
    const country = urlParams.get('c_country') || undefined;
    const device = urlParams.get('d_device') || undefined;
    const source = urlParams.get('e_source') || undefined;
    
    // Пытаемся получить и распарсить действия пользователя
    let actions: UserAction[] = [];
    try {
      const actionsParam = urlParams.get('f_actions');
      if (actionsParam) {
        actions = JSON.parse(decodeURIComponent(actionsParam));
      }
    } catch (error) {
      console.error('Failed to parse user actions:', error);
    }

    // Если userId отсутствует, пытаемся получить его из localStorage
    // (может быть полезно для тестирования или повторного запуска приложения)
    if (!userId) {
      const storedParams = localStorage.getItem('app_url_params');
      if (storedParams) {
        try {
          const parsedParams = JSON.parse(storedParams) as UrlParams;
          if (parsedParams.userId) {
            setParams(parsedParams);
            return;
          }
        } catch (e) {
          console.error('Failed to parse stored params:', e);
        }
      }
    }

    const newParams: UrlParams = {
      userId,
      username,
      country,
      device,
      source,
      actions
    };

    // Сохраняем параметры в состоянии
    setParams(newParams);
    
    // Сохраняем параметры в localStorage для возможного использования при перезагрузке
    if (userId) {
      localStorage.setItem('app_url_params', JSON.stringify(newParams));
    }
  }, []);

  return params;
}; 