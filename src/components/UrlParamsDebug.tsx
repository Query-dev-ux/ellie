import React from 'react';
import { useTelegram } from '../hooks/useTelegram';

/**
 * Компонент для отладки URL-параметров и данных пользователя.
 * Полезен для проверки, что все параметры корректно извлекаются и используются.
 */
const UrlParamsDebug: React.FC = () => {
  const { user, urlParams, tg } = useTelegram();

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Параметры отладки</h2>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-bold mb-2">URL параметры</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
          {JSON.stringify({ 
            userId: urlParams.userId,
            username: urlParams.username,
            country: urlParams.country,
            device: urlParams.device,
            source: urlParams.source,
            actionsCount: urlParams.actions?.length || 0
          }, null, 2)}
        </pre>
        
        {urlParams.actions && urlParams.actions.length > 0 && (
          <>
            <h4 className="text-md font-bold mt-4 mb-2">Действия пользователя</h4>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(urlParams.actions, null, 2)}
            </pre>
          </>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-bold mb-2">Данные пользователя</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-bold mb-2">Статус Telegram WebApp</h3>
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${tg ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{tg ? 'Доступен' : 'Недоступен'}</span>
        </div>
        {tg && (
          <div className="text-sm">
            <div>Версия: {tg.version || 'не указана'}</div>
            <div>Цвет фона: {tg.backgroundColor || 'не указан'}</div>
            <div>Цвет текста: {tg.textColor || 'не указан'}</div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-2">Информация о системе</h3>
        <div className="text-sm">
          <div>User Agent: {navigator.userAgent}</div>
          <div>Платформа: {navigator.platform}</div>
          <div>Язык: {navigator.language}</div>
          <div>URL: {window.location.href}</div>
        </div>
      </div>
    </div>
  );
};

export default UrlParamsDebug; 