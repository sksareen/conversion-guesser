'use client';

interface FunnelVisualizationProps {
  actual: number;
  guess: number;
}

export default function FunnelVisualization({ actual, guess }: FunnelVisualizationProps) {
  // Funnel visualization using flex-box
  
  // Calculate widths for the bars
  const maxBarWidth = 100; // 100% width max
  const actualBarWidth = `${actual}%`;
  const guessBarWidth = `${guess}%`;
  
  return (
    <div className="space-y-6 my-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <p>Actual: {actual.toFixed(1)}%</p>
          <p>100%</p>
        </div>
        <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
          <div 
            className="h-full bg-secondary rounded-md transition-all duration-500 ease-out"
            style={{ width: actualBarWidth }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <p>Your guess: {guess.toFixed(1)}%</p>
          <p>100%</p>
        </div>
        <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
          <div 
            className="h-full bg-primary rounded-md transition-all duration-500 ease-out"
            style={{ width: guessBarWidth }}
          />
        </div>
      </div>
      
      {/* Difference visualization */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm font-medium mb-1">Difference</p>
        <div className="flex items-center">
          <div className="flex-1 h-1 bg-gray-200 rounded-full">
            <div className={`h-full rounded-full ${Math.abs(actual - guess) <= 5 ? 'bg-green-500' : Math.abs(actual - guess) <= 15 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.abs(actual - guess) * 2)}%` }} />
          </div>
          <span className="ml-2 text-sm">{Math.abs(actual - guess).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}