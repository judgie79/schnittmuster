import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FaPalette } from 'react-icons/fa';

export const TopBar: React.FC<{ title?: string }> = ({ title = 'Schnittmuster' }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('warm');
    else if (theme === 'warm') setTheme('dark');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-border shadow-sm h-16 flex items-center justify-between px-4">
      <h1 className="text-xl font-bold text-primary truncate">{title}</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-background text-text-muted transition-colors"
        aria-label="Change Theme"
      >
        <FaPalette size={20} />
      </button>
    </header>
  );
};
