import { useId, useState } from "react";
import { PictogramPickerModal } from "../../components/pictogram-picker";
import ScreenLayout from "../../components/ScreenLayout";
import type { Pictogram } from "../../services/arasaac";
import SavedSequencesPanel from "./components/SavedSequencesPanel";
import SequencePlayer from "./components/SequencePlayer";
import SequenceStepList from "./components/SequenceStepList";
import SequenceTimerSetupModal from "./components/SequenceTimerSetupModal";
import { useSequencer } from "./useSequencer";

interface SequencerScreenProps {
  onBack: () => void;
}

type SequencerView = "list" | "editor";

interface PendingExecutionRequest {
  /** ID de secuencia guardada a cargar, o `null` si se ejecuta el borrador actual del editor. */
  sequenceId: string | null;
  sequenceName: string;
  resumeFromSavedStep: boolean;
  resumeStepNumber: number;
}

/**
 * Módulo Secuenciador de rutinas (HU-07, HU-08 y HU-09 / CU-06, CU-07 y CU-08).
 * - Vista "list": Muestra únicamente el listado de secuencias guardadas y el botón para crear una nueva.
 * - Vista "editor": Pantalla dedicada a la creación y edición de pasos de una secuencia.
 */
export default function SequencerScreen({ onBack }: SequencerScreenProps) {
  const sequenceNameInputId = useId();
  const {
    draft,
    savedSequences,
    canExecute,
    isPlaying,
    currentStepIndex,
    isCompleted,
    completionReason,
    configuredDurationSeconds,
    remainingSeconds,
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

  // Navegación interna entre la pantalla de listado y la pantalla de creación/edición
  const [view, setView] = useState<SequencerView>("list");

  // Estado del selector de pictogramas (para agregar un nuevo paso o cambiar el de un paso existente)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  // Estado del modal de configuración opcional de tiempo antes de iniciar una secuencia
  const [pendingExecution, setPendingExecution] =
    useState<PendingExecutionRequest | null>(null);

  // Mensajes de feedback al guardar la secuencia (HU-09)
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleGoToCreateNew = () => {
    startNewSequence();
    setSaveFeedback(null);
    setView("editor");
  };

  const handleGoToEditSaved = (sequenceId: string) => {
    loadSavedSequence(sequenceId, false);
    setSaveFeedback(null);
    setView("editor");
  };

  const handleBackToList = () => {
    setSaveFeedback(null);
    setView("list");
  };

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

  const handleRequestExecuteSaved = (
    sequenceId: string,
    resumeFromSavedStep: boolean
  ) => {
    const target = savedSequences.find((seq) => seq.id === sequenceId);
    if (!target || target.steps.length < 2) {
      return;
    }

    const hasValidSavedStep =
      resumeFromSavedStep &&
      target.lastViewedStepIndex !== null &&
      target.lastViewedStepIndex >= 0 &&
      target.lastViewedStepIndex < target.steps.length;

    setPendingExecution({
      sequenceId: target.id,
      sequenceName: target.name,
      resumeFromSavedStep: hasValidSavedStep,
      resumeStepNumber: hasValidSavedStep ? (target.lastViewedStepIndex ?? 0) + 1 : 1
    });
  };

  const handleStartConfirmedExecution = (durationSeconds: number | null) => {
    if (!pendingExecution) {
      return;
    }

    if (pendingExecution.sequenceId) {
      loadSavedSequence(
        pendingExecution.sequenceId,
        true,
        pendingExecution.resumeFromSavedStep,
        durationSeconds
      );
    } else {
      startExecution(pendingExecution.resumeFromSavedStep, durationSeconds);
    }

    setPendingExecution(null);
  };

  const currentlyEditingStep = editingStepId
    ? draft.steps.find((step) => step.id === editingStepId) ?? null
    : null;

  return (
    <ScreenLayout
      title={
        view === "list"
          ? "Secuenciador"
          : draft.savedId
            ? "Editar secuencia"
            : "Nueva secuencia"
      }
      onBack={view === "list" ? onBack : handleBackToList}
    >
      {view === "list" ? (
        /* Pantalla 1: Solo listado de secuencias guardadas + botón para crear una nueva */
        <SavedSequencesPanel
          savedSequences={savedSequences}
          onCreateNew={handleGoToCreateNew}
          onSelectToEdit={handleGoToEditSaved}
          onSelectToExecute={handleRequestExecuteSaved}
          onDelete={deleteSavedSequence}
        />
      ) : (
        /* Pantalla 2: Creación y edición de secuencias */
        <section
          aria-label="Editor de secuencia"
          className="flex flex-col gap-6 rounded-3xl border-2 border-violet-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {/* Encabezado del editor con retorno al listado de secuencias guardadas */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {draft.savedId ? "Editando secuencia" : "Nueva secuencia de pasos"}
              </h2>
              <p className="text-sm text-slate-600">
                Armá los pasos de la rutina con pictogramas, ordenalos y guardá la secuencia.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackToList}
              className="min-h-[48px] w-full shrink-0 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-base font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:w-auto"
            >
              ← Volver a mis secuencias
            </button>
          </div>

          {/* Nombre de la secuencia y botón Guardar (HU-09 / CU-08) */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor={sequenceNameInputId}
              className="text-base font-bold text-slate-800"
            >
              Nombre de la secuencia
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
                className={`mt-1 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-bold ${
                  saveFeedback.type === "error"
                    ? "border-red-300 bg-red-50 text-red-900"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900"
                }`}
              >
                <span>{saveFeedback.message}</span>
                {saveFeedback.type === "success" && (
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="underline hover:text-emerald-950"
                  >
                    Ver en mis secuencias →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Barra de acciones: Agregar paso y contador de pasos */}
          <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleOpenPickerForNewStep}
              className="min-h-[52px] w-full rounded-2xl bg-violet-600 px-5 py-2.5 text-base font-extrabold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:w-auto"
            >
              + Agregar paso con pictograma
            </button>

            <span className="text-center text-sm font-bold text-slate-700 sm:text-right">
              Total: {draft.steps.length}{" "}
              {draft.steps.length === 1 ? "paso" : "pasos"}
            </span>
          </div>

          {/* Lista reordenable de pasos (HU-07) */}
          <SequenceStepList
            steps={draft.steps}
            onMoveStep={moveStep}
            onUpdateStepText={updateStepText}
            onRequestChangePictogram={handleOpenPickerForExistingStep}
            onRemoveStep={removeStep}
          />
        </section>
      )}

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

      {/* Modal previo para elegir de forma opcional el tiempo disponible (máx. 50 min) */}
      <SequenceTimerSetupModal
        isOpen={pendingExecution !== null}
        sequenceName={pendingExecution?.sequenceName ?? draft.name}
        isResuming={pendingExecution?.resumeFromSavedStep ?? false}
        resumeStepNumber={pendingExecution?.resumeStepNumber ?? 1}
        onStartWithTime={(durationSeconds) =>
          handleStartConfirmedExecution(durationSeconds)
        }
        onStartWithoutTime={() => handleStartConfirmedExecution(null)}
        onClose={() => setPendingExecution(null)}
      />

      {/* Reproductor paso a paso a pantalla completa (HU-08 / CU-07) */}
      {isPlaying && canExecute && (
        <SequencePlayer
          sequenceName={draft.name}
          steps={draft.steps}
          currentStepIndex={currentStepIndex}
          isCompleted={isCompleted}
          completionReason={completionReason}
          configuredDurationSeconds={configuredDurationSeconds}
          remainingSeconds={remainingSeconds}
          onNext={nextStep}
          onPrev={prevStep}
          onRestart={() => startExecution(false, configuredDurationSeconds)}
          onExit={exitExecution}
        />
      )}
    </ScreenLayout>
  );
}
