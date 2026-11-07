import { useCallback, useEffect, useState } from "react";
import { getPictogramImageUrl, type Pictogram } from "../../services/arasaac";
import type {
  ActiveSequenceDraft,
  SaveSequenceResult,
  SavedSequence,
  SequenceStep
} from "./types";

const SAVED_SEQUENCES_STORAGE_KEY = "saac_sequencer_saved_v1";
const ACTIVE_DRAFT_STORAGE_KEY = "saac_sequencer_active_draft_v1";

/**
 * Crea la secuencia de ejemplo inicial ("Lavarse los dientes") mencionada en HU-07
 * para que el usuario tenga una rutina lista en la primera sesión.
 */
function createDefaultSavedSequences(): SavedSequence[] {
  const steps: SequenceStep[] = [
    {
      id: "seed-step-1",
      text: "Poner pasta en el cepillo",
      pictogram: {
        id: 2858,
        label: "Pasta de dientes",
        keywords: ["pasta de dientes", "dentífrico", "cepillo"],
        categories: ["higiene"],
        imageUrl: getPictogramImageUrl(2858),
        source: "arasaac"
      }
    },
    {
      id: "seed-step-2",
      text: "Cepillarse bien los dientes",
      pictogram: {
        id: 2326,
        label: "Cepillar los dientes",
        keywords: ["cepillar los dientes", "lavarse los dientes"],
        categories: ["higiene"],
        imageUrl: getPictogramImageUrl(2326),
        source: "arasaac"
      }
    },
    {
      id: "seed-step-3",
      text: "Enjuagarse la boca con agua",
      pictogram: {
        id: 8560,
        label: "Enjuagar la boca",
        keywords: ["enjuagar la boca", "agua"],
        categories: ["higiene"],
        imageUrl: getPictogramImageUrl(8560),
        source: "arasaac"
      }
    },
    {
      id: "seed-step-4",
      text: "Secarse con la toalla",
      pictogram: {
        id: 2593,
        label: "Toalla",
        keywords: ["toalla", "secar"],
        categories: ["higiene"],
        imageUrl: getPictogramImageUrl(2593),
        source: "arasaac"
      }
    }
  ];

  return [
    {
      id: "seed-lavarse-dientes",
      name: "Lavarse los dientes",
      steps,
      lastViewedStepIndex: null,
      updatedAt: new Date().toISOString()
    }
  ];
}

