import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Черный заблюренный фон */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-0" />
      
      {/* Отдаленное фото девушки с закругленными краями */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[70%] max-w-[400px] max-h-[550px] rounded-3xl overflow-hidden shadow-xl z-10">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{backgroundImage: 'url(/images/ellie.png)'}}
        />
      </div>
      
      {/* Название "Ellie" над фото */}
      <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-30 bg-[rgba(30,30,40,0.8)] backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-lg border border-white/10">
        <p className="text-white text-xl font-semibold m-0 text-center [text-shadow:0_0_4px_rgba(255,255,255,0.4)]">
          <span className="text-pink-300">Ellie✨</span>
        </p>
      </div>
      
      {/* Затемненный блок внизу с закругленными краями */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[85%] max-w-[400px] bg-[rgba(30,30,40,0.8)] backdrop-blur-md p-5 pb-6 z-20 shadow-xl rounded-3xl border border-white/10">
        <p className="text-white text-lg font-medium mb-4 [text-shadow:0_0_4px_rgba(255,255,255,0.4)]">
          Твоя <span className="text-pink-300">AI-подруга</span>: умная, красивая и всегда на связи
        </p>
        
        <button 
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white border-none rounded-2xl text-base font-bold cursor-pointer shadow-lg transition-all duration-200 hover:opacity-90"
        >
          Начать чат
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen; 