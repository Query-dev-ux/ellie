import React, { useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { useTelegram } from '../hooks/useTelegram';
import type { UserSettings as UserSettingsType } from '../types/models';

const UserSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const { getCollection, setDocument, addDocument, error: firestoreError } = useFirestore();
  const { user } = useTelegram();

  // Загружаем настройки пользователя из Firestore
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      
      // Запрашиваем настройки текущего пользователя
      getCollection<UserSettingsType>(
        'userSettings',
        [{ field: 'userId', operator: '==', value: user.id }],
        'createdAt',
        'desc',
        1
      )
        .then(results => {
          if (results.length > 0) {
            setSettings(results[0]);
          } else {
            // Если настроек нет, создаем дефолтные
            const defaultSettings: UserSettingsType = {
              userId: user.id,
              username: user.username,
              language: navigator.language.split('-')[0] || 'ru',
              theme: 'system',
              notifications: true,
              lastVisit: new Date().toISOString()
            };
            setSettings(defaultSettings);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user settings:', err);
          setError('Не удалось загрузить настройки');
          setIsLoading(false);
        });
    }
  }, [user, getCollection]);

  // Обработка ошибок Firestore
  useEffect(() => {
    if (firestoreError) {
      setError(`Ошибка доступа к данным: ${firestoreError.message}`);
    }
  }, [firestoreError]);

  // Функция для сохранения настроек
  const saveSettings = async () => {
    if (!settings || !user) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Обновляем дату последнего посещения
      const updatedSettings: UserSettingsType = {
        ...settings,
        lastVisit: new Date().toISOString(),
        userId: user.id,
        username: user.username
      };
      
      let success = false;
      
      // Если у настроек есть ID, обновляем существующий документ
      if (settings.id) {
        success = await setDocument('userSettings', settings.id, updatedSettings);
      } else {
        // Иначе создаем новый документ
        const docId = await addDocument('userSettings', updatedSettings);
        if (docId) {
          setSettings({ ...updatedSettings, id: docId });
          success = true;
        }
      }
      
      if (success) {
        setSaveStatus('success');
        // Сбрасываем статус через 3 секунды
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчики изменения настроек
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (settings) {
      setSettings({ ...settings, theme });
    }
  };
  
  const handleNotificationsChange = (notifications: boolean) => {
    if (settings) {
      setSettings({ ...settings, notifications });
    }
  };
  
  const handleLanguageChange = (language: string) => {
    if (settings) {
      setSettings({ ...settings, language });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка настроек...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Настройки</h2>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Тема</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-4 py-2 rounded ${
                settings?.theme === 'light' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Светлая
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-4 py-2 rounded ${
                settings?.theme === 'dark' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Тёмная
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`px-4 py-2 rounded ${
                settings?.theme === 'system' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Системная
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Язык</label>
          <select
            value={settings?.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={settings?.notifications || false}
              onChange={(e) => handleNotificationsChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
              Уведомления
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Получать уведомления о новых функциях и обновлениях
          </p>
        </div>
        
        {settings?.lastVisit && (
          <div className="text-sm text-gray-500 mb-4">
            Последний вход: {new Date(settings.lastVisit).toLocaleString()}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className={`px-4 py-2 rounded ${
              isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
          
          {saveStatus === 'success' && (
            <span className="text-green-600">Настройки сохранены</span>
          )}
          
          {saveStatus === 'error' && (
            <span className="text-red-600">Ошибка при сохранении</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 