import { Volume2, VolumeX } from "lucide-react";

interface HUDProps {
  health: number;
  ammunition: number;
  score: number;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTrack?: string;
  currentLevel?: number;
}

export default function HUD({
  health,
  ammunition,
  score,
  isMuted,
  onToggleMute,
  currentTrack,
  currentLevel = 1,
}: HUDProps) {
  const healthPct = Math.max(0, Math.min(100, health));
  const trackLabel =
    currentTrack === "diehard"
      ? "DIE HARD"
      : currentTrack === "bond"
        ? "BOND"
        : (currentTrack || "").toUpperCase();

  const healthColor =
    healthPct > 60
      ? "var(--gold)"
      : healthPct > 30
        ? "oklch(0.75 0.18 55)"
        : "oklch(0.55 0.22 25)";

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-40">
      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/assets/generated/crosshair-reticle.dim_64x64.png"
          alt=""
          className="w-12 h-12 opacity-80"
          style={{ filter: "drop-shadow(0 0 4px var(--gold))" }}
        />
      </div>

      {/* Top-left: Score */}
      <div className="absolute top-4 left-4 bond-hud-panel">
        <div className="bond-hud-label">SCORE</div>
        <div className="bond-hud-value">
          {score.toString().padStart(6, "0")}
        </div>
      </div>

      {/* Top-center: Level indicator */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 bond-hud-panel text-center"
        data-ocid="hud.panel"
      >
        <div className="bond-hud-label">LEVEL</div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "oklch(0.78 0.18 85)",
            textShadow: "0 0 10px oklch(0.78 0.18 85 / 0.6)",
          }}
        >
          {currentLevel}{" "}
          <span style={{ opacity: 0.4, fontSize: "0.7rem" }}>/ 10</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 2,
            marginTop: 4,
            justifyContent: "center",
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: level pips are positional display elements (levels 1-10)
              key={`hud-lvl-${i}`}
              style={{
                width: 6,
                height: 3,
                background:
                  i < currentLevel
                    ? "oklch(0.78 0.18 85)"
                    : "oklch(0.25 0.02 85)",
                boxShadow:
                  i < currentLevel
                    ? "0 0 4px oklch(0.78 0.18 85 / 0.6)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Top-right: Music control */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        <div className="bond-hud-panel flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="bond-hud-label">NOW PLAYING</div>
            <div className="bond-hud-track">{trackLabel}</div>
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className="bond-mute-btn"
            aria-label={isMuted ? "Unmute" : "Mute"}
            data-ocid="hud.toggle"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom-left: Health */}
      <div className="absolute bottom-6 left-4 bond-hud-panel">
        <div className="bond-hud-label">VITALS</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="bond-health-bar-bg">
            <div
              className="bond-health-bar-fill transition-all duration-300"
              style={{ width: `${healthPct}%`, backgroundColor: healthColor }}
            />
          </div>
          <span className="bond-hud-value text-sm">{health}</span>
        </div>
      </div>

      {/* Bottom-right: Ammo */}
      <div className="absolute bottom-6 right-4 bond-hud-panel text-right">
        <div className="bond-hud-label">AMMUNITION</div>
        <div className="bond-hud-value">{ammunition}</div>
        <div className="flex justify-end gap-1 mt-1">
          {Array.from({ length: Math.min(ammunition, 10) }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: ammo pips are positional and stable
            <div key={i} className="bond-ammo-pip" />
          ))}
        </div>
      </div>
    </div>
  );
}
