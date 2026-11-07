import { useId, useState } from "react";
import { PictogramPickerModal } from "../../components/pictogram-picker";
import ScreenLayout from "../../components/ScreenLayout";
import type { Pictogram } from "../../services/arasaac";
import SavedSequencesPanel from "./components/SavedSequencesPanel";
import SequencePlayer from "./components/SequencePlayer";
import SequenceStepList from "./components/SequenceStepList";
import { useSequencer } from "./useSequencer";

interface SequencerScreenProps {
  onBack: () => void;
}

/**
 * Módulo Secuenciador de rutinas (HU-07, HU-08 y HU-09 / CU-06, CU-07 y CU-08).
 * Permite armar secuencias de pasos con pictogramas reordenables, guardarlas con nombre único
 * y ejecutarlas paso a paso a pantalla completa conservando el último paso visto al salir.
 */
export default function SequencerScreen({ onBack }: SequencerScreenProps) {
  const sequenceNameInputId = useId();
  const {
    draft,
    savedSequences,
    canExecute,
    hasResumePoint,
    isPlaying,
    currentStepIndex,
    isCompleted,
    startNewSequence,
    setDraftName,
    addStep,
    updateStepText,
    updateStepPictogram,
    removeStep,
    moveStep,
    saveCurrentSequence,
    loadSavedSequence,
    deleteSavedSequence,
    startExecution,
    nextStep,
    prevStep,
    exitExecution
  } = useSequencer();

  // Estado del selector de pictogramas (para agregar un nuevo paso o cambiar el de un paso existente)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  // Mensajes de feedback al guardar la secuencia (HU-09)
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleOpenPickerForNewStep = () => {
    setEditingStepId(null);
    setIsPickerOpen(true);
  };

  const handleOpenPickerForExistingStep = (stepId: string) => {
    setEditingStepId(stepId);
    setIsPickerOpen(true);
  };

  const handleSelectPictogram = (pictogram: Pictogram) => {
    if (editingStepId) {
      updateStepPictogram(editingStepId, pictogram);
    } else {
      addStep(pictogram);
    }
    setSaveFeedback(null);
  };

  const handleSaveSequence = () => {
    const result = saveCurrentSequence(draft.name);
    if (!result.ok) {
      setSaveFeedback({
        type: "error",
        message: result.error ?? "No se pudo guardar la secuencia."
      });
      return;
    }

    setSaveFeedback({
      type: "success",
      message: `Secuencia «${draft.name.trim()}» guardada correctamente.`
    });
  };

  const handleStartNewSequence = () => {
    startNewSequence();
    setSaveFeedback(null);
  };

  const currentlyEditingStep = editingStepId
    ? draft.steps.find((step) => step.id === editingStepId) ?? null
    : null;

  return (
    <ScreenLayout title="Secuenciador" onBack={onBack}>
      <div className="flex flex-col gap-8">
        {/* Panel de secuencias guardadas para reutilizar en otras sesiones (HU-09 / CU-08) */}
        <SavedSequencesPanel
          savedSequences={savedSequences}
          activeSavedId={draft.savedId}
          onSelectToEdit={(id) => {
            loadSavedSequence(id, false);
            setSaveFeedback(null);
          }}
          onSelectToExecute={(id) => {
            loadSavedSequence(id, true);
            setSaveFeedback(null);
          }}
          onDelete={deleteSavedSequence}
        />

        {/* Panel principal de edición y ejecución de la secuencia activa (HU-07, HU-08 y HU-09) */}
        <section
          aria-label="Editor de secuencia actual"
          className="flex flex-col gap-6 rounded-3xl border-2 border-violet-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {/* Encabezado del editor: título y botón "Nueva secuencia" */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {draft.savedId ? "Editando secuencia" : "Nueva secuencia de pasos"}
              </h2>
              <p className="text-sm text-slate-600">
                Armá los pasos de la rutina con pictogramas y mostralos a pantalla completa.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartNewSequence}
              className="min-h-[48px] rounded-2xl border-2 border-violet-300 bg-violet-50 px-4 py-2 text-base font-bold text-violet-900 transition hover:bg-violet-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
            >
              + Nueva secuencia en blanco
            </button>
          </div>

          {/* Nombre de la secuencia y botón Guardar (HU-09 / CU-08) */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor={sequenceNameInputId}
              className="text-base font-bold text-slate-800"
            >
              Nombre de la secuencia (para guardarla y reutilizarla)
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id={sequenceNameInputId}
                type="text"
                value={draft.name}
                onChange={(event) => {
                  setDraftName(event.target.value);
                  setSaveFeedback(null);
                }}
                placeholder="Ej. Lavarse los dientes, Preparar la mochila, Antes de dormir…"
                className="min-h-[52px] flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              />
              <button
                type="button"
                onClick={handleSaveSequence}
                className="min-h-[52px] shrink-0 rounded-2xl border-2 border-violet-600 bg-white px-6 py-2.5 text-base font-extrabold text-violet-800 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                Guardar secuencia
              </button>
            </div>

            {saveFeedback && (
              <div
                role={saveFeedback.type === "error" ? "alert" : "status"}
                className={`mt-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-bold ${
                  saveFeedback.type === "error"
                    ? "border-red-300 bg-red-50 text-red-900"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900"
                }`}
              >
                {saveFeedback.message}
              </div>
            )}
          </div>

          {/* Barra de acciones: Agregar paso y Ejecutar (con validación de mínimo 2 pasos de HU-07) */}
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenPickerForNewStep}
                className="min-h-[52px] rounded-2xl bg-violet-600 px-5 py-2.5 text-base font-extrabold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
              >
                + Agregar paso con pictograma
              </button>

              <span className="text-sm font-bold text-slate-700">
                Total: {draft.steps.length}{" "}
                {draft.steps.length === 1 ? "paso" : "pasos"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hasResumePoint && canExecute && (
                <button
                  type="button"
                  onClick={() => startExecution(true)}
                  className="min-h-[52px] rounded-2xl border-2 border-amber-500 bg-amber-50 px-5 py-2.5 text-base font-extrabold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                >
                  ▶ Retomar en paso {(draft.lastViewedStepIndex ?? 0) + 1}
                </button>
              )}

              <button
                type="button"
                onClick={() => startExecution(false)}
                disabled={!canExecute}
                className="min-h-[52px] rounded-2xl bg-emerald-600 px-6 py-2.5 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {hasResumePoint ? "▶ Ejecutar desde el inicio" : "▶ Ejecutar secuencia"}
              </button>
            </div>
          </div>

          {/* Aviso de restricción cuando hay menos de 2 pasos (HU-07 / CU-06 excepción 4a) */}
          {!canExecute && (
            <div
              role="status"
              className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"
            >
              Para ejecutar la secuencia se necesitan al menos 2 pasos (actualmente hay{" "}
              {draft.steps.length}). Agregá{" "}
              {2 - draft.steps.length === 1 ? "1 paso más" : "al menos 2 pasos"} con el
              botón «+ Agregar paso con pictograma».
            </div>
          )}

          {/* Lista reordenable de pasos (HU-07) */}
          <SequenceStepList
            steps={draft.steps}
            lastViewedStepIndex={draft.lastViewedStepIndex}
            onMoveStep={moveStep}
            onUpdateStepText={updateStepText}
            onRequestChangePictogram={handleOpenPickerForExistingStep}
            onRemoveStep={removeStep}
            onRequestAddStep={handleOpenPickerForNewStep}
          />
        </section>
      </div>

      {/* Modal reutilizable de búsqueda de pictogramas en ARASAAC (HU-10) */}
      <PictogramPickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setEditingStepId(null);
        }}
        title={
          currentlyEditingStep
            ? "Cambiar pictograma del paso"
            : "Elegir pictograma para el nuevo paso"
        }
        selectedId={currentlyEditingStep?.pictogram.id ?? null}
        onSelect={handleSelectPictogram}
        accent="violet"
      />

      {/* Reproductor paso a paso a pantalla completa (HU-08 / CU-07) */}
      {isPlaying && canExecute && (
        <SequencePlayer
          sequenceName={draft.name}
          steps={draft.steps}
          currentStepIndex={currentStepIndex}
          isCompleted={isCompleted}
          onNext={nextStep}
          onPrev={prevStep}
          onRestart={() => startExecution(false)}
          onExit={exitExecution}
        />
      )}
    </ScreenLayout>
  );
}
