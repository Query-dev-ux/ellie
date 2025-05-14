import React, { useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { useTelegram } from '../hooks/useTelegram';
import type { GameResult } from '../types/models';

const StatsDisplay: React.FC = () => {
  const [userStats, setUserStats] = useState<GameResult[]>([]);
  const [topScores, setTopScores] = useState<{ username: string; score: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getCollection, loading, error: firestoreError } = useFirestore();
  const { user } = useTelegram();

  // Загружаем статистику пользователя из Firestore
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      
      // Запрашиваем результаты игр текущего пользователя
      getCollection<GameResult>(
        'gameResults',
        [{ field: 'userId', operator: '==', value: user.id }],
        'createdAt',
        'desc',
        5
      )
        .then(results => {
          setUserStats(results);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user stats:', err);
          setError('Не удалось загрузить вашу статистику');
          setIsLoading(false);
        });
      
      // Запрашиваем топ результатов
      getCollection<GameResult>(
        'gameResults',
        [],
        'totalScore',
        'desc',
        10
      )
        .then(results => {
          const formattedTopScores = results.map(result => ({
            username: result.username || 'Неизвестный',
            score: result.totalScore
          }));
          
          setTopScores(formattedTopScores);
        })
        .catch(err => {
          console.error('Error fetching top scores:', err);
        });
    }
  }, [user, getCollection]);

  // Обработка ошибок Firestore
  useEffect(() => {
    if (firestoreError) {
      setError(`Ошибка доступа к данным: ${firestoreError.message}`);
    }
  }, [firestoreError]);

  // Вычисляем средний балл пользователя
  const averageScore = userStats.length > 0
    ? userStats.reduce((sum, game) => sum + game.totalScore, 0) / userStats.length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка статистики...</p>
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
      <h2 className="text-xl font-bold mb-4">Ваша статистика</h2>
      
      {userStats.length === 0 ? (
        <p className="text-gray-600 mb-6">У вас пока нет завершенных игр</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Количество игр:</span>
              <span>{userStats.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Средний балл:</span>
              <span>{averageScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Лучший результат:</span>
              <span className="font-semibold text-green-600">
                {Math.max(...userStats.map(game => game.totalScore))}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-2">Ваши последние игры</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Дата</th>
                  <th className="py-2 px-3 text-left">Счет</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((game, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-2 px-3">
                      {game.createdAt 
                        ? new Date(game.createdAt).toLocaleDateString() 
                        : 'Нет данных'}
                    </td>
                    <td className="py-2 px-3 font-medium">{game.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 className="text-lg font-bold mb-2">Лучшие результаты</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left">#</th>
              <th className="py-2 px-3 text-left">Пользователь</th>
              <th className="py-2 px-3 text-left">Счет</th>
            </tr>
          </thead>
          <tbody>
            {topScores.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-3 text-center text-gray-500">
                  Нет данных
                </td>
              </tr>
            ) : (
              topScores.map((score, index) => (
                <tr key={index} className={`border-t border-gray-200 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                  <td className="py-2 px-3 font-bold">{index + 1}</td>
                  <td className="py-2 px-3">
                    {score.username}
                    {user?.username === score.username && " (вы)"}
                  </td>
                  <td className="py-2 px-3 font-medium">{score.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsDisplay; 