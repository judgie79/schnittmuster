import React from 'react';

export const TopBar: React.FC<{ title?: string }> = ({ title = 'Schnittmuster' }) => {

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-border shadow-sm h-16 flex items-center justify-between px-4">
      <h1 className="text-xl font-bold text-primary truncate">{title}</h1>
    </header>
  );
};
