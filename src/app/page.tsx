'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import TelegramProvider from '../components/TelegramProvider';

// Динамический импорт компонента игры, чтобы избежать ошибок SSR с Telegram WebApp
const FlirtGame = dynamic(() => import('../components/FlirtGame'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-screen">Загрузка...</div>,
});

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Добавляем скрипт Telegram WebApp
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    document.head.appendChild(script);

    setIsMounted(true);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (!isMounted) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  return (
    <TelegramProvider>
      <main className="min-h-screen">
        <FlirtGame />
      </main>
    </TelegramProvider>
  );
}
