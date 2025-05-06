import React from 'react';

interface StyledOptionButtonProps {
  text: string;
  emoji?: string;
  onClick: () => void;
}

const StyledOptionButton: React.FC<StyledOptionButtonProps> = ({ text, emoji, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 px-3.5 mb-2 bg-[rgba(40,40,50,0.6)] backdrop-blur-md text-white border border-white/10 rounded-lg text-left flex items-center gap-2 transition-all hover:bg-[rgba(60,60,70,0.6)] active:scale-[0.98] text-sm"
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      <span className="flex-1">{text}</span>
    </button>
  );
};

export default StyledOptionButton; 