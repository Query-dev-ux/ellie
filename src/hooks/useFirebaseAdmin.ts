import { useState } from 'react';

// Базовый URL для Worker API (обновлено с фактическим URL после деплоя)
const API_BASE_URL = 'https://ellie.query-dclxv1.workers.dev';

export interface FirebaseAdminResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useFirebaseAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Получить данные пользователя из Firestore через Worker API
   */
  const getUserData = async <T = any>(userId: string): Promise<FirebaseAdminResult<T>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Произошла ошибка при получении данных пользователя');
      }

      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.message || 'Произошла ошибка при взаимодействии с API';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Сохранить данные пользователя в Firestore через Worker API
   */
  const saveUserData = async <T = any>(userId: string, userData: T): Promise<FirebaseAdminResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Произошла ошибка при сохранении данных пользователя');
      }

      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.message || 'Произошла ошибка при взаимодействии с API';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    loading,
    error,
    getUserData,
    saveUserData
  };
}; 