'use client';

import { useEffect } from 'react';
import FunnelCard from '@/components/FunnelCard';
import ScoreTable from '@/components/ScoreTable';
import WelcomeDialog from '@/components/WelcomeDialog';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <WelcomeDialog />
      
      <div className="w-full max-w-xl px-4">
        <h1 className="text-3xl font-bold text-center text-primary mb-8 pb-2 border-b border-gray-200">Guess the Conversion</h1>
        
        <FunnelCard />
        
        <ScoreTable />
        
        <footer className="text-center text-sm text-gray-500 mt-12 mb-6">
          <p>
            Made with <span className="text-red-500">♥</span> by <a 
              href="https://savarsareen.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              Savar Sareen
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
