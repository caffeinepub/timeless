import { useState, useEffect } from 'react';

interface DependencyCheckResult {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  details: {
    webglSupported: boolean;
    threeJsLoaded: boolean;
    cannonLoaded: boolean;
    fiberLoaded: boolean;
  };
}

const DEPENDENCY_TIMEOUT_MS = 10000; // 10 seconds for dependency checks

export function useDependencyCheck(): DependencyCheckResult {
  const [result, setResult] = useState<DependencyCheckResult>({
    isReady: false,
    isLoading: true,
    error: null,
    details: {
      webglSupported: false,
      threeJsLoaded: false,
      cannonLoaded: false,
      fiberLoaded: false,
    },
  });

  useEffect(() => {
    const startTime = performance.now();
    console.log('🔍 Starting dependency check at', new Date().toISOString(), '/', startTime.toFixed(2), 'ms');

    const checkDependencies = async () => {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Dependency check timed out after ${DEPENDENCY_TIMEOUT_MS / 1000} seconds`));
          }, DEPENDENCY_TIMEOUT_MS);
        });

        // Check WebGL support
        const webglStart = performance.now();
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const webglSupported = !!gl;
        const webglEnd = performance.now();
        console.log('🖼️ WebGL check completed in', (webglEnd - webglStart).toFixed(2), 'ms - supported:', webglSupported);

        if (!webglSupported) {
          setResult({
            isReady: false,
            isLoading: false,
            error: 'WebGL is not supported in your browser',
            details: {
              webglSupported: false,
              threeJsLoaded: false,
              cannonLoaded: false,
              fiberLoaded: false,
            },
          });
          return;
        }

        // Check if Three.js is loaded with timeout
        const threeStart = performance.now();
        let threeJsLoaded = false;
        try {
          const threeImport = import('three');
          const { Vector3 } = await Promise.race([threeImport, timeoutPromise]);
          threeJsLoaded = !!Vector3;
          const threeEnd = performance.now();
          console.log('📦 Three.js check completed in', (threeEnd - threeStart).toFixed(2), 'ms - loaded:', threeJsLoaded);
        } catch (error) {
          console.error('❌ Three.js failed to load:', error);
          throw new Error('Three.js failed to load: ' + (error instanceof Error ? error.message : String(error)));
        }

        // Check if React Three Fiber is loaded with timeout
        const fiberStart = performance.now();
        let fiberLoaded = false;
        try {
          const fiberImport = import('@react-three/fiber');
          const { Canvas } = await Promise.race([fiberImport, timeoutPromise]);
          fiberLoaded = !!Canvas;
          const fiberEnd = performance.now();
          console.log('⚛️ React Three Fiber check completed in', (fiberEnd - fiberStart).toFixed(2), 'ms - loaded:', fiberLoaded);
        } catch (error) {
          console.error('❌ React Three Fiber failed to load:', error);
          throw new Error('React Three Fiber failed to load: ' + (error instanceof Error ? error.message : String(error)));
        }

        // Check if Cannon is loaded with timeout
        const cannonStart = performance.now();
        let cannonLoaded = false;
        try {
          const cannonImport = import('@react-three/cannon');
          const { Physics } = await Promise.race([cannonImport, timeoutPromise]);
          cannonLoaded = !!Physics;
          const cannonEnd = performance.now();
          console.log('🎱 Cannon physics check completed in', (cannonEnd - cannonStart).toFixed(2), 'ms - loaded:', cannonLoaded);
        } catch (error) {
          console.error('❌ Cannon physics failed to load:', error);
          throw new Error('Cannon physics failed to load: ' + (error instanceof Error ? error.message : String(error)));
        }

        const allLoaded = webglSupported && threeJsLoaded && fiberLoaded && cannonLoaded;
        const totalTime = performance.now() - startTime;
        console.log('⏱️ Total dependency check time:', totalTime.toFixed(2), 'ms');

        if (!allLoaded) {
          const missing: string[] = [];
          if (!threeJsLoaded) missing.push('Three.js');
          if (!fiberLoaded) missing.push('React Three Fiber');
          if (!cannonLoaded) missing.push('Cannon Physics');

          throw new Error(`Failed to load required dependencies: ${missing.join(', ')}`);
        }

        console.log('✅ All dependencies loaded successfully in', totalTime.toFixed(2), 'ms');
        setResult({
          isReady: true,
          isLoading: false,
          error: null,
          details: {
            webglSupported,
            threeJsLoaded,
            cannonLoaded,
            fiberLoaded,
          },
        });
      } catch (error) {
        console.error('❌ Dependency check failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during dependency check';
        setResult({
          isReady: false,
          isLoading: false,
          error: errorMessage,
          details: {
            webglSupported: false,
            threeJsLoaded: false,
            cannonLoaded: false,
            fiberLoaded: false,
          },
        });
      }
    };

    checkDependencies();
  }, []);

  return result;
}
