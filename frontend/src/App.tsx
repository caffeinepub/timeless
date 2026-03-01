import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import InitialLoadingScreen from './components/InitialLoadingScreen';

const Game = lazy(() => import('./components/Game'));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<InitialLoadingScreen progress={5} currentStage="canvas" />}>
        <Game />
      </Suspense>
    </ErrorBoundary>
  );
}
