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
      className="w-full py-3 px-4 mb-2.5 bg-[rgba(40,40,50,0.8)] backdrop-blur-md text-white border border-white/10 rounded-lg text-left flex items-center gap-2 transition-all hover:bg-[rgba(60,60,70,0.8)] active:scale-[0.98] text-sm shadow-lg"
    >
      {emoji && <span className="text-lg min-w-[24px] flex justify-center">{emoji}</span>}
      <span className="flex-1">{text}</span>
    </button>
  );
};

export default StyledOptionButton; 