'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/posthog';
import { useGameStore } from '@/lib/store';

interface CompanyRevealProps {
  company: {
    company: string;
    funnel: string;
    conversion: number;
    logo: string;
    brandColor: string;
    description: string;
    sourceURL?: string;
  };
  guess: number;
  onContinue: () => void;
}

export default function CompanyReveal({ company, guess, onContinue }: CompanyRevealProps) {
  const [revealStage, setRevealStage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const errorMargin = Math.abs(guess - company.conversion);
  const { totalPoints, lastPoints } = useGameStore();

  // Skip automatic progression after the first stage to show company name right away
  useEffect(() => {
    // Only auto-advance from stage 0 to 1
    if (revealStage === 0) {
      const timer = setTimeout(() => {
        setRevealStage(1);
        
        // Track reveal stage transition
        trackEvent('company_revealed', {
          company: company.company,
          guess: guess,
          actual: company.conversion,
          errorMargin: errorMargin,
          feedback: getFeedback().text,
          pointsEarned: lastPoints
        });
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [revealStage, company, guess, errorMargin, lastPoints]);

  // Get feedback based on error margin
  const getFeedback = () => {
    if (errorMargin <= 2) return { emoji: '🎯', text: 'Perfect!', color: 'text-green-600', bucket: '🟩' };
    if (errorMargin <= 5) return { emoji: '✨', text: 'Excellent!', color: 'text-green-600', bucket: '🟩' };
    if (errorMargin <= 10) return { emoji: '👍', text: 'Good!', color: 'text-yellow-600', bucket: '🟨' };
    if (errorMargin <= 15) return { emoji: '😊', text: 'Not bad', color: 'text-yellow-500', bucket: '🟨' };
    return { emoji: '🤔', text: 'Try again', color: 'text-red-600', bucket: '⬜' };
  };

  const feedback = getFeedback();
  
  // Handle the next question with debounce to prevent double transitions
  const handleNextQuestion = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Track next question click
    trackEvent('next_question_clicked', {
      fromCompany: company.company
    });
    
    onContinue();
    // Reset after transition completes
    setTimeout(() => setIsTransitioning(false), 200);
  };
  
  return (
    <div className="flex flex-col items-center py-12">
      <AnimatePresence mode="wait">
        {/* Stage 0: Initial guess submission */}
        {revealStage === 0 && (
          <motion.div 
            key="stage0"
            className="flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}
        
        {/* Stage 1: Result */}
        {revealStage === 1 && (
          <motion.div 
            key="stage1"
            className="flex flex-col items-center w-full max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-32 h-32 mb-6">
              <Image
                src={`${company.logo}`}
                alt={company.company}
                width={128}
                height={128}
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  // @ts-ignore
                  e.currentTarget.onerror = null;
                  
                  // Try alternate extensions if the original path fails
                  const originalSrc = e.currentTarget.src;
                  const basePath = `${company.logo}`;
                  
                  // Try different extensions
                  if (!originalSrc.includes('.jpg')) {
                    e.currentTarget.src = `${basePath}.jpg`;
                    return;
                  }
                  
                  if (!originalSrc.includes('.png')) {
                    e.currentTarget.src = `${basePath}.png`;
                    return;
                  }
                  
                  if (!originalSrc.includes('.svg')) {
                    e.currentTarget.src = `${basePath}.svg`;
                    return;
                  }
                  
                  // Fallback to favicon if all else fails
                  e.currentTarget.src = '/favicon.png';
                  
                  // Track image error
                  trackEvent('logo_load_error', {
                    company: company.company,
                    originalSrc
                  });
                }}
              />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-center">{company.company}</h2>
            
            {(() => {
              const parts = company.funnel.split(/\s+to\s+/i);
              if (parts.length === 2) {
                return (
                  <div className="flex items-center text-lg mb-6">
                    <div className="bg-gray-100 px-3 py-1 rounded-lg font-medium text-gray-700">
                      {parts[0]}
                    </div>
                    <div className="mx-2 flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-lg font-medium text-gray-700">
                      {parts[1]}
                    </div>
                  </div>
                );
              }
              return (
                <p className="text-lg text-gray-600 mb-6 text-center">{company.funnel}</p>
              );
            })()}
            
            <div className="flex flex-col items-center w-full mb-10">
              <div className="text-5xl mb-4">{feedback.bucket}</div>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-5">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Your guess</p>
                  <p className="text-3xl font-bold">{guess.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Actual</p>
                  <p className="text-3xl font-bold">{company.conversion.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="w-full mb-4">
                <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mb-3">
                  <span className="font-semibold">Error</span>
                  <span className={`text-xl font-bold ${feedback.color}`}>
                    {errorMargin.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-primary bg-opacity-10 p-3 rounded-lg">
                  <span className="font-semibold">Points earned</span>
                  <span className="text-xl font-bold text-primary">+{lastPoints} pts</span>
                </div>
              </div>
              
              <div className="w-full text-center p-3 bg-gray-100 rounded-lg mb-6">
                <p className="text-sm text-gray-500 mb-1">TOTAL SCORE</p>
                <p className="text-2xl font-bold">{totalPoints} points</p>
              </div>
              
              <p className={`text-xl font-medium ${feedback.color} mb-1`}>
                {feedback.emoji} {feedback.text}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-3/4 py-3 px-4 text-lg font-medium rounded-lg text-white bg-primary flex items-center justify-center"
              onClick={handleNextQuestion}
              disabled={isTransitioning}
            >
              <span className="flex-1 text-center">Next Question</span>
              <kbd className="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 rounded">N</kbd>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}