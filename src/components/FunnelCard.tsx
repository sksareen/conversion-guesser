'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import CompanyReveal from './CompanyReveal';
import companiesData from '@/data/companies.json';
import Image from 'next/image';
import { trackEvent } from '@/lib/posthog';

// Flatten the companies array from all categories
const companies = companiesData.categories.flatMap(category => category.companies);

export default function FunnelCard() {
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const { addScore, scores, username, setUsername, totalPoints, lastPoints } = useGameStore();
  const [showScoreOverlay, setShowScoreOverlay] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [streak, setStreak] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Memoize the setupNewQuestion function to avoid recreating it on each render
  const setupNewQuestion = useCallback(() => {
    const company = getRandomCompany();
    setCurrentCompany(company);
    setUserGuess('');
    setShowResult(false);
    setGuessCount(prev => prev + 1);
    
    // Track new question event
    trackEvent('new_question', {
      company: company.company,
      funnel: company.funnel,
      questionNumber: guessCount + 1
    });
    
    // Focus the input after a short delay to allow rendering
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [guessCount, getRandomCompany, trackEvent]);
  
  // Handle initial load only
  useEffect(() => {
    setupNewQuestion();
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Press 'n' to go to next question when in result view and not during transitions
      if (e.key === 'n' && showResult && !showScoreOverlay) {
        handleNext();
      }
      // Press Escape to skip current question when not showing result or overlay
      else if (e.key === 'Escape' && !showResult && !showScoreOverlay) {
        trackEvent('question_skipped', {
          company: currentCompany?.company,
          questionNumber: guessCount
        });
        setupNewQuestion();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [showResult, showScoreOverlay, currentCompany, guessCount, setupNewQuestion]);
  
  // Show welcome message for first-time users
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      localStorage.setItem('hasVisitedBefore', 'true');
      trackEvent('first_visit');
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
    
    // If this is their first guess and username is still Anonymous, show the username prompt
    if (scores.length === 0 && username === 'Anonymous') {
      setTempUsername('');
      setShowUsernamePrompt(true);
      return;
    }
    
    submitScoreAndProceed(guess);
  };
  
  // Function to handle actual score submission after potentially setting username
  const submitScoreAndProceed = (guess: number) => {
    const actual = currentCompany.conversion;
    const error = Math.abs(guess - actual);
    
    // Update streak (under 10% error keeps streak)
    const newStreak = error <= 10 ? streak + 1 : 0;
    setStreak(newStreak);

    // Perfect hit flash (<=1% error)
    if (error <= 1) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);
    }
    
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

    // Track guess event
    trackEvent('guess_submitted', {
      company: currentCompany.company,
      funnel: currentCompany.funnel,
      guess,
      actual,
      error,
      streak: newStreak,
      guessNumber: scores.length + 1,
      username
    });

    // Show the score overlay
    setShowScoreOverlay(true);
    
    // After the overlay is shown for a bit, proceed to the next question directly
    setTimeout(() => {
      // Hide the overlay
      setShowScoreOverlay(false);
      // Go directly to the next question instead of showing result
      setupNewQuestion();
    }, 3500); // Allow a bit more time to see the score before moving on

    // Prepare shareable text card and copy to clipboard
    try {
      const bucket = error <= 5 ? "🟩" : error <= 10 ? "🟨" : "⬜";
      const shareText = `GuessConversion ${scores.length + 1}\n${bucket}  Error: ${error.toFixed(1)}%`;
      navigator.clipboard.writeText(shareText).catch(() => {});
      
      trackEvent('share_text_copied', {
        shareText
      });
    } catch {}
  };
  
  // Handle username submission
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      
      // Track username set event
      trackEvent('username_set', {
        username: tempUsername.trim()
      });
    }
    
    setShowUsernamePrompt(false);
    submitScoreAndProceed(parseFloat(userGuess));
  };
  
  // Next question handler
  const handleNext = () => {
    setShowResult(false);
    setupNewQuestion();
  };
  
  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  if (!currentCompany) return <div className="text-center">Loading...</div>;
  
  return (
    <>
      {!showResult ? (
        <motion.div 
          className="flex flex-col items-center py-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={`guess-${guessCount}`}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-6">
              <Image
                src={`${currentCompany.logo}`}
                alt={currentCompany.company}
                width={128}
                height={128}
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  // @ts-ignore
                  e.currentTarget.onerror = null;
                  
                  // Try alternate extensions if the original path fails
                  const originalSrc = e.currentTarget.src;
                  const basePath = `${currentCompany.logo}`;
                  
                  // Try JPG if not already
                  if (!originalSrc.includes('.jpg')) {
                    e.currentTarget.src = `${basePath}.jpg`;
                    return;
                  }
                  
                  // Try PNG if not already
                  if (!originalSrc.includes('.png')) {
                    e.currentTarget.src = `${basePath}.png`;
                    return;
                  }
                  
                  // Try SVG as last resort
                  if (!originalSrc.includes('.svg')) {
                    e.currentTarget.src = `${basePath}.svg`;
                    return;
                  }
                  
                  // Fallback to favicon if all else fails
                  e.currentTarget.src = '/favicon.png';
                }}
              />
            </div>

            <h2 className="text-2xl font-bold mb-4 text-center">{currentCompany.company}</h2>
            
            <div className="text-center mb-2">
              {
                (() => {
                  const parts = currentCompany.funnel.split(/\s+to\s+/i);
                  if (parts.length === 2) {
                    return (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center mb-2">
                          <span className="font-semibold text-lg text-gray-700">What % converts from:</span>
                        </div>
                        <div className="flex items-center text-xl relative py-2">
                          <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-primary">
                            {parts[0]}
                          </div>
                          <div className="mx-3 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {/* <span className="text-xs text-gray-500 mt-0.5">FINAL STEP</span> */}
                          </div>
                          <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-primary">
                            {parts[1]}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-lg text-gray-700">Final conversion rate:</span>
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-lg text-xl font-bold text-primary">
                        {currentCompany.funnel}
                      </div>
                    </div>
                  );
                })()
              }
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center">
            <div className="mb-8 flex flex-row items-center justify-center gap-2">
              <input
                ref={inputRef}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                className="w-32 text-center text-6xl font-bold text-primary py-2 focus:outline-none bg-transparent border-b-2 border-gray-200"
                placeholder="0.0"
                required
                autoFocus
              />
              <span className="text-3xl text-gray-400">%</span>
            </div>
            
            <button 
              type="submit" 
              className="w-3/4 py-3 px-4 text-lg font-medium rounded-lg text-white bg-primary hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Submit
            </button>
          </form>
        </motion.div>
      ) : (
        <CompanyReveal 
          company={currentCompany}
          guess={parseFloat(userGuess)}
          onContinue={handleNext}
        />
      )}

      {/* Tiny streak progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-40">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(streak, 10) * 10}%` }}
        />
      </div>

      {/* Perfect hit flash */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="fixed inset-0 bg-white z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Score overlay */}
      <AnimatePresence>
        {showScoreOverlay && (
          <motion.div
            key="score-overlay"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg w-11/12 max-w-sm text-center relative"
            >
              {
                (() => {
                  const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;
                  
                  let feedback = { emoji: '🤔', text: 'Try again', color: 'text-red-600', accuracy: 'Off target' };
                  
                  if (lastScore) {
                    if (lastScore.error <= 2) feedback = { emoji: '🎯', text: 'Perfect!', color: 'text-green-600', accuracy: 'Perfect!' };
                    else if (lastScore.error <= 5) feedback = { emoji: '✨', text: 'Excellent!', color: 'text-green-600', accuracy: 'Excellent!' };
                    else if (lastScore.error <= 10) feedback = { emoji: '👍', text: 'Good!', color: 'text-yellow-600', accuracy: 'Close!' };
                    else if (lastScore.error <= 15) feedback = { emoji: '😊', text: 'Not bad', color: 'text-yellow-500', accuracy: 'Getting there' };
                  }
                  
                  return (
                    <>
                      {lastScore && (
                        <div>
                          {/* Simplified layout with reduced visual noise */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold">{lastScore.product}</h3>
                            <p className="text-sm text-gray-600">{lastScore.funnel}</p>
                          </div>
                          
                          {/* Feedback section */}
                          <div className={`text-5xl font-black mb-2 ${feedback.color}`}>
                            {feedback.emoji}
                          </div>
                          
                          <div className="text-xl font-bold mb-4 text-center">
                            {feedback.accuracy}
                          </div>
                          
                          {/* Simplified visual comparison */}
                          <div className="mb-5">
                            <div className="h-12 w-full bg-gray-50 rounded-lg relative overflow-hidden mb-3">
                              {/* Grid lines at 25%, 50%, 75% */}
                              <div className="absolute inset-0 flex justify-between px-6 pointer-events-none">
                                <div className="h-full w-px bg-gray-200"></div>
                                <div className="h-full w-px bg-gray-200"></div>
                                <div className="h-full w-px bg-gray-200"></div>
                              </div>
                              
                              {(() => {
                                // Calculate positions as percentage (capped between 0-100%)
                                const guessPos = Math.max(0, Math.min(100, lastScore.guess));
                                const actualPos = Math.max(0, Math.min(100, lastScore.actual));
                                
                                return (
                                  <>
                                    {/* Actual value marker */}
                                    <div 
                                      className="absolute h-full w-1 bg-green-500"
                                      style={{ left: `${actualPos}%` }}
                                    />
                                    
                                    {/* Your guess marker */}
                                    <div 
                                      className="absolute h-3 w-3 rounded-full bg-blue-500 border-2 border-white"
                                      style={{ 
                                        left: `${guessPos}%`,
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    />
                                    
                                    {/* Highlight difference */}
                                    <div 
                                      className="absolute h-full bg-red-100 opacity-40"
                                      style={{ 
                                        left: `${Math.min(guessPos, actualPos)}%`,
                                        width: `${Math.abs(guessPos - actualPos)}%`,
                                      }}
                                    />
                                  </>
                                );
                              })()}
                            </div>
                            
                            {/* Simple values display */}
                            <div className="flex justify-between text-sm font-medium">
                              <div>
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                Your guess: <span className="font-bold">{lastScore.guess.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Actual: <span className="font-bold">{lastScore.actual.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Points earned - simplified */}
                          <div className="bg-primary bg-opacity-5 rounded-lg p-4 mb-3 flex justify-between items-center">
                            <span className="text-gray-700">Points earned</span>
                            <span className="text-2xl font-bold text-primary">+{lastPoints}</span>
                          </div>
                          
                          <div className="text-lg font-medium">
                            Total: {totalPoints} points
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-3">
                            Next question in a moment...
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Username prompt overlay */}
      <AnimatePresence>
        {showUsernamePrompt && (
          <motion.div
            key="username-prompt"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg w-11/12 max-w-sm"
            >
              <h3 className="text-xl font-bold text-center mb-4">Join the Leaderboard!</h3>
              <p className="text-gray-600 mb-4 text-center">
                Choose a username to track your progress.
              </p>
              
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div>
                  <input
                    id="username-input"
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value.slice(0, 10))}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-center"
                    placeholder="Username (max 10 chars)"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUsernamePrompt(false);
                      submitScoreAndProceed(parseFloat(userGuess));
                    }}
                    className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
