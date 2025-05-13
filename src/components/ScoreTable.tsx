'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

export default function ScoreTable() {
  const { scores, clearScores } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate average error
  const averageError = scores.length > 0
    ? scores.reduce((sum, score) => sum + score.error, 0) / scores.length
    : 0;
    
  // Calculate accuracy score (100 - averageError, min 0)
  const accuracyScore = Math.max(0, 100 - (averageError * 3));
  
  if (scores.length === 0) {
    return null; // Don't render anything if no scores yet
  }
  
  // Get performance level
  const getPerformanceLevel = () => {
    if (averageError <= 5) return { text: "Marketing Guru", color: "text-green-600" };
    if (averageError <= 10) return { text: "Conversion Expert", color: "text-green-500" };
    if (averageError <= 15) return { text: "Digital Marketer", color: "text-yellow-600" };
    if (averageError <= 20) return { text: "Marketing Student", color: "text-yellow-500" };
    return { text: "Conversion Novice", color: "text-red-500" };
  };
  
  const performance = getPerformanceLevel();
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Collapsible header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 text-left flex justify-between items-center border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Your Performance</h2>
          <div className="ml-3 px-2 py-1 rounded-full bg-primary bg-opacity-10 text-primary text-sm font-medium">
            {scores.length} guesses
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-bold ${performance.color}`}>{performance.text}</span>
          <svg 
            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* Collapsible content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={clearScores} 
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Reset History
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex flex-col items-center mb-3">
                  <h3 className={`text-2xl font-bold ${performance.color}`}>{performance.text}</h3>
                  <p className="text-gray-600 text-sm">Your conversion prediction level</p>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-500">Novice</span>
                  <span className="text-xs text-gray-500">Expert</span>
                </div>
                
                <div className="h-4 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${accuracyScore}%`,
                      background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981)'
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 text-xs uppercase">Total Guesses</p>
                    <p className="font-bold text-xl text-primary">{scores.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 text-xs uppercase">Avg Error</p>
                    <p className={`font-bold text-xl ${averageError <= 5 ? 'text-green-600' : averageError <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {averageError.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600 text-xs uppercase">Best Guess</p>
                    <p className="font-bold text-xl text-green-600">
                      {scores.length > 0 ? Math.min(...scores.map(s => s.error)).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-lg mb-3">Recent Guesses</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Your Guess</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Actual</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...scores].reverse().slice(0, 5).map((score) => (
                      <tr key={score.id}>
                        <td className="px-3 py-3 text-sm">
                          <div className="font-medium text-gray-900">{score.product}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[180px]">{score.funnel}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-medium">{score.guess.toFixed(1)}%</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-medium">{score.actual.toFixed(1)}%</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${score.error <= 5 ? 'bg-green-100 text-green-800' : score.error <= 15 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {score.error.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
