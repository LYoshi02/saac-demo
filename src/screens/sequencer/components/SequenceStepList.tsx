import { useState, type DragEvent } from "react";
import type { SequenceStep } from "../types";

export interface SequenceStepListProps {
  steps: SequenceStep[];
  lastViewedStepIndex: number | null;
  onMoveStep: (fromIndex: number, toIndex: number) => void;
  onUpdateStepText: (stepId: string, text: string) => void;
  onRequestChangePictogram: (stepId: string) => void;
  onRemoveStep: (stepId: string) => void;
  onRequestAddStep: () => void;
}

/**
 * Lista editable y reordenable de pasos de una secuencia (HU-07 / CU-06).
 * Soporta tanto arrastrar y soltar (Drag & Drop) como botones con flechas (Subir / Bajar).
 */
export default function SequenceStepList({
  steps,
  lastViewedStepIndex,
  onMoveStep,
  onUpdateStepText,
  onRequestChangePictogram,
  onRemoveStep,
  onRequestAddStep
}: SequenceStepListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (event: DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex =
      draggedIndex !== null
        ? draggedIndex
        : Number.parseInt(event.dataTransfer.getData("text/plain"), 10);

    if (!Number.isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      onMoveStep(sourceIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-violet-300 bg-white p-10 text-center">
        <p className="text-xl font-bold text-slate-900">
          Todavía no agregaste pasos a esta secuencia
        </p>
        <p className="max-w-md text-base text-slate-600">
          Agregá al menos 2 pasos con sus pictogramas para armar la rutina y poder mostrarla paso a paso.
        </p>
        <button
          type="button"
          onClick={onRequestAddStep}
          className="min-h-[52px] rounded-2xl bg-violet-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
        >
          + Agregar primer paso
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-slate-600">
        Podés cambiar el orden arrastrando cada paso o usando los botones de flechas (↑ / ↓).
      </p>

      <ol className="flex flex-col gap-4" aria-label="Pasos de la secuencia">
        {steps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;
          const isLastViewed = lastViewedStepIndex === index;

          return (
            <li
              key={step.id}
              draggable
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={handleDragEnd}
              className={`flex flex-col gap-4 rounded-3xl border-2 bg-white p-4 shadow-sm transition sm:flex-row sm:items-center sm:p-5 ${
                isDragOver
                  ? "border-violet-600 bg-violet-50 ring-4 ring-violet-200"
                  : isDragging
                    ? "border-violet-300 opacity-60"
                    : "border-slate-200 hover:border-violet-300"
              }`}
            >
              {/* Número de paso e indicador de arrastre */}
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:justify-center">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    title="Arrastrá para cambiar el orden"
                    className="cursor-grab select-none px-1 text-xl font-bold text-slate-400 active:cursor-grabbing"
                  >
                    ⋮⋮
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-lg font-extrabold text-violet-900">
                    {index + 1}
                  </span>
                </div>

                {isLastViewed && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                    Último visto
                  </span>
                )}
              </div>

              {/* Pictograma del paso con botón para cambiarlo */}
              <button
                type="button"
                onClick={() => onRequestChangePictogram(step.id)}
                title="Cambiar pictograma de este paso"
                className="group relative flex h-28 w-full shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 p-2 transition hover:border-violet-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:h-28 sm:w-28"
              >
                <img
                  src={step.pictogram.imageUrl}
                  alt={step.pictogram.label}
                  className="h-20 w-20 object-contain"
                />
                <span className="mt-1 text-xs font-semibold text-violet-700 group-hover:underline">
                  Cambiar imagen
                </span>
              </button>

              {/* Texto descriptivo del paso */}
              <div className="flex flex-1 flex-col gap-1.5">
                <label
                  htmlFor={`step-text-${step.id}`}
                  className="text-sm font-bold text-slate-700"
                >
                  Descripción del paso {index + 1}
                </label>
                <input
                  id={`step-text-${step.id}`}
                  type="text"
                  value={step.text}
                  onChange={(event) => onUpdateStepText(step.id, event.target.value)}
                  placeholder="Escribí la instrucción de este paso…"
                  className="min-h-[48px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-900 focus:border-violet-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
                />
              </div>

              {/* Controles de orden (flechas) y eliminación */}
              <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => onMoveStep(index, index - 1)}
                  disabled={isFirst}
                  aria-label={`Subir paso ${index + 1}`}
                  title="Subir paso"
                  className="min-h-[48px] min-w-[48px] rounded-2xl border-2 border-slate-300 bg-white px-3 py-2 text-base font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↑ Subir
                </button>

                <button
                  type="button"
                  onClick={() => onMoveStep(index, index + 1)}
                  disabled={isLast}
                  aria-label={`Bajar paso ${index + 1}`}
                  title="Bajar paso"
                  className="min-h-[48px] min-w-[48px] rounded-2xl border-2 border-slate-300 bg-white px-3 py-2 text-base font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↓ Bajar
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveStep(step.id)}
                  aria-label={`Eliminar paso ${index + 1}: ${step.text}`}
                  title="Eliminar paso"
                  className="min-h-[48px] rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-2 text-base font-bold text-red-800 transition hover:border-red-400 hover:bg-red-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                >
                  Quitar
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