function loadSavedSequencesFromStorage(): SavedSequence[] {
  try {
    const raw = window.localStorage.getItem(SAVED_SEQUENCES_STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultSavedSequences();
      window.localStorage.setItem(SAVED_SEQUENCES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedSequence[]) : createDefaultSavedSequences();
  } catch {
    return createDefaultSavedSequences();
  }
}

function loadActiveDraftFromStorage(savedSequences: SavedSequence[]): ActiveSequenceDraft {
  try {
    const raw = window.localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ActiveSequenceDraft;
      if (parsed && Array.isArray(parsed.steps)) {
        return parsed;
      }
    }
  } catch {
    // Ignorar errores de lectura de localStorage
  }

  const firstSaved = savedSequences[0];
  if (firstSaved) {
    return {
      savedId: firstSaved.id,
      name: firstSaved.name,
      steps: firstSaved.steps,
      lastViewedStepIndex: firstSaved.lastViewedStepIndex
    };
  }

  return {
    savedId: null,
    name: "",
    steps: [],
    lastViewedStepIndex: null
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Hook de estado y persistencia del módulo Secuenciador (HU-07, HU-08 y HU-09).
 */
export function useSequencer() {
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>(() =>
    loadSavedSequencesFromStorage()
  );

  const [draft, setDraft] = useState<ActiveSequenceDraft>(() =>
    loadActiveDraftFromStorage(loadSavedSequencesFromStorage())
  );

  // Estado del reproductor a pantalla completa (HU-08)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Persistir secuencias guardadas en localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_SEQUENCES_STORAGE_KEY, JSON.stringify(savedSequences));
    } catch {
      // Ignorar si el almacenamiento está lleno o bloqueado
    }
  }, [savedSequences]);

  // Persistir el borrador activo (incluyendo el último paso visto de HU-08)
  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [draft]);

  /** Sincroniza el último paso visto también en la lista de guardadas si corresponde. */
  const syncLastStepToSaved = useCallback(
    (savedId: string | null, lastStep: number | null) => {
      if (!savedId) {
        return;
      }
      setSavedSequences((prev) =>
        prev.map((seq) =>
          seq.id === savedId ? { ...seq, lastViewedStepIndex: lastStep } : seq
        )
      );
    },
    []
  );

  /** Inicia una nueva secuencia en blanco (CU-06 paso 1). */
  const startNewSequence = useCallback(() => {
    setDraft({
      savedId: null,
      name: "",
      steps: [],
      lastViewedStepIndex: null
    });
    setIsPlaying(false);
    setIsCompleted(false);
  }, []);

  /** Actualiza el nombre en el borrador actual. */
  const setDraftName = useCallback((name: string) => {
    setDraft((prev) => ({ ...prev, name }));
  }, []);

  /** Agrega un nuevo paso con el pictograma elegido (HU-07). */
  const addStep = useCallback((pictogram: Pictogram, customText?: string) => {
    const stepText = (customText ?? pictogram.label).trim() || pictogram.label;
    const newStep: SequenceStep = {
      id: generateId("step"),
      text: stepText.charAt(0).toUpperCase() + stepText.slice(1),
      pictogram
    };

    setDraft((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  }, []);

  /** Edita el texto descriptivo de un paso existente. */
  const updateStepText = useCallback((stepId: string, text: string) => {
    setDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === stepId ? { ...step, text } : step))
    }));
  }, []);

  /** Cambia el pictograma de un paso existente (HU-07 / HU-10). */
  const updateStepPictogram = useCallback((stepId: string, pictogram: Pictogram) => {
    setDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, pictogram } : step
      )
    }));
  }, []);

  /** Elimina un paso de la secuencia y ajusta el último paso visto si fuera necesario (CU-06 2a). */
  const removeStep = useCallback((stepId: string) => {
    setDraft((prev) => {
      const nextSteps = prev.steps.filter((step) => step.id !== stepId);
      const nextLastIndex =
        prev.lastViewedStepIndex !== null && prev.lastViewedStepIndex >= nextSteps.length
          ? nextSteps.length > 0
            ? nextSteps.length - 1
            : null
          : prev.lastViewedStepIndex;

      return {
        ...prev,
        steps: nextSteps,
        lastViewedStepIndex: nextLastIndex
      };
    });
  }, []);

  /** Reordena un paso desde `fromIndex` hacia `toIndex` (con flechas o arrastrando - HU-07). */
  const moveStep = useCallback((fromIndex: number, toIndex: number) => {
    setDraft((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.steps.length ||
        toIndex >= prev.steps.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }

      const nextSteps = [...prev.steps];
      const [moved] = nextSteps.splice(fromIndex, 1);
      nextSteps.splice(toIndex, 0, moved);

      return {
        ...prev,
        steps: nextSteps
      };
    });
  }, []);

  /**
   * Guarda la secuencia actual en la lista persistente (HU-09 / CU-08).
   * Valida que tenga al menos 2 pasos, nombre no vacío y que el nombre no esté repetido
   * en otra secuencia guardada (CU-08 excepción 2a).
   */
  const saveCurrentSequence = useCallback(
    (rawName?: string): SaveSequenceResult => {
      const cleanName = (rawName ?? draft.name).trim();
      if (!cleanName) {
        return {
          ok: false,
          error: "Escribí un nombre para guardar la secuencia."
        };
      }

      if (draft.steps.length < 2) {
        return {
          ok: false,
          error: "La secuencia necesita al menos 2 pasos para poder guardarse."
        };
      }

      const normalizedTarget = cleanName.toLowerCase();
      const duplicate = savedSequences.find(
        (seq) =>
          seq.name.trim().toLowerCase() === normalizedTarget && seq.id !== draft.savedId
      );

      if (duplicate) {
        return {
          ok: false,
          error: `Ya existe una secuencia llamada «${duplicate.name}». Por favor, elegí otro nombre.`
        };
      }

      const now = new Date().toISOString();

      if (draft.savedId && savedSequences.some((seq) => seq.id === draft.savedId)) {
        const updatedId = draft.savedId;
        setSavedSequences((prev) =>
          prev.map((seq) =>
            seq.id === updatedId
              ? {
                  ...seq,
                  name: cleanName,
                  steps: draft.steps,
                  lastViewedStepIndex: draft.lastViewedStepIndex,
                  updatedAt: now
                }
              : seq
          )
        );
        setDraft((prev) => ({ ...prev, name: cleanName }));
        return { ok: true };
      }

      const newId = generateId("seq");
      const newSaved: SavedSequence = {
        id: newId,
        name: cleanName,
        steps: draft.steps,
        lastViewedStepIndex: draft.lastViewedStepIndex,
        updatedAt: now
      };

      setSavedSequences((prev) => [newSaved, ...prev]);
      setDraft((prev) => ({
        ...prev,
        savedId: newId,
        name: cleanName
      }));

      return { ok: true };
    },
    [draft, savedSequences]
  );

  /** Carga una secuencia guardada en el editor (y opcionalmente inicia su ejecución). */
  const loadSavedSequence = useCallback(
    (sequenceId: string, executeImmediately = false) => {
      const target = savedSequences.find((seq) => seq.id === sequenceId);
      if (!target) {
        return;
      }

      setDraft({
        savedId: target.id,
        name: target.name,
        steps: target.steps,
        lastViewedStepIndex: target.lastViewedStepIndex
      });

      if (executeImmediately && target.steps.length >= 2) {
        const resumeIndex =
          target.lastViewedStepIndex !== null &&
          target.lastViewedStepIndex >= 0 &&
          target.lastViewedStepIndex < target.steps.length
            ? target.lastViewedStepIndex
            : 0;
        setCurrentStepIndex(resumeIndex);
        setIsCompleted(false);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        setIsCompleted(false);
      }
    },
    [savedSequences]
  );

  /** Elimina una secuencia de la lista de guardadas. */
  const deleteSavedSequence = useCallback((sequenceId: string) => {
    setSavedSequences((prev) => prev.filter((seq) => seq.id !== sequenceId));
    setDraft((prev) =>
      prev.savedId === sequenceId ? { ...prev, savedId: null } : prev
    );
  }, []);

  /**
   * Inicia la ejecución paso a paso a pantalla completa (HU-08 / CU-07).
   * Permite empezar desde el principio (`startFromSavedStep = false`) o retomar
   * desde el último paso visto (`startFromSavedStep = true`).
   */
  const startExecution = useCallback(
    (startFromSavedStep = false) => {
      if (draft.steps.length < 2) {
        return;
      }

      const initialIndex =
        startFromSavedStep &&
        draft.lastViewedStepIndex !== null &&
        draft.lastViewedStepIndex >= 0 &&
        draft.lastViewedStepIndex < draft.steps.length
          ? draft.lastViewedStepIndex
          : 0;

      setCurrentStepIndex(initialIndex);
      setIsCompleted(false);
      setIsPlaying(true);

      setDraft((prev) => ({
        ...prev,
        lastViewedStepIndex: initialIndex
      }));
      syncLastStepToSaved(draft.savedId, initialIndex);
    },
    [draft.steps.length, draft.lastViewedStepIndex, draft.savedId, syncLastStepToSaved]
  );

  /** Avanza al siguiente paso o muestra la pantalla de cierre si era el último (CU-07 pasos 3-5). */
  const nextStep = useCallback(() => {
    if (currentStepIndex + 1 < draft.steps.length) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setDraft((prev) => ({
        ...prev,
        lastViewedStepIndex: nextIdx
      }));
      syncLastStepToSaved(draft.savedId, nextIdx);
    } else {
      // Al completar el último paso, se muestra la pantalla de cierre y se limpia el paso pendiente
      setIsCompleted(true);
      setDraft((prev) => ({
        ...prev,
        lastViewedStepIndex: null
      }));
      syncLastStepToSaved(draft.savedId, null);
    }
  }, [currentStepIndex, draft.steps.length, draft.savedId, syncLastStepToSaved]);

  /** Vuelve al paso anterior (CU-07 flujo alternativo 3a). */
  const prevStep = useCallback(() => {
    if (isCompleted) {
      const lastIdx = Math.max(0, draft.steps.length - 1);
      setIsCompleted(false);
      setCurrentStepIndex(lastIdx);
      setDraft((prev) => ({
        ...prev,
        lastViewedStepIndex: lastIdx
      }));
      syncLastStepToSaved(draft.savedId, lastIdx);
      return;
    }

    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setDraft((prev) => ({
        ...prev,
        lastViewedStepIndex: prevIdx
      }));
      syncLastStepToSaved(draft.savedId, prevIdx);
    }
  }, [isCompleted, currentStepIndex, draft.steps.length, draft.savedId, syncLastStepToSaved]);

  /**
   * Sale de la pantalla de ejecución.
   * Si no había terminado, conserva el último paso visto (HU-08 / CU-07 3b).
   */
  const exitExecution = useCallback(() => {
    if (!isCompleted) {
      setDraft((prev) => ({
        ...prev,
        lastViewedStepIndex: currentStepIndex
      }));
      syncLastStepToSaved(draft.savedId, currentStepIndex);
    }
    setIsPlaying(false);
    setIsCompleted(false);
  }, [isCompleted, currentStepIndex, draft.savedId, syncLastStepToSaved]);

  const canExecute = draft.steps.length >= 2;
  const hasResumePoint =
    draft.lastViewedStepIndex !== null &&
    draft.lastViewedStepIndex >= 0 &&
    draft.lastViewedStepIndex < draft.steps.length;

  return {
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
  };
}

