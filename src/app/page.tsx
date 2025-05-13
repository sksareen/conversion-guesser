import FunnelCard from '@/components/FunnelCard';
import ScoreTable from '@/components/ScoreTable';
import WelcomeDialog from '@/components/WelcomeDialog';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <WelcomeDialog />
      
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">Guess the Conversion</h1>
        <p className="text-gray-600">
          Test your marketing knowledge by guessing real conversion rates 
          from top companies like <span className="font-medium">Airbnb</span>, <span className="font-medium">Netflix</span>, 
          and <span className="font-medium">Spotify</span>.
        </p>
      </header>
      
      <FunnelCard />
      
      <ScoreTable />
      
      <footer className="text-center text-sm text-gray-500 mt-6">
        <p>All statistics based on real-world data with citations.</p>
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5">
          <p>
            Made with <span className="text-red-500">♥</span> for marketers and growth hackers
          </p>
          <p className="flex items-center">
            <span className="hidden sm:inline mx-2">•</span>
            <span>Created by </span>
            <a 
              href="https://saversareen.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-1 text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm inline-flex items-center"
            >
              Savar Sareen
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
