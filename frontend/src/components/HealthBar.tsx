interface HealthBarProps {
  current: number;
  max: number;
}

export default function HealthBar({ current, max }: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="health-bar-container">
      <div className="health-bar-bg">
        <div
          className="health-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
