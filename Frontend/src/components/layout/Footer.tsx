import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-yc-border py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-yc-text-secondary">
        <div className="flex items-center gap-2">
          
          
    
          <span>© {new Date().getFullYear()} AUTO-JOB-APPLY</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-yc-text transition-colors">
            Overview
          </Link>
          
          
          <span className="text-[11px] text-yc-text-muted">Production Build</span>
        </div>
      </div>
    </footer>
  );
};

