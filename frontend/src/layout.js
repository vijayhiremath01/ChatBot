import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#495057] text-white">
      <style>{`
        :root {
          --bg-primary: #495057;
          --bg-secondary: #3a4046;
          --bg-tertiary: #2d3235;
          --bg-hover: #343a3f;
          --border-color: #4a5055;
          --text-primary: #fff;
          --text-secondary: #ced4da;
          --text-muted: #9ca3af;
          --accent: #495057;
          --accent-hover: #3a4046;
          --accent-light: #ced4da;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #4a5055 #3a4046;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #3a4046;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4a5055;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #5a6055;
        }
      `}</style>
      {children}
    </div>
  );
}