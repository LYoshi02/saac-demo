import { useState } from "react";
import type { SavedSequence } from "../types";

export interface SavedSequencesPanelProps {
  savedSequences: SavedSequence[];
  activeSavedId: string | null;
  onSelectToEdit: (sequenceId: string) => void;
  onSelectToExecute: (sequenceId: string) => void;
  onDelete: (sequenceId: string) => void;
}

/**
 * Lista de secuencias guardadas para reutilizar en distintas sesiones (HU-09 / CU-08).
 */
export default function SavedSequencesPanel({
  savedSequences,
  activeSavedId,
  onSelectToEdit,
  onSelectToExecute,
  onDelete
}: SavedSequencesPanelProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  if (savedSequences.length === 0) {
    return (
      <section
        aria-label="Secuencias guardadas"
        className="rounded-3xl border-2 border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-bold text-slate-900">Secuencias guardadas</h2>
        <p className="mt-1 text-sm text-slate-600">
          Todavía no hay secuencias guardadas. Armá una rutina con al menos 2 pasos y presioná «Guardar secuencia» para reutilizarla cuando quieras.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Secuencias guardadas"
      className="flex flex-col gap-4 rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Mis secuencias guardadas
          </h2>
          <p className="text-sm text-slate-600">
            Elegí una rutina guardada para mostrarla paso a paso o editarla.
          </p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-900">
          {savedSequences.length}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {savedSequences.map((seq) => {
          const isCurrent = seq.id === activeSavedId;
          const hasPausedStep =
            seq.lastViewedStepIndex !== null &&
            seq.lastViewedStepIndex >= 0 &&
            seq.lastViewedStepIndex < seq.steps.length;
          const isConfirmingDelete = confirmingDeleteId === seq.id;

          return (
            <li
              key={seq.id}
              className={`flex flex-col justify-between gap-4 rounded-3xl border-2 p-4 transition ${
                isCurrent
                  ? "border-violet-600 bg-violet-50/50"
                  : "border-slate-200 bg-slate-50 hover:border-violet-300"
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {seq.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {seq.steps.length} pasos
                      {hasPausedStep &&
                        ` · Quedó en el paso ${(seq.lastViewedStepIndex ?? 0) + 1}`}
                    </p>
                  </div>

                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-violet-700 px-3 py-1 text-xs font-bold text-white">
                      Abierta
                    </span>
                  )}
                </div>

                {/* Miniaturas de los pasos de la secuencia */}
                <div className="flex flex-wrap items-center gap-2">
                  {seq.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      title={`${idx + 1}. ${step.text}`}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white p-1.5"
                    >
                      <img
                        src={step.pictogram.imageUrl}
                        alt={step.text}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones sobre la secuencia guardada */}
              {!isConfirmingDelete ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectToExecute(seq.id)}
                    disabled={seq.steps.length < 2}
                    className="min-h-[48px] flex-1 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {hasPausedStep
                      ? `▶ Retomar (paso ${(seq.lastViewedStepIndex ?? 0) + 1})`
                      : "▶ Ejecutar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectToEdit(seq.id)}
                    className="min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(seq.id)}
                    className="min-h-[48px] rounded-2xl border-2 border-red-200 bg-white px-3.5 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                  >
                    Borrar
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-red-300 bg-red-50 p-3">
                  <span className="text-sm font-bold text-red-900">
                    ¿Seguro que querés borrar «{seq.name}»?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(seq.id);
                        setConfirmingDeleteId(null);
                      }}
                      className="min-h-[44px] rounded-xl bg-red-600 px-3.5 py-1.5 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                    >
                      Sí, borrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(null)}
                      className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

