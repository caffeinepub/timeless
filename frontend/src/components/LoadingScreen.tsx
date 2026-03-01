import React from 'react';

interface LoadingScreenProps {
  progress: number;
  currentStage: string;
  retryCount?: number;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const stageLabels: Record<string, string> = {
  idle: 'Standby...',
  canvas: 'Initializing Renderer...',
  physics: 'Loading Physics Engine...',
  arena: 'Constructing Environment...',
  player: 'Arming Agent...',
  enemies: 'Deploying Hostiles...',
  complete: 'Mission Ready',
  error: 'System Failure',
};

export default function LoadingScreen({
  progress,
  currentStage,
  retryCount = 0,
  isError = false,
  errorMessage,
  onRetry,
}: LoadingScreenProps) {
  const label = stageLabels[currentStage] || 'Loading...';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Bond-style loading card */}
      <div className="bond-loading-card">
        {/* Top accent line */}
        <div className="bond-card-accent-line" />

        <div className="flex flex-col items-center gap-6 p-8">
          {/* Gun barrel animation */}
          {!isError && (
            <div className="bond-barrel-ring-sm">
              <div className="bond-barrel-inner-sm" />
            </div>
          )}

          {isError && (
            <div className="bond-error-icon">⚠</div>
          )}

          <div className="text-center">
            <h2 className="bond-card-title">
              {isError ? 'MISSION COMPROMISED' : 'LOADING MISSION'}
            </h2>
            <p className="bond-card-stage">{isError ? (errorMessage || 'System failure') : label}</p>
          </div>

          {!isError && (
            <>
              {/* Progress bar */}
              <div className="bond-progress-container w-64">
                <div
                  className="bond-progress-fill transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="bond-progress-pct">{Math.round(progress)}%</p>
            </>
          )}

          {retryCount > 0 && (
            <p className="bond-retry-label">Attempt {retryCount + 1} of 3</p>
          )}

          {isError && onRetry && (
            <button className="bond-btn-gold" onClick={onRetry}>
              RETRY MISSION
            </button>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="bond-card-accent-line" />
      </div>
    </div>
  );
}
