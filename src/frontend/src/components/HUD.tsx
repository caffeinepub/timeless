import HealthBar from './HealthBar';

interface HUDProps {
  health: number;
  ammunition: number;
  score: number;
}

export default function HUD({ health, ammunition, score }: HUDProps) {
  return (
    <div className="hud-container">
      <div className="hud-crosshair">
        <img
          src="/assets/generated/crosshair.dim_64x64.png"
          alt="crosshair"
          className="w-8 h-8 opacity-70"
        />
      </div>

      <div className="hud-top">
        <div className="hud-stat">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score}</span>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="hud-health">
          <span className="hud-label">Health</span>
          <HealthBar current={health} max={100} />
          <span className="hud-value-small">{health}/100</span>
        </div>

        <div className="hud-ammo">
          <span className="hud-label">Ammo</span>
          <span className="hud-value">{ammunition}</span>
        </div>
      </div>

      <footer className="hud-footer">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} • Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground/70 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
