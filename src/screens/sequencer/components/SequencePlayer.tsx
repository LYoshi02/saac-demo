import { useEffect } from "react";
import { unlockSequencerAudio } from "../soundAlert";
import type { SequenceCompletionReason, SequenceStep } from "../types";

export interface SequencePlayerProps {
  sequenceName: string;
  steps: SequenceStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  completionReason: SequenceCompletionReason | null;
  configuredDurationSeconds: number | null;
  remainingSeconds: number | null;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onExit: () => void;
}

function formatRemainingTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Vista de ejecución paso a paso a pantalla completa y pantalla de cierre (HU-08 / CU-07).
 * Diseñada con botones de gran tamaño, alto contraste, indicador visual de tiempo restante
 * (cuando se eligió tiempo límite) y guía visual comprensible sin leer números.
 */
export default function SequencePlayer({
  sequenceName,
  steps,
  currentStepIndex,
  isCompleted,
  completionReason,
  configuredDurationSeconds,
  remainingSeconds,
  onNext,
  onPrev,
  onRestart,
  onExit
}: SequencePlayerProps) {
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const displayTitle = sequenceName.trim() || "Secuencia paso a paso";

  const hasTimer =
    configuredDurationSeconds !== null &&
    configuredDurationSeconds > 0 &&
    remainingSeconds !== null;

  const progressRatio = hasTimer
    ? Math.max(0, Math.min(1, remainingSeconds / configuredDurationSeconds))
    : 1;
  const progressPercent = Math.round(progressRatio * 100);

  // Clases estáticas de Tailwind según el porcentaje de tiempo restante (alto contraste WCAG AA)
  const timerBarColorClass =
    progressRatio > 0.5
      ? "bg-violet-600"
      : progressRatio > 0.2
        ? "bg-amber-500"
        : "bg-red-600";

  const timerBadgeColorClass =
    progressRatio > 0.5
      ? "border-violet-200 bg-violet-50 text-violet-900"
      : progressRatio > 0.2
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-red-300 bg-red-50 text-red-900";

  const isTimeExpired = isCompleted && completionReason === "time_expired";

  // Soporte de navegación por teclado para accesibilidad
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onExit();
      } else if (event.key === "ArrowRight" && !isCompleted) {
        onNext();
      } else if (
        event.key === "ArrowLeft" &&
        (!isFirstStep || (isCompleted && completionReason !== "time_expired"))
      ) {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCompleted, completionReason, isFirstStep, onExit, onNext, onPrev]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ejecutando rutina: ${displayTitle}`}
      className="fixed inset-0 z-40 flex flex-col bg-slate-50"
    >
      {/* Encabezado con salida y barra de progreso por pasos */}
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="min-h-[52px] rounded-2xl border-2 border-slate-300 bg-white px-5 py-2.5 text-base font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
            >
              ← Salir
            </button>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              {displayTitle}
            </h2>
          </div>

          {/* Indicador visual de progreso por bloques (comprensible sin leer números) */}
          <div
            aria-label={
              isCompleted
                ? "Secuencia finalizada"
                : `Paso ${currentStepIndex + 1} de ${steps.length}`
            }
            className="flex flex-wrap items-center gap-1.5 sm:gap-2"
          >
            {steps.map((step, idx) => {
              const isDone =
                (isCompleted && !isTimeExpired) || idx < currentStepIndex;
              const isCurrent = !isCompleted && idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex h-12 items-center justify-center rounded-2xl border-2 px-2.5 transition-all ${
                    isCurrent
                      ? "scale-110 border-violet-700 bg-violet-600 text-white shadow-sm ring-4 ring-violet-200"
                      : isDone
                        ? "border-emerald-600 bg-emerald-500 text-white"
                        : "border-slate-300 bg-slate-200 text-slate-600"
                  }`}
                  title={step.text}
                >
                  <img
                    src={step.pictogram.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-8 rounded-lg bg-white object-contain p-0.5"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Indicador visual continuo del tiempo restante sin bordes ni fondo blanco envolvente */}
      {hasTimer && !isCompleted && (
        <section
          aria-label="Tiempo restante de la rutina"
          className="w-full px-4 pt-4 sm:px-6"
        >
          <div
            role="timer"
            aria-label={`Tiempo restante: ${formatRemainingTime(remainingSeconds)}`}
            className="mx-auto flex max-w-5xl flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4"
          >
            <div
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-xl border px-3 py-1 text-sm font-extrabold sm:self-auto ${timerBadgeColorClass}`}
            >
              <span aria-hidden="true" className="text-base">
                ⏱
              </span>
              <span>Tiempo restante: {formatRemainingTime(remainingSeconds)}</span>
            </div>

            {/* Barra visual continua que se vacía a medida que corre el tiempo (comprensible sin leer números) */}
            <div
              aria-hidden="true"
              className="h-5 w-full overflow-hidden rounded-full border-2 border-slate-300 bg-slate-200 p-0.5"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ease-linear ${timerBarColorClass}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Contenido central a pantalla completa */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {!isCompleted && currentStep ? (
          <div className="my-auto flex w-full flex-col items-center gap-5 rounded-3xl border-4 border-violet-200 bg-white p-5 text-center shadow-md sm:gap-6 sm:p-10">
            <span className="rounded-full bg-violet-100 px-5 py-1.5 text-base font-extrabold text-violet-900">
              Paso {currentStepIndex + 1} de {steps.length}
            </span>

            {/* Pictograma principal de gran tamaño */}
            <div className="flex h-56 w-56 items-center justify-center rounded-3xl border-2 border-slate-100 bg-white p-4 sm:h-80 sm:w-80">
              <img
                src={currentStep.pictogram.imageUrl}
                alt={currentStep.text || currentStep.pictogram.label}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Texto del paso con alto contraste */}
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {currentStep.text || currentStep.pictogram.label}
            </p>
          </div>
        ) : (
          /* Pantalla de cierre al completar todos los pasos o al terminar el tiempo (HU-08 / CU-07 paso 5) */
          <div
            className={`my-auto flex w-full flex-col items-center gap-4 rounded-3xl border-4 bg-white p-5 text-center shadow-md sm:gap-6 sm:p-10 ${
              isTimeExpired ? "border-amber-400" : "border-emerald-300"
            }`}
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl font-extrabold leading-none sm:h-24 sm:w-24 sm:text-5xl ${
                isTimeExpired
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isTimeExpired ? (
                <span
                  aria-hidden="true"
                  className="inline-block -translate-y-[3px] leading-none select-none sm:-translate-y-[4.5px]"
                >
                  ⏰
                </span>
              ) : (
                <span aria-hidden="true" className="inline-block leading-none select-none">
                  ✓
                </span>
              )}
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 sm:text-4xl">
              {isTimeExpired
                ? "¡Se terminó el tiempo de la secuencia!"
                : "¡Muy bien! Terminaste la rutina"}
            </h3>

            <p className="max-w-lg text-base font-medium text-slate-700 sm:text-lg">
              {isTimeExpired ? (
                <>
                  Finalizó el tiempo disponible para{" "}
                  <span className="font-bold text-slate-900">«{displayTitle}»</span>.
                </>
              ) : (
                <>
                  Completaste todos los pasos de{" "}
                  <span className="font-bold text-slate-900">«{displayTitle}»</span>.
                </>
              )}
            </p>

            {/* Resumen visual de los pasos de la secuencia */}
            <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2.5 sm:p-3 ${
                    isTimeExpired
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-emerald-200 bg-emerald-50/60"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1.5 sm:h-20 sm:w-20">
                    <img
                      src={step.pictogram.imageUrl}
                      alt={step.text}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="line-clamp-2 text-xs font-bold text-slate-900 sm:text-sm">
                    {index + 1}. {step.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-1 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  if (hasTimer) {
                    unlockSequencerAudio();
                  }
                  onRestart();
                }}
                className="min-h-[54px] w-full rounded-2xl border-2 border-violet-600 bg-white px-6 py-3 text-base font-extrabold text-violet-800 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:min-h-[60px] sm:w-auto sm:rounded-3xl sm:px-7 sm:py-3.5 sm:text-lg"
              >
                ↻ Repetir secuencia
              </button>

              <button
                type="button"
                onClick={onExit}
                className="min-h-[54px] w-full rounded-2xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:min-h-[60px] sm:w-auto sm:rounded-3xl sm:px-8 sm:py-3.5 sm:text-lg"
              >
                Finalizar y volver
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Barra inferior con botones grandes "Anterior" y "Siguiente" (HU-08) */}
      {!isCompleted && (
        <footer className="border-t border-slate-200 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirstStep}
              className="inline-flex min-h-[56px] items-center justify-center whitespace-nowrap rounded-2xl border-2 border-slate-300 bg-white px-3 py-3 text-base font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[68px] sm:rounded-3xl sm:px-6 sm:py-4 sm:text-xl"
            >
              ← Anterior
            </button>

            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-h-[56px] items-center justify-center whitespace-nowrap rounded-2xl bg-violet-600 px-3 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 active:scale-[0.99] sm:min-h-[68px] sm:rounded-3xl sm:px-6 sm:py-4 sm:text-xl"
            >
              {isLastStep ? "¡Terminar! ✓" : "Siguiente →"}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
