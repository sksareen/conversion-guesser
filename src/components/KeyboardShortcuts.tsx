'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KeyboardShortcuts() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Keyboard shortcuts"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 right-0 bg-white p-4 rounded-lg shadow-lg w-64"
          >
            <h3 className="font-medium text-gray-900 mb-2">Keyboard Shortcuts</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Next question</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">N</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Skip question</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Esc</kbd>
              </li>
            </ul>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <a 
                href="https://forms.gle/KSHXN641ArE3iRiw5j" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center text-sm text-primary hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Send Feedback
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}