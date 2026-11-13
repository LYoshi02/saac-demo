import { useEffect, useId, useState } from "react";
import { unlockSequencerAudio } from "../soundAlert";
import { MAX_SEQUENCE_TIME_MINUTES, MAX_SEQUENCE_TIME_SECONDS } from "../types";

export interface SequenceTimerSetupModalProps {
  isOpen: boolean;
  sequenceName: string;
  isResuming: boolean;
  resumeStepNumber: number;
  onStartWithTime: (durationSeconds: number) => void;
  onStartWithoutTime: () => void;
  onClose: () => void;
}

/**
 * Modal previo al inicio de una secuencia que permite elegir de forma opcional
 * el tiempo disponible para completarla (con un máximo de 50 minutos).
 */
export default function SequenceTimerSetupModal({
  isOpen,
  sequenceName,
  isResuming,
  resumeStepNumber,
  onStartWithTime,
  onStartWithoutTime,
  onClose
}: SequenceTimerSetupModalProps) {
  const minutesInputId = useId();
  const secondsInputId = useId();

  const [minutesInput, setMinutesInput] = useState<string>("5");
  const [secondsInput, setSecondsInput] = useState<string>("0");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const parsedMinutes = minutesInput.trim() === "" ? 0 : Number.parseInt(minutesInput, 10);
  const parsedSeconds = secondsInput.trim() === "" ? 0 : Number.parseInt(secondsInput, 10);

  const safeMinutes = Number.isNaN(parsedMinutes) ? -1 : parsedMinutes;
  const safeSeconds = Number.isNaN(parsedSeconds) ? -1 : parsedSeconds;

  const totalSeconds =
    safeMinutes >= 0 && safeSeconds >= 0 ? safeMinutes * 60 + safeSeconds : -1;

  let validationError: string | null = null;
  if (safeMinutes < 0 || safeSeconds < 0) {
    validationError = "Ingresá un valor numérico válido en minutos y segundos.";
  } else if (safeSeconds > 59) {
    validationError = "Los segundos deben estar entre 0 y 59.";
  } else if (totalSeconds <= 0) {
    validationError =
      "Elegí una duración mayor a 0 segundos o iniciá la secuencia sin límite de tiempo.";
  } else if (totalSeconds > MAX_SEQUENCE_TIME_SECONDS) {
    validationError = `El tiempo máximo disponible es de ${MAX_SEQUENCE_TIME_MINUTES} minutos.`;
  }

  const handleConfirmWithTime = () => {
    if (validationError || totalSeconds <= 0 || totalSeconds > MAX_SEQUENCE_TIME_SECONDS) {
      return;
    }
    unlockSequencerAudio();
    onStartWithTime(totalSeconds);
  };

  const displayName = sequenceName.trim() || "Secuencia de pasos";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sequence-timer-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col gap-5 overflow-y-auto rounded-3xl border-2 border-violet-200 bg-white p-5 shadow-xl sm:p-7"
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            {isResuming && (
              <span className="mb-1.5 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-900">
                Retomando desde el paso {resumeStepNumber}
              </span>
            )}
            <h2
              id="sequence-timer-modal-title"
              className="text-2xl font-extrabold text-slate-900"
            >
              ¿Querés definir un tiempo para «{displayName}»?
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
          >
            ✕
          </button>
        </div>

        {/* Opción 1: Iniciar sin límite de tiempo */}
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Opción 1: Sin límite de tiempo
            </h3>
            <p className="text-xs font-medium text-slate-600">
              Avanzá paso a paso al ritmo del niño.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartWithoutTime}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
            </svg>
            <span>Iniciar sin tiempo</span>
          </button>
        </div>

        {/* Opción 2: Configurar tiempo disponible (máx. 50 minutos) */}
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Opción 2: Con tiempo disponible
            </h3>
            <p className="text-xs font-medium text-slate-600">
              Se mostrará una barra de tiempo restante y sonará una alerta al terminar.
            </p>
          </div>

          {/* Inputs manuales de minutos y segundos: 1 columna en móvil (ancho completo) y 2 columnas en pantallas medianas */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={minutesInputId}
                className="text-sm font-bold text-slate-800"
              >
                Minutos (0 a {MAX_SEQUENCE_TIME_MINUTES})
              </label>
              <input
                id={minutesInputId}
                type="number"
                min={0}
                max={MAX_SEQUENCE_TIME_MINUTES}
                inputMode="numeric"
                value={minutesInput}
                onChange={(event) => setMinutesInput(event.target.value)}
                className="min-h-[50px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold text-slate-900 focus:border-violet-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={secondsInputId}
                className="text-sm font-bold text-slate-800"
              >
                Segundos (0 a 59)
              </label>
              <input
                id={secondsInputId}
                type="number"
                min={0}
                max={59}
                inputMode="numeric"
                value={secondsInput}
                onChange={(event) => setSecondsInput(event.target.value)}
                className="min-h-[50px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold text-slate-900 focus:border-violet-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              />
            </div>
          </div>

          {validationError && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-900"
            >
              {validationError}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmWithTime}
            disabled={Boolean(validationError)}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
            </svg>
            <span>Iniciar con tiempo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
