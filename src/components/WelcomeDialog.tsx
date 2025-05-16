'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/posthog';
import Image from 'next/image';

export default function WelcomeDialog() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsVisible(true);
      // Track when welcome dialog is shown to a new user
      trackEvent('welcome_dialog_shown');
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsVisible(false);
    // Track when user closes the welcome dialog
    trackEvent('welcome_dialog_closed');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Welcome to Guess the Conversion!</h2>
              <p className="text-gray-600 mt-2">
                Test your marketing knowledge by guessing the <span className="font-medium">final conversion rates</span> of well-known companies.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Key Conversion Points</h3>
                  <p className="text-sm text-gray-600">Focus on the critical A → B final conversion steps in marketing funnels</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Real Company Data</h3>
                  <p className="text-sm text-gray-600">All conversion rates are from real companies with verified sources</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Improve Your Marketing Intuition</h3>
                  <p className="text-sm text-gray-600">Build a better feel for conversion benchmarks at each funnel stage</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Scoring System</h3>
                  <p className="text-sm text-gray-600">
                    Your performance is rated based on your average error - how close your guesses are to the actual conversion rates. Lower error = higher accuracy.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-center mb-2">Example Conversion Question</h3>
              <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                <p className="text-center text-sm font-semibold mb-2">Spotify</p>
                <p className="text-center text-sm text-gray-700 mb-3">
                  What percentage of free users upgrade to paid premium accounts?
                </p>
                <div className="flex justify-center">
                  <Image 
                    src="/images/example-conversion.svg" 
                    alt="Conversion example showing 46% of Spotify free users convert to premium" 
                    width={400} 
                    height={200}
                    priority
                  />
                </div>
                <p className="text-center mt-3 text-xs text-gray-600">You would guess this conversion rate percentage!</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Let's Get Started!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}