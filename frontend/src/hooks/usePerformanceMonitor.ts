import { useState, useEffect, useRef } from 'react';

interface PerformanceStats {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  frameTime: number;
}

export function usePerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log('📊 Performance monitor started at', new Date().toISOString());

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      frameCountRef.current++;
      frameTimesRef.current.push(delta);
      
      // Keep only last 60 frames
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Update stats every second
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        
        const newStats: PerformanceStats = {
          fps,
          frameTime: avgFrameTime,
        };

        // Add memory stats if available
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          newStats.memory = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          };
        }

        setStats(newStats);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current);
      }
      console.log('📊 Performance monitor stopped');
    };
  }, []);

  const exportStats = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
    
    console.log('📊 Performance stats exported:', data);
    return data;
  };

  return { stats, exportStats };
}
