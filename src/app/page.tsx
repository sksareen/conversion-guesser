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
          <p className="mb-2">
            Made with <span className="text-red-500">♥</span> by <a 
              href="https://savarsareen.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              Savar Sareen
            </a>
          </p>
          <p>
            <a 
              href="https://github.com/savarsareen/guess-conversion-game/blob/main/src/data/companies.json" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {/* View Source Data */}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
