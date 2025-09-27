import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SearchButton({ onClick, className = '' }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`w-10 h-10 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] ${className}`}
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
};