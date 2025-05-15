import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
}) => {
  const baseClasses = 'py-2 px-4 rounded-lg font-medium transition-all duration-200 text-center';
  const variantClasses = {
    primary: 'bg-[var(--tg-theme-button-color,#2481cc)] text-[var(--tg-theme-button-text-color,white)] hover:opacity-90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button; 