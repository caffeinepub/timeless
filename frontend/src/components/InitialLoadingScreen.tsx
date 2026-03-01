import React from 'react';

interface InitialLoadingScreenProps {
  progress?: number;
  currentStage?: string;
}

const stageLabels: Record<string, string> = {
  idle: 'Initializing...',
  canvas: 'Preparing Renderer...',
  physics: 'Loading Physics Engine...',
  arena: 'Building Environment...',
  player: 'Arming Agent...',
  enemies: 'Deploying Hostiles...',
  complete: 'Mission Ready',
  error: 'System Error',
};

export default function InitialLoadingScreen({ progress = 0, currentStage = 'idle' }: InitialLoadingScreenProps) {
  const label = stageLabels[currentStage] || 'Loading...';

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url(/assets/generated/bond-title-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Gun barrel circle */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="bond-barrel-ring">
          <div className="bond-barrel-inner" />
        </div>

        <div className="text-center">
          <h1 className="bond-loading-title">OPERATION: NAKATOMI</h1>
          <p className="bond-loading-subtitle">CLASSIFIED · EYES ONLY</p>
        </div>

        {/* Progress bar */}
        <div className="bond-progress-container">
          <div
            className="bond-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="bond-loading-stage">{label}</p>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="bond-dot"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
