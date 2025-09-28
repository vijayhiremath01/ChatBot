import React from 'react';
import { Button } from '@/components/ui/button';

export default function SearchButton({ onClick, className = '' }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`w-10 h-10 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] ${className}`}
    >
      <div className="flex flex-col justify-center items-center gap-1.5">
        <div className="w-5 h-0.5 bg-current rounded-full"></div>
        <div className="w-5 h-0.5 bg-current rounded-full"></div>
        <div className="w-5 h-0.5 bg-current rounded-full"></div>
      </div>
    </Button>
  );
};