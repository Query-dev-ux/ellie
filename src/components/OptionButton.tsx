import React from 'react';

type OptionButtonProps = {
  text: string;
  onClick: () => void;
  emoji?: string;
};

const OptionButton: React.FC<OptionButtonProps> = ({ text, onClick, emoji }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-4 mb-3 rounded-xl flex items-center text-lg font-medium shadow-md bg-gradient-to-r from-pink-200 via-blue-100 to-purple-100 hover:from-pink-300 hover:to-blue-200 transition-all border-2 border-transparent hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
    >
      {emoji && <span className="mr-3 text-2xl">{emoji}</span>}
      <span>{text}</span>
    </button>
  );
};

export default OptionButton; 