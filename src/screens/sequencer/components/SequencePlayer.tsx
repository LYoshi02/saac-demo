import { useEffect } from "react";
import type { SequenceStep } from "../types";

export interface SequencePlayerProps {
  sequenceName: string;
  steps: SequenceStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/**
 * Vista de ejecución paso a paso a pantalla completa y pantalla de cierre (HU-08 / CU-07).
 * Diseñada con botones de gran tamaño, alto contraste y guía visual comprensible sin leer números.
 */
export default function SequencePlayer({
  sequenceName,
  steps,
  currentStepIndex,
  isCompleted,
  onNext,
  onPrev,
  onRestart,
  onExit
}: SequencePlayerProps) {
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const displayTitle = sequenceName.trim() || "Secuencia paso a paso";

  // Soporte de navegación por teclado para accesibilidad
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onExit();
      } else if (event.key === "ArrowRight" && !isCompleted) {
        onNext();
      } else if (event.key === "ArrowLeft" && (!isFirstStep || isCompleted)) {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCompleted, isFirstStep, onExit, onNext, onPrev]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ejecutando rutina: ${displayTitle}`}
      className="fixed inset-0 z-40 flex flex-col bg-slate-50"
    >
      {/* Encabezado con salida y barra de progreso visual por bloques */}
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
                ? "Secuencia completada"
                : `Paso ${currentStepIndex + 1} de ${steps.length}`
            }
            className="flex items-center gap-2"
          >
            {steps.map((step, idx) => {
              const isDone = isCompleted || idx < currentStepIndex;
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

      {/* Contenido central a pantalla completa */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
        {!isCompleted && currentStep ? (
          <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-4 border-violet-200 bg-white p-6 text-center shadow-md sm:p-10">
            <span className="rounded-full bg-violet-100 px-5 py-1.5 text-base font-extrabold text-violet-900">
              Paso {currentStepIndex + 1} de {steps.length}
            </span>

            {/* Pictograma principal de gran tamaño */}
            <div className="flex h-64 w-64 items-center justify-center rounded-3xl border-2 border-slate-100 bg-white p-4 sm:h-80 sm:w-80">
              <img
                src={currentStep.pictogram.imageUrl}
                alt={currentStep.text || currentStep.pictogram.label}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Texto del paso con alto contraste */}
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {currentStep.text || currentStep.pictogram.label}
            </p>
          </div>
        ) : (
          /* Pantalla de cierre al completar todos los pasos (HU-08 / CU-07 paso 5) */
          <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-4 border-emerald-300 bg-white p-8 text-center shadow-md sm:p-12">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl font-extrabold text-emerald-700">
              ✓
            </div>

            <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              ¡Muy bien! Terminaste la rutina
            </h3>

            <p className="max-w-lg text-lg font-medium text-slate-700">
              Completaste todos los pasos de{" "}
              <span className="font-bold text-slate-900">«{displayTitle}»</span>.
            </p>

            {/* Resumen visual de los pasos completados */}
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-3"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white p-1.5">
                    <img
                      src={step.pictogram.imageUrl}
                      alt={step.text}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="line-clamp-2 text-sm font-bold text-slate-900">
                    {index + 1}. {step.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onRestart}
                className="min-h-[60px] rounded-3xl border-2 border-violet-600 bg-white px-7 py-3.5 text-lg font-extrabold text-violet-800 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                ↻ Repetir secuencia
              </button>

              <button
                type="button"
                onClick={onExit}
                className="min-h-[60px] rounded-3xl bg-emerald-600 px-8 py-3.5 text-lg font-extrabold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
              >
                Finalizar y volver
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Barra inferior con botones grandes "Anterior" y "Siguiente" (HU-08) */}
      {!isCompleted && (
        <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirstStep}
              className="min-h-[68px] flex-1 rounded-3xl border-2 border-slate-300 bg-white px-6 py-4 text-xl font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-xs"
            >
              ← Anterior
            </button>

            <button
              type="button"
              onClick={onNext}
              className="min-h-[68px] flex-[2] rounded-3xl bg-violet-600 px-8 py-4 text-2xl font-extrabold text-white shadow-md transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 active:scale-[0.99]"
            >
              {isLastStep ? "¡Terminar! ✓" : "Siguiente →"}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

