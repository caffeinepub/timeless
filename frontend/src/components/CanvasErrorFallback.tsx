import React from 'react';

interface CanvasErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  onReload?: () => void;
}

export default function CanvasErrorFallback({ error, onRetry, onReload }: CanvasErrorFallbackProps) {
  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="bond-error-card">
        <div className="bond-card-accent-line" />
        <div className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="bond-error-icon-lg">⊘</div>
          <div>
            <h2 className="bond-error-title">MISSION ABORTED</h2>
            <p className="bond-error-subtitle">Renderer initialization failed</p>
          </div>

          {error && (
            <div className="bond-error-details">
              <p className="bond-error-msg">{error.message}</p>
            </div>
          )}

          <div className="bond-error-causes">
            <p className="bond-hud-label mb-2">POSSIBLE CAUSES</p>
            <ul className="space-y-1 text-left">
              {['WebGL not supported or disabled', 'Insufficient GPU memory', 'Browser security restrictions', 'Hardware acceleration disabled'].map(cause => (
                <li key={cause} className="bond-cause-item">
                  <span className="bond-cause-bullet">›</span> {cause}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {onRetry && (
              <button className="bond-btn-gold" onClick={onRetry}>
                RETRY MISSION
              </button>
            )}
            <button className="bond-btn-outline" onClick={handleReload}>
              RELOAD
            </button>
          </div>
        </div>
        <div className="bond-card-accent-line" />
      </div>
    </div>
  );
}
