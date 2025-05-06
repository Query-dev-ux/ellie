import React from 'react';

type StyledMessageProps = {
  text: string;
  sender: 'ellie' | 'system';
  animate?: boolean;
};

const StyledMessage: React.FC<StyledMessageProps> = ({ text, sender, animate = false }) => {
  return (
    <div className={`mb-3 ${sender === 'ellie' ? 'mr-auto' : 'ml-auto'} max-w-[85%]`}>
      <div 
        className={`
          p-2.5 px-3.5 rounded-xl shadow-md text-sm leading-relaxed
          ${sender === 'ellie' 
            ? 'bg-[rgba(30,30,40,0.8)] text-white border border-white/10' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-500 text-white'}
          ${animate ? 'animate-[fadeIn_0.3s_ease-out_forwards]' : ''}
        `}
      >
        {text.split('\n').map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </div>
    </div>
  );
};

export default StyledMessage; 