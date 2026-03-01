import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

export default function PerformanceOverlay() {
  const { stats } = usePerformanceMonitor();

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-green-400 p-3 rounded font-mono text-xs space-y-1 pointer-events-none">
      <div className="font-bold text-green-300">Performance</div>
      <div>FPS: {stats.fps}</div>
      <div>Frame: {stats.frameTime.toFixed(2)}ms</div>
      {stats.memory && (
        <>
          <div className="border-t border-green-900 pt-1 mt-1">Memory</div>
          <div>Used: {formatBytes(stats.memory.usedJSHeapSize)}</div>
          <div>Total: {formatBytes(stats.memory.totalJSHeapSize)}</div>
          <div>Limit: {formatBytes(stats.memory.jsHeapSizeLimit)}</div>
        </>
      )}
    </div>
  );
}
