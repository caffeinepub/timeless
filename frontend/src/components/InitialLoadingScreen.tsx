import { useEffect, useState, useRef } from 'react';
import '../styles/game-theme.css';

interface InitialLoadingScreenProps {
  progress?: number;
  stage?: string;
}

// Minimum time (ms) the loading screen must be visible before it can dismiss
const MIN_DISPLAY_MS = 4500;

export default function InitialLoadingScreen({
  progress = 0,
  stage = 'INITIALIZING',
}: InitialLoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const mountTimeRef = useRef(Date.now());

  // Fade in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setOpacity(1));
    return () => cancelAnimationFrame(t);
  }, []);

  // Smoothly animate the progress bar, but enforce a minimum display time
  // by slowing down progress if it would complete too quickly
  useEffect(() => {
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    // If real progress is ahead of where we should be given elapsed time,
    // throttle the displayed progress to match the minimum duration pacing
    const maxAllowedProgress = elapsed >= MIN_DISPLAY_MS
      ? 100
      : Math.min(95, (elapsed / MIN_DISPLAY_MS) * 100);

    const target = Math.min(progress, maxAllowedProgress);

    if (target > displayProgress) {
      const diff = target - displayProgress;
      const stepTime = remaining > 0 ? Math.max(16, remaining / (diff * 2)) : 16;
      const timer = setTimeout(() => {
        setDisplayProgress(prev => Math.min(target, prev + Math.max(0.5, diff * 0.1)));
      }, stepTime);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  const stages = [
    'INITIALIZING SYSTEMS',
    'LOADING ASSETS',
    'PREPARING ARENA',
    'ARMING AGENT',
    'MISSION READY',
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: 'oklch(0.04 0 0)',
        opacity,
        transition: 'opacity 0.8s ease-in',
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/generated/bond-title-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
        }}
      />

      {/* Scan-line overlay */}
      <div className="absolute inset-0 scan-line-overlay" />

      {/* Corner accent lines */}
      <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
        <div className="absolute top-6 left-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
        <div className="absolute top-6 left-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none">
        <div className="absolute top-6 right-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
        <div className="absolute top-6 right-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none">
        <div className="absolute bottom-6 left-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
        <div className="absolute bottom-6 left-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
        <div className="absolute bottom-6 right-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
        <div className="absolute bottom-6 right-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.6)' }} />
      </div>

      {/* Main card */}
      <div
        className="loading-card relative z-10 flex flex-col items-center gap-8 px-12 py-10"
        style={{ minWidth: 340, maxWidth: 480 }}
      >
        {/* Gun barrel animation */}
        <div className="bond-barrel-container">
          <div className="bond-barrel-ring" />
          <div className="bond-barrel-ring-inner" />
          <div className="bond-barrel-center">
            {/* 007 text */}
            <span
              className="title-reveal select-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'oklch(0.78 0.18 85)',
                textShadow: '0 0 12px oklch(0.78 0.18 85 / 0.8)',
              }}
            >
              007
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <h1
            className="title-reveal"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'oklch(0.78 0.18 85)',
              textShadow: '0 0 20px oklch(0.78 0.18 85 / 0.5)',
            }}
          >
            AGENT 007
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'oklch(0.78 0.18 85 / 0.45)',
            }}
          >
            CLASSIFIED MISSION BRIEFING
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full flex flex-col gap-2">
          <div className="loading-progress-track w-full h-1">
            <div
              className="loading-progress-fill h-full"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Stage label */}
          <div className="flex items-center justify-between">
            <span className="loading-stage-label">{stage}</span>
            <span
              className="loading-stage-label"
              style={{ color: 'oklch(0.78 0.18 85 / 0.8)' }}
            >
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>

        {/* Stage dots */}
        <div className="flex items-center gap-3">
          {stages.map((s, i) => {
            const stageProgress = (i + 1) / stages.length * 100;
            const isComplete = displayProgress >= stageProgress;
            const isActive = displayProgress >= stageProgress - 20 && !isComplete;
            return (
              <div
                key={s}
                title={s}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isComplete
                    ? 'oklch(0.78 0.18 85)'
                    : isActive
                    ? 'oklch(0.78 0.18 85 / 0.5)'
                    : 'oklch(0.3 0.02 85)',
                  boxShadow: isComplete
                    ? '0 0 8px oklch(0.78 0.18 85 / 0.8)'
                    : 'none',
                  transition: 'all 0.4s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom classification label */}
      <div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '0.6rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'oklch(0.78 0.18 85 / 0.25)',
        }}
      >
        TOP SECRET — FOR AUTHORIZED PERSONNEL ONLY
      </div>
    </div>
  );
}
