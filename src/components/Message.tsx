import React from 'react';

type MessageProps = {
  text: string;
  sender: 'ellie' | 'system';
  animate?: boolean;
};

const Message: React.FC<MessageProps> = ({ text, sender, animate = false }) => {
  return (
    <div className={`mb-4 ${sender === 'ellie' ? 'mr-auto' : 'mx-auto text-center'}`}>
      <div 
        className={`
          p-3 px-4 inline-block max-w-[85%] shadow-md text-base leading-relaxed
          ${animate ? 'animate-fadeIn' : ''}
        `}
      >
        {text.split('\n').map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </div>
    </div>
  );
};

export default Message; 