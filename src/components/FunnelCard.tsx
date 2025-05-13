'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import CompanyReveal from './CompanyReveal';
import companies from '@/data/companies.json';
import Image from 'next/image';

export default function FunnelCard() {
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const { addScore, scores } = useGameStore();
  
  // Get a random company from the data, avoiding recently used ones if possible
  const getRandomCompany = () => {
    const recentCompanies = scores.slice(-5).map(score => score.product);
    
    // Try to find a company not in recent guesses
    let attempts = 0;
    let randomCompany;
    
    do {
      const randomIndex = Math.floor(Math.random() * companies.length);
      randomCompany = companies[randomIndex];
      attempts++;
    } while (
      recentCompanies.includes(randomCompany.company) && 
      attempts < 10 && 
      recentCompanies.length < companies.length - 1
    );
    
    return randomCompany;
  };
  
  // Setup new question
  const setupNewQuestion = () => {
    setCurrentCompany(getRandomCompany());
    setUserGuess('');
    setShowResult(false);
    setGuessCount(prev => prev + 1);
  };
  
  // Handle initial load and keyboard shortcuts
  useEffect(() => {
    setupNewQuestion();
    
    // Add keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      // Press 'n' to go to next question when in result view
      if (e.key === 'n' && showResult) {
        handleNext();
      }
      // Press Escape to skip current question
      else if (e.key === 'Escape' && !showResult) {
        setupNewQuestion();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [showResult]);
  
  // Show welcome message for first-time users
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);
  
  // Submit guess handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userGuess || isNaN(Number(userGuess))) {
      alert('Please enter a valid number');
      return;
    }
    
    const guess = parseFloat(userGuess);
    if (guess < 0 || guess > 100) {
      alert('Please enter a value between 0 and 100');
      return;
    }
    
    const actual = currentCompany.conversion;
    const error = Math.abs(guess - actual);
    
    setShowResult(true);
    
    // Add to score history
    addScore({
      id: Date.now().toString(),
      product: currentCompany.company,
      funnel: currentCompany.funnel,
      guess,
      actual,
      error,
    });
  };
  
  // Next question handler
  const handleNext = () => {
    setupNewQuestion();
  };
  
  if (!currentCompany) return <div className="text-center">Loading...</div>;
  
  return (
    <>
      {!showResult ? (
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={`guess-${guessCount}`}
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="relative w-10 h-10 mr-3">
                  <Image
                    src={currentCompany.logo || "/favicon.svg"}
                    alt={currentCompany.company}
                    width={40}
                    height={40}
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      // @ts-ignore
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/favicon.svg';
                    }}
                  />
                </div>
                <h2 className="text-xl font-semibold">{currentCompany.company}</h2>
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                Question #{guessCount}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-medium text-lg text-gray-800">What's the percentage of users who:</p>
                </div>
                <p className="text-xl font-bold ml-11 text-primary">{currentCompany.funnel}?</p>
              </div>
              
              <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">{currentCompany.company}</span> is a {currentCompany.description?.toLowerCase() || "company in the tech industry"}. Guess their conversion rate for this metric.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="user-guess" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Guess (0-100%)
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    id="user-guess"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    className="block w-full pr-12 input focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                    placeholder="Enter your guess"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-3 px-4 text-lg font-medium rounded-lg text-white bg-primary hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Submit Guess
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={setupNewQuestion} 
                className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center mx-auto"
              >
                <span>Skip this question</span>
                <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Esc</kbd>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <CompanyReveal 
          company={currentCompany}
          guess={parseFloat(userGuess)}
          onContinue={handleNext}
        />
      )}
    </>
  );
}
