import { useState, useEffect } from 'react';
import { useFirebaseAdmin } from '../hooks/useFirebaseAdmin';
import { useTelegram } from '../hooks/useTelegram';

interface UserData {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  dateCreated?: string;
  lastActivity?: string;
  [key: string]: any;
}

export default function AdminDataDemo() {
  const { user, urlParams } = useTelegram();
  const { loading, error, getUserData, saveUserData } = useFirebaseAdmin();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Получаем ID пользователя из параметров URL или из объекта пользователя
  const userId = urlParams?.userId || user?.id?.toString() || '';

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Функция для загрузки данных пользователя
  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const result = await getUserData<UserData>(userId);
      if (result.success && result.data) {
        setUserData(result.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных пользователя:', err);
    }
  };

  // Функция для обновления данных пользователя
  const handleUpdateUserData = async () => {
    if (!userId || !userData) return;

    setUpdateMessage(null);

    // Обновляем lastActivity
    const updatedData = {
      ...userData,
      lastActivity: new Date().toISOString()
    };

    try {
      const result = await saveUserData(userId, updatedData);
      if (result.success) {
        setUserData(updatedData);
        setUpdateMessage('Данные пользователя успешно обновлены!');
      } else {
        setUpdateMessage(`Ошибка: ${result.error}`);
      }
    } catch (err) {
      console.error('Ошибка при обновлении данных пользователя:', err);
      setUpdateMessage('Произошла ошибка при обновлении данных');
    }
  };

  if (!userId) {
    return <div className="p-4">ID пользователя не найден</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Данные пользователя (Admin API)</h2>
      
      {loading && <div className="mb-4">Загрузка данных...</div>}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          Ошибка: {error}
        </div>
      )}
      
      {updateMessage && (
        <div className={`mb-4 p-2 rounded ${
          updateMessage.includes('Ошибка') 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {updateMessage}
        </div>
      )}
      
      {userData && (
        <div className="mb-4 p-3 border rounded">
          <div><strong>ID:</strong> {userId}</div>
          <div><strong>Имя:</strong> {userData.name || 'Не указано'}</div>
          <div><strong>Username:</strong> {userData.username || 'Не указано'}</div>
          <div><strong>Email:</strong> {userData.email || 'Не указано'}</div>
          <div><strong>Дата создания:</strong> {
            userData.dateCreated 
              ? new Date(userData.dateCreated).toLocaleString() 
              : 'Не указано'
          }</div>
          <div><strong>Последняя активность:</strong> {
            userData.lastActivity 
              ? new Date(userData.lastActivity).toLocaleString() 
              : 'Не указано'
          }</div>
        </div>
      )}
      
      <button
        onClick={handleUpdateUserData}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Обновить последнюю активность
      </button>
    </div>
  );
} 