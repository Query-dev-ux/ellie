import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import FlirtGame from './components/FlirtGame'
import StatsDisplay from './components/StatsDisplay'
import UserSettings from './components/UserSettings'
import UrlParamsDebug from './components/UrlParamsDebug'
import TelegramProvider from './components/TelegramProvider'
import './index.css'

// Компонент с навигацией
const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'stats' | 'settings' | 'debug'>('game');
  const navigate = useNavigate();
  
  const handleTabChange = (tab: 'game' | 'stats' | 'settings' | 'debug') => {
    setActiveTab(tab);
    navigate(`/${tab === 'game' ? '' : tab}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<FlirtGame />} />
          <Route path="/stats" element={<StatsDisplay />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/debug" element={<UrlParamsDebug />} />
        </Routes>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <button 
            onClick={() => handleTabChange('game')}
            className={`flex flex-col items-center ${activeTab === 'game' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-2xl">🎮</span>
            <span className="text-xs mt-1">Игра</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('stats')}
            className={`flex flex-col items-center ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs mt-1">Статистика</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('settings')}
            className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs mt-1">Настройки</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('debug')}
            className={`flex flex-col items-center ${activeTab === 'debug' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-2xl">🛠️</span>
            <span className="text-xs mt-1">Отладка</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TelegramProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TelegramProvider>
  </React.StrictMode>,
) 