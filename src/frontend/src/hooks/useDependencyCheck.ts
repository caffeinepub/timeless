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
    console.log('🔍 Starting dependency check at', new Date().toISOString());

    const checkDependencies = async () => {
      try {
        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const webglSupported = !!gl;
        console.log('🖼️ WebGL supported:', webglSupported);

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

        // Check if Three.js is loaded
        let threeJsLoaded = false;
        try {
          const { Vector3 } = await import('three');
          threeJsLoaded = !!Vector3;
          console.log('📦 Three.js loaded:', threeJsLoaded);
        } catch (error) {
          console.error('❌ Three.js failed to load:', error);
        }

        // Check if React Three Fiber is loaded
        let fiberLoaded = false;
        try {
          const { Canvas } = await import('@react-three/fiber');
          fiberLoaded = !!Canvas;
          console.log('⚛️ React Three Fiber loaded:', fiberLoaded);
        } catch (error) {
          console.error('❌ React Three Fiber failed to load:', error);
        }

        // Check if Cannon is loaded
        let cannonLoaded = false;
        try {
          const { Physics } = await import('@react-three/cannon');
          cannonLoaded = !!Physics;
          console.log('🎱 Cannon physics loaded:', cannonLoaded);
        } catch (error) {
          console.error('❌ Cannon physics failed to load:', error);
        }

        const allLoaded = webglSupported && threeJsLoaded && fiberLoaded && cannonLoaded;

        if (!allLoaded) {
          const missing: string[] = [];
          if (!threeJsLoaded) missing.push('Three.js');
          if (!fiberLoaded) missing.push('React Three Fiber');
          if (!cannonLoaded) missing.push('Cannon Physics');

          setResult({
            isReady: false,
            isLoading: false,
            error: `Failed to load required dependencies: ${missing.join(', ')}`,
            details: {
              webglSupported,
              threeJsLoaded,
              cannonLoaded,
              fiberLoaded,
            },
          });
          return;
        }

        console.log('✅ All dependencies loaded successfully');
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
        setResult({
          isReady: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error during dependency check',
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
