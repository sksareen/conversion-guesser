'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showScoreOverlay, setShowScoreOverlay] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
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
    setIsInfoOpen(false);
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
    const newScore = {
      id: Date.now().toString(),
      product: currentCompany.company,
      funnel: currentCompany.funnel,
      guess,
      actual,
      error,
    };
    addScore(newScore);

    // Trigger overlay to show updated overall score
    setShowScoreOverlay(true);
  };
  
  // Next question handler
  const handleNext = () => {
    setupNewQuestion();
  };
  
  useEffect(() => {
    if (showScoreOverlay) {
      const timer = setTimeout(() => setShowScoreOverlay(false), 1500); // fade after 1.5s
      return () => clearTimeout(timer);
    }
  }, [showScoreOverlay]);
  
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
            <div className="flex justify-between items-start mb-4">
              <button
                type="button"
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className="flex items-center focus:outline-none"
              >
                <div className="relative w-10 h-10 mr-3">
                  <Image
                    src={currentCompany.logo || '/favicon.svg'}
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
                <h2 className="text-xl font-semibold mr-2">{currentCompany.company}</h2>
                <svg
                  className={`w-4 h-4 transform transition-transform ${isInfoOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 self-center">
                Question #{guessCount}
              </div>
            </div>
            
            {/* Company info dropdown */}
            <AnimatePresence>
              {isInfoOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-6 text-sm bg-gray-50 p-3 rounded-lg text-gray-700"
                >
                  <p>
                    <span className="font-medium">{currentCompany.company}</span> is a {currentCompany.description?.toLowerCase() || 'company in the tech industry'}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
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
                {
                  (() => {
                    const parts = currentCompany.funnel.split(/\s+to\s+/i);
                    if (parts.length === 2) {
                      return (
                        <div className="ml-11 flex flex-wrap items-baseline">
                          <span className="text-xl font-bold text-primary mr-1">{parts[0]}</span>
                          <span className="text-sm text-primary mr-1">to</span>
                          <span className="text-xl font-bold text-primary">{parts[1]}?</span>
                        </div>
                      );
                    }
                    return (
                      <p className="text-xl font-bold ml-11 text-primary">{currentCompany.funnel}?</p>
                    );
                  })()
                }
                
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* <div>
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
              </div> */}
              {/* Slider input */}
              <div>
                <label htmlFor="user-guess-slider" className="block text-sm font-medium text-gray-700 mb-1">
                  Adjust with Slider
                </label>
                <div className="relative mb-2">
                  <div className="text-2xl font-bold text-center text-primary">{userGuess ? parseFloat(userGuess).toFixed(1) : "0.0"}%</div>
                </div>
                <input
                  id="user-guess-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={userGuess || 0}
                  onChange={(e) => setUserGuess(e.target.value)}
                  className="w-full accent-primary"
                />
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
      {/* Score overlay */}
      <AnimatePresence>
        {showScoreOverlay && (
          <motion.div
            key="score-overlay"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg w-11/12 max-w-sm text-center relative"
            >
              <button 
                onClick={() => setShowScoreOverlay(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close score overlay"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {
                (() => {
                  const averageError = scores.length > 0 ? scores.reduce((sum, s) => sum + s.error, 0) / scores.length : 0;
                  const accuracyScore = Math.max(0, 100 - (averageError * 3));
                  const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;
                  const getPerformanceLevel = () => {
                    if (averageError <= 5) return { text: "Marketing Guru", color: "text-green-600" };
                    if (averageError <= 10) return { text: "Conversion Expert", color: "text-green-500" };
                    if (averageError <= 15) return { text: "Digital Marketer", color: "text-yellow-600" };
                    if (averageError <= 20) return { text: "Marketing Student", color: "text-yellow-500" };
                    return { text: "Conversion Novice", color: "text-red-500" };
                  };
                  const performance = getPerformanceLevel();
                  return (
                    <>
                      <p className={`text-3xl sm:text-4xl font-extrabold ${performance.color}`}>{performance.text}</p>
                      <p className="text-sm text-gray-500 mb-4">Your Performance Level</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs uppercase text-gray-500">Average Error</p>
                          <p className="text-2xl font-bold text-primary">{averageError.toFixed(1)}%</p>
                        </div>
                        {lastScore && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs uppercase text-gray-500">Last Guess Error</p>
                            <p className={`text-2xl font-bold ${lastScore.error <= 5 ? 'text-green-600' : lastScore.error <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {lastScore.error.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${accuracyScore}%`, background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981)' }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Accuracy Score: {accuracyScore.toFixed(0)}%</p>
                    </>
                  );
                })()
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
