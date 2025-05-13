'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

export default function ScoreTable() {
  const { scores, clearScores, username, setUsername, globalLeaderboard, fetchLeaderboard, isLoading } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Calculate average error
  const averageError = scores.length > 0
    ? scores.reduce((sum, score) => sum + score.error, 0) / scores.length
    : 0;
    
  // Calculate accuracy score (100 - averageError, min 0)
  const accuracyScore = Math.max(0, 100 - (averageError * 3));
  
  // Fetch leaderboard when component mounts or tab changes to leaderboard
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, fetchLeaderboard]);
  
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

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
    setIsEditingName(false);
  };
  
  const startEditingName = () => {
    setTempUsername(username);
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  
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
          <h2 className="text-xl font-semibold">Performance</h2>
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
              <div className="flex flex-wrap items-center justify-between mb-4">
                {/* Username display/edit */}
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="text-sm text-gray-500 mr-2">Playing as:</span>
                  {isEditingName ? (
                    <div className="flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value.slice(0, 10))}
                        maxLength={10}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-32 mr-2"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                        aria-label="Enter username"
                        placeholder="Username"
                      />
                      <button 
                        onClick={handleSaveUsername}
                        className="text-xs bg-primary text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="font-medium">{username}</span>
                      <button
                        onClick={startEditingName}
                        className="ml-2 text-gray-400 hover:text-gray-600" 
                        aria-label="Edit username"
                        title="Edit username"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={clearScores} 
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Reset History
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'personal' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('personal')}
                >
                  Your Stats
                </button>
                {/* <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'leaderboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('leaderboard')}
                >
                  Global Leaderboard
                </button> */}
              </div>
              
              {activeTab === 'personal' ? (
                <>
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
                </>
              ) : (
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="text-lg font-bold text-center mb-4">Global Leaderboard</h3>
                    
                    {isLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="animate-spin h-8 w-8 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2">Loading leaderboard...</p>
                      </div>
                    ) : globalLeaderboard.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No entries yet! Be the first to join the leaderboard.</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Rank</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Player</th>
                              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Level</th>
                              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Avg Error</th>
                              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Guesses</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {globalLeaderboard.map((entry, index) => (
                              <tr key={entry.id} className={username === entry.username ? "bg-blue-50" : ""}>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                  <div className="font-medium text-gray-900 flex items-center">
                                    {entry.username}
                                    {username === entry.username && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                                  <span className={`text-xs font-medium ${
                                    entry.performanceLevel === "Marketing Guru" ? "text-green-600" :
                                    entry.performanceLevel === "Conversion Expert" ? "text-green-500" :
                                    entry.performanceLevel === "Digital Marketer" ? "text-yellow-600" :
                                    entry.performanceLevel === "Marketing Student" ? "text-yellow-500" :
                                    "text-red-500"
                                  }`}>
                                    {entry.performanceLevel}
                                  </span>
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-medium">
                                  {entry.averageError.toFixed(1)}%
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center hidden sm:table-cell">
                                  {entry.totalGuesses}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
