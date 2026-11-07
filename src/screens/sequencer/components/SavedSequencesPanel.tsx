import { useState } from "react";
import type { SavedSequence } from "../types";

export interface SavedSequencesPanelProps {
  savedSequences: SavedSequence[];
  onCreateNew: () => void;
  onSelectToEdit: (sequenceId: string) => void;
  onSelectToExecute: (sequenceId: string, resumeFromSavedStep: boolean) => void;
  onDelete: (sequenceId: string) => void;
}

const BASE_BUTTON_CLASS =
  "inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 text-sm font-bold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Pantalla principal del Secuenciador: muestra el listado de secuencias guardadas
 * y el botón para ir a la pantalla de creación de una nueva secuencia (HU-07, HU-08 y HU-09).
 */
export default function SavedSequencesPanel({
  savedSequences,
  onCreateNew,
  onSelectToEdit,
  onSelectToExecute,
  onDelete
}: SavedSequencesPanelProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  return (
    <section
      aria-label="Secuencias guardadas"
      className="flex flex-col gap-6 rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      {/* Encabezado con contador y botón principal para crear nueva secuencia */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Mis secuencias guardadas
              </h2>
              <span className="rounded-full bg-violet-100 px-3 py-0.5 text-sm font-bold text-violet-900">
                {savedSequences.length}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">
              Elegí una rutina guardada para mostrarla paso a paso o creá una nueva.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-violet-600 px-6 text-base font-extrabold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
        >
          + Crear nueva secuencia
        </button>
      </div>

      {/* Estado vacío si el usuario borró todas las secuencias */}
      {savedSequences.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-violet-300 bg-slate-50 p-10 text-center">
          <p className="text-xl font-bold text-slate-900">
            Todavía no tenés secuencias guardadas
          </p>
          <p className="max-w-md text-base text-slate-600">
            Creá tu primera secuencia de pasos con pictogramas para usarla con el niño.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-violet-600 px-6 text-base font-extrabold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
          >
            + Crear nueva secuencia
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {savedSequences.map((seq) => {
            const hasPausedStep =
              seq.lastViewedStepIndex !== null &&
              seq.lastViewedStepIndex >= 0 &&
              seq.lastViewedStepIndex < seq.steps.length;
            const isConfirmingDelete = confirmingDeleteId === seq.id;

            return (
              <li
                key={seq.id}
                className="flex flex-col justify-between gap-5 rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 transition hover:border-violet-300"
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {seq.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {seq.steps.length} pasos
                      {hasPausedStep &&
                        ` · Quedó en el paso ${(seq.lastViewedStepIndex ?? 0) + 1}`}
                    </p>
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
                  <div className="flex flex-col gap-2.5 pt-1">
                    {/* Fila 1: Acciones de ejecución */}
                    {hasPausedStep ? (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => onSelectToExecute(seq.id, true)}
                          disabled={seq.steps.length < 2}
                          className={`${BASE_BUTTON_CLASS} border-2 border-violet-600 bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus-visible:ring-violet-300`}
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
                          <span>Retomar (paso {(seq.lastViewedStepIndex ?? 0) + 1})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectToExecute(seq.id, false)}
                          disabled={seq.steps.length < 2}
                          className={`${BASE_BUTTON_CLASS} border-2 border-violet-300 bg-white text-violet-900 hover:bg-violet-50 focus-visible:ring-violet-300`}
                        >
                          <span>↻ Desde el inicio</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectToExecute(seq.id, false)}
                        disabled={seq.steps.length < 2}
                        className={`${BASE_BUTTON_CLASS} w-full border-2 border-violet-600 bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus-visible:ring-violet-300`}
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
                        <span>Ejecutar secuencia</span>
                      </button>
                    )}

                    {/* Fila 2: Acciones de gestión (Editar y Borrar con el mismo ancho y estilo base) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectToEdit(seq.id)}
                        className={`${BASE_BUTTON_CLASS} border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:ring-violet-300`}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(seq.id)}
                        className={`${BASE_BUTTON_CLASS} border-2 border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50 focus-visible:ring-red-300`}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-2xl border-2 border-red-300 bg-red-50 p-3.5">
                    <span className="text-sm font-bold text-red-900">
                      ¿Seguro que querés borrar «{seq.name}»?
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(seq.id);
                          setConfirmingDeleteId(null);
                        }}
                        className={`${BASE_BUTTON_CLASS} border-2 border-red-600 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300`}
                      >
                        Sí, borrar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className={`${BASE_BUTTON_CLASS} border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-400`}
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
      )}
    </section>
  );
}
