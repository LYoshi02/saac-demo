interface TimerRemainingBarProps {
  totalMs: number;
  remainingMs: number;
  isWarning: boolean;
}

export default function TimerRemainingBar({
  totalMs,
  remainingMs,
  isWarning
}: TimerRemainingBarProps) {
  const progress = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const remainingSeconds = Math.max(
    0,
    Math.min(Math.ceil(totalMs / 1000), Math.ceil(remainingMs / 1000))
  );
  const visibleProgress = progress > 0 ? Math.max(progress, 0.015) : 0;

  return (
    <div className="w-full max-w-xl">
      <div
        role="progressbar"
        aria-label="Barra de tiempo restante"
        aria-valuemin={0}
        aria-valuemax={Math.ceil(totalMs / 1000)}
        aria-valuenow={remainingSeconds}
        className="h-8 overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100"
      >
        <div
          className={`h-full w-full origin-left rounded-full ${
            isWarning ? "bg-amber-600" : "bg-sky-700"
          }`}
          style={{ transform: `scaleX(${visibleProgress})` }}
        />
      </div>
    </div>
  );
}
