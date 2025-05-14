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
    sourceURL?: string;
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
    if (errorMargin <= 2) return { emoji: '🎯', text: 'Perfect!', color: 'text-green-600', bucket: '🟩' };
    if (errorMargin <= 5) return { emoji: '✨', text: 'Excellent!', color: 'text-green-600', bucket: '🟩' };
    if (errorMargin <= 10) return { emoji: '👍', text: 'Good!', color: 'text-yellow-600', bucket: '🟨' };
    if (errorMargin <= 15) return { emoji: '😊', text: 'Not bad', color: 'text-yellow-500', bucket: '🟨' };
    return { emoji: '🤔', text: 'Try again', color: 'text-red-600', bucket: '⬜' };
  };

  const feedback = getFeedback();
  
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
                src={company.logo || "/favicon.svg"}
                alt={company.company}
                width={128}
                height={128}
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  // @ts-ignore
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/favicon.svg';
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
            
            <div className="flex flex-col items-center mb-10 w-full">
              <div className="text-7xl mb-4">{feedback.bucket}</div>
              
              <div className="flex justify-between w-full mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Your guess</p>
                  <p className="text-3xl font-bold">{guess.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Actual</p>
                  <p className="text-3xl font-bold">{company.conversion.toFixed(1)}%</p>
                </div>
              </div>
              
              <p className={`text-2xl font-medium ${feedback.color} mb-2`}>
                {feedback.emoji} {feedback.text}
              </p>
              <p className="text-lg font-medium">
                {errorMargin.toFixed(1)}% error
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-3/4 py-3 px-4 text-lg font-medium rounded-lg text-white bg-primary flex items-center justify-center"
              onClick={onContinue}
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