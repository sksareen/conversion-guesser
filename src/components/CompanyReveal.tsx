'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyRevealProps {
  company: {
    company: string;
    funnel: string;
    conversion: number;
    logo: string;
    brandColor: string;
    description: string;
  };
  guess: number;
  onContinue: () => void;
}

export default function CompanyReveal({ company, guess, onContinue }: CompanyRevealProps) {
  const [revealStage, setRevealStage] = useState(0);
  const errorMargin = Math.abs(guess - company.conversion);

  // Skip automatic progression after the first stage to show company name right away
  useEffect(() => {
    // Only auto-advance from stage 0 to 1
    if (revealStage === 0) {
      const timer = setTimeout(() => {
        setRevealStage(1);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [revealStage]);

  // Get feedback based on error margin
  const getFeedback = () => {
    if (errorMargin <= 5) return { emoji: '🎯', text: 'Excellent guess!', color: 'text-green-600' };
    if (errorMargin <= 15) return { emoji: '👍', text: 'Good guess!', color: 'text-yellow-600' };
    return { emoji: '🤔', text: 'Room for improvement', color: 'text-red-600' };
  };

  const feedback = getFeedback();
  
  // Handle manual progression
  const nextStage = () => {
    if (revealStage < 2) {
      setRevealStage(prevStage => prevStage + 1);
    } else {
      // If we're at the final stage, go to next company
      onContinue();
    }
  };
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-lg min-h-[400px] sm:min-h-[500px]">
      <AnimatePresence mode="wait">
        {/* Stage 0: Initial guess submission */}
        {revealStage === 0 && (
          <motion.div 
            key="stage0"
            className="absolute inset-0 flex items-center justify-center p-8 bg-gray-100"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Processing your guess...</h2>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </motion.div>
        )}
        
        {/* Stage 1: Show company name and error amount */}
        {revealStage === 1 && (
          <motion.div 
            key="stage1"
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: company.brandColor + '10' }}
          >
            <div className="flex items-center mb-6">
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={company.logo || "/favicon.svg"}
                  alt={company.company}
                  width={64}
                  height={64}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    // @ts-ignore
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/favicon.svg';
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{company.company}</h2>
                <p className="text-gray-600 text-sm">{company.funnel}</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-80 rounded-lg p-6 mb-4 text-center">
              <h3 className="text-xl font-medium mb-3">Your Results</h3>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Your guess</p>
                  <p className="text-xl font-bold">{guess.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actual</p>
                  <p className="text-xl font-bold" style={{ color: company.brandColor }}>
                    {company.conversion.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Error</p>
                  <p className={`text-xl font-bold ${feedback.color}`}>
                    {errorMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
              <p className="text-lg">
                {feedback.emoji} {feedback.text}
              </p>
            </div>
            
            <button 
              className="btn-primary w-full mt-4 py-4 text-lg flex items-center justify-center"
              onClick={nextStage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
              </svg>
              Show More Details
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Click to see company information and sources
            </p>
          </motion.div>
        )}
        
        {/* Stage 2: Full stats with continue button */}
        {revealStage === 2 && (
          <motion.div 
            key="stage2"
            className="absolute inset-0 flex flex-col p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: company.brandColor + '10' }}
          >
            <div className="flex items-center mb-4">
              <div className="relative w-16 h-16 mr-4">
                <Image
                  src={company.logo || "/favicon.svg"}
                  alt={company.company}
                  width={64}
                  height={64}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    // @ts-ignore 
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/favicon.svg';
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{company.company}</h2>
                <p className="text-gray-600">{company.funnel}</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-80 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Your guess</p>
                  <p className="text-lg font-bold">{guess.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Actual conversion</p>
                  <p className="text-lg font-bold" style={{ color: company.brandColor }}>
                    {company.conversion.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full flex items-center justify-center text-xs text-white font-bold"
                  style={{ 
                    width: `${company.conversion}%`, 
                    backgroundColor: company.brandColor,
                    maxWidth: '100%'
                  }}
                >
                  {company.conversion > 5 ? `${company.conversion}%` : ''}
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-80 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">{company.description}</p>
              {company.sourceURL && (
                <a 
                  href={company.sourceURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm mt-2 inline-block hover:underline"
                  style={{ color: company.brandColor }}
                >
                  Source: View citation →
                </a>
              )}
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="flex flex-col gap-4">
              <button
                className="w-full py-4 rounded-lg text-white text-lg font-medium transition-transform active:scale-95 flex items-center justify-center"
                style={{ backgroundColor: company.brandColor }}
                onClick={onContinue}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="flex-1">Next Question</span>
                <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-gray-800 bg-white bg-opacity-30 border border-white border-opacity-30 rounded-md">N</kbd>
              </button>
              <p className="text-center text-sm text-gray-500">
                Click the button above to continue to the next company
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}