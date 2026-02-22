import { ErrorBoundary } from './components/ErrorBoundary';
import Game from './components/Game';
import './styles/game-theme.css';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('🎮 App component mounted at', new Date().toISOString());
    console.log('🌐 Hostname:', window.location.hostname);
    console.log('📍 Current URL:', window.location.href);
    console.log('🖥️ User Agent:', navigator.userAgent);
    console.log('📱 Screen:', window.screen.width, 'x', window.screen.height);
    
    return () => {
      console.log('🎮 App component unmounting at', new Date().toISOString());
      console.log('🧹 Cleaning up app-level resources');
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="w-full h-screen overflow-hidden bg-background">
        <Game />
      </div>
    </ErrorBoundary>
  );
}

export default App;
