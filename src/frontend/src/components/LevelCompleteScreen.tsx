import { useEffect, useState } from "react";
import "../styles/game-theme.css";

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  isGameComplete: boolean;
  onNextMission: () => void;
}

export default function LevelCompleteScreen({
  level,
  score,
  isGameComplete,
  onNextMission,
}: LevelCompleteScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: isGameComplete
          ? "oklch(0.04 0.01 85 / 0.97)"
          : "oklch(0.04 0 0 / 0.95)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease-in",
      }}
      data-ocid="level_complete.modal"
    >
      <div className="absolute inset-0 scan-line-overlay" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
        <div
          className="absolute top-6 left-6 w-16 h-px"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
        <div
          className="absolute top-6 left-6 w-px h-16"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none">
        <div
          className="absolute top-6 right-6 w-16 h-px"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
        <div
          className="absolute top-6 right-6 w-px h-16"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none">
        <div
          className="absolute bottom-6 left-6 w-16 h-px"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
        <div
          className="absolute bottom-6 left-6 w-px h-16"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
        <div
          className="absolute bottom-6 right-6 w-16 h-px"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
        <div
          className="absolute bottom-6 right-6 w-px h-16"
          style={{ background: "oklch(0.78 0.18 85 / 0.6)" }}
        />
      </div>

      <div
        className="absolute left-0 right-0"
        style={{
          top: "15%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, oklch(0.78 0.18 85 / 0.4), transparent)",
        }}
      />
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: "15%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, oklch(0.78 0.18 85 / 0.4), transparent)",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-8 px-8 text-center"
        style={{ maxWidth: 560 }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.6rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "oklch(0.78 0.18 85 / 0.45)",
          }}
        >
          {isGameComplete ? "OPERATION COMPLETE" : "AFTER ACTION REPORT"}
        </p>

        <div className="flex flex-col items-center gap-2">
          {isGameComplete ? (
            <>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "oklch(0.78 0.18 85 / 0.6)",
                }}
              >
                ALL 10 LEVELS CLEARED
              </div>
              <h1
                className="title-reveal"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 6vw, 3.5rem)",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "oklch(0.78 0.18 85)",
                  textShadow:
                    "0 0 40px oklch(0.78 0.18 85 / 0.7), 0 0 80px oklch(0.78 0.18 85 / 0.3)",
                  lineHeight: 1.1,
                }}
              >
                MISSION
                <br />
                COMPLETE
              </h1>
            </>
          ) : (
            <>
              <h1
                className="title-reveal"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem, 5vw, 3rem)",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "oklch(0.78 0.18 85)",
                  textShadow: "0 0 30px oklch(0.78 0.18 85 / 0.6)",
                  lineHeight: 1.1,
                }}
              >
                LEVEL {level}
                <br />
                COMPLETE
              </h1>
              <div
                style={{
                  width: 80,
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.78 0.18 85), transparent)",
                  marginTop: "0.25rem",
                }}
              />
            </>
          )}
        </div>

        <div
          style={{
            background: "oklch(0.06 0.01 85 / 0.9)",
            border: "1px solid oklch(0.78 0.18 85 / 0.25)",
            padding: "1rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            boxShadow: "0 0 20px oklch(0 0 0 / 0.5)",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "oklch(0.78 0.18 85 / 0.5)",
            }}
          >
            MISSION SCORE
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "oklch(0.78 0.18 85)",
              textShadow: "0 0 15px oklch(0.78 0.18 85 / 0.5)",
            }}
          >
            {score.toString().padStart(6, "0")}
          </span>
        </div>

        {!isGameComplete && (
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: level pips are positional display elements (levels 1-10)
                key={`lvl-pip-${i}`}
                style={{
                  width: i < level ? 20 : 8,
                  height: 6,
                  background:
                    i < level ? "oklch(0.78 0.18 85)" : "oklch(0.25 0.02 85)",
                  boxShadow:
                    i < level ? "0 0 6px oklch(0.78 0.18 85 / 0.6)" : "none",
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </div>
        )}

        {isGameComplete ? (
          <button
            type="button"
            className="btn-bond-primary"
            onClick={onNextMission}
            style={{
              padding: "0.9rem 3rem",
              fontSize: "0.8rem",
              letterSpacing: "0.3em",
              cursor: "pointer",
              minWidth: 240,
              boxShadow: "0 0 30px oklch(0.78 0.18 85 / 0.4)",
            }}
            data-ocid="level_complete.confirm_button"
          >
            PLAY AGAIN
          </button>
        ) : (
          <button
            type="button"
            className="btn-bond-primary"
            onClick={onNextMission}
            style={{
              padding: "0.85rem 3rem",
              fontSize: "0.8rem",
              letterSpacing: "0.3em",
              cursor: "pointer",
              minWidth: 220,
            }}
            data-ocid="level_complete.confirm_button"
          >
            NEXT MISSION — LVL {level + 1}
          </button>
        )}

        <div
          style={{
            width: "100%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.18 85 / 0.2), transparent)",
          }}
        />

        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.55rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "oklch(0.78 0.18 85 / 0.25)",
            textAlign: "center",
          }}
        >
          © 2026 TIMELESS. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
