import React, { useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { tg } = useTelegram();

  // Эффект для расширения окна при загрузке приветственного экрана
  useEffect(() => {
    if (tg) {
      tg.expand();
    }
  }, [tg]);

  return (
    <div className="flex flex-col h-[100dvh] w-full relative overflow-hidden flex-shrink-0 flex-grow-0">
      {/* Черный заблюренный фон */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-0" />
      
      {/* Название "Ellie" над фото */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-[rgba(30,30,40,0.8)] backdrop-blur-md px-5 py-2 rounded-xl shadow-lg border border-white/10">
        <p className="text-white text-lg font-semibold m-0 text-center [text-shadow:0_0_4px_rgba(255,255,255,0.4)]">
          <span className="text-pink-300">Ellie✨</span>
        </p>
      </div>
      
      {/* Отдаленное фото девушки с закругленными краями */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] max-w-[350px] max-h-[450px] rounded-2xl overflow-hidden shadow-xl z-10">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{backgroundImage: 'url(/images/ellie.png)'}}
        />
      </div>
      
      {/* Затемненный блок внизу с закругленными краями */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[80%] max-w-[350px] bg-[rgba(30,30,40,0.8)] backdrop-blur-md p-4 pb-5 z-20 shadow-xl rounded-xl border border-white/10">
        <p className="text-white text-base font-medium mb-3 [text-shadow:0_0_4px_rgba(255,255,255,0.4)]">
          Твоя <span className="text-pink-300">AI-подруга</span>: умная, красивая и всегда на связи
        </p>
        
        <button 
          onClick={onStart}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-lg transition-all duration-200 hover:opacity-90"
        >
          Начать чат
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen; 