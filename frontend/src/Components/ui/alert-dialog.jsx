import React, { createContext, useContext, useState } from 'react';

const AlertDialogContext = createContext();

export function AlertDialog({ open, onOpenChange, children }) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogContent({ className = '', children }) {
  const { open, onOpenChange } = useContext(AlertDialogContext);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className={`
        relative bg-background border border-border rounded-lg shadow-lg p-6 w-full max-w-md mx-4
        ${className}
      `}>
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function AlertDialogTitle({ className = '', children }) {
  return (
    <h2 className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h2>
  );
}

export function AlertDialogDescription({ className = '', children }) {
  return (
    <p className={`text-sm text-muted-foreground mt-2 ${className}`}>
      {children}
    </p>
  );
}

export function AlertDialogFooter({ children }) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      {children}
    </div>
  );
}

export function AlertDialogCancel({ className = '', children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background 
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
        border border-input bg-background hover:bg-accent hover:text-accent-foreground 
        h-10 px-4 py-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({ className = '', children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background 
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
        bg-primary text-primary-foreground hover:bg-primary/90 
        h-10 px-4 py-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
