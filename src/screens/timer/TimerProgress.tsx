import { useEffect, useState } from "react";
import type { Pictogram } from "../../services/arasaac";

interface TimerProgressProps {
  totalMs: number;
  remainingMs: number;
  pictogram: Pictogram;
}

function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteLabel = minutes === 1 ? "minuto" : "minutos";
  const secondLabel = seconds === 1 ? "segundo" : "segundos";
  return `${minutes} ${minuteLabel} y ${seconds} ${secondLabel} restantes`;
}

export default function TimerProgress({
  totalMs,
  remainingMs,
  pictogram
}: TimerProgressProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const progress = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const strokeOffset = 515.22 * (1 - progress);
  const remainingSeconds = Math.max(
    0,
    Math.min(Math.ceil(totalMs / 1000), Math.ceil(remainingMs / 1000))
  );

  useEffect(() => {
    setImageFailed(false);
  }, [pictogram.imageUrl]);

  return (
    <div
      role="progressbar"
      aria-label={`Tiempo restante para ${pictogram.label}`}
      aria-valuemin={0}
      aria-valuemax={Math.ceil(totalMs / 1000)}
      aria-valuenow={remainingSeconds}
      aria-valuetext={formatRemainingTime(remainingMs)}
      className="relative flex h-72 w-72 items-center justify-center"
    >
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-slate-200"
        />
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="515.22"
          strokeDashoffset={strokeOffset}
          className="text-sky-700 transition-[stroke-dashoffset] duration-100"
        />
      </svg>
      <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white">
        {imageFailed ? (
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Figura genérica de tiempo para ${pictogram.label}`}
            className="h-28 w-28 text-slate-800"
          >
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="6" />
            <path
              d="M50 25v26l18 11M39 7h22M50 7v5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
            />
          </svg>
        ) : (
          <img
            src={pictogram.imageUrl}
            alt={pictogram.label}
            onError={() => setImageFailed(true)}
            className="h-28 w-28 object-contain"
          />
        )}
      </div>
    </div>
  );
}
