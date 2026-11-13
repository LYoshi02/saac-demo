import type { Pictogram } from "../../services/arasaac";

/**
 * Representa un paso individual dentro de una secuencia de rutina (HU-07).
 */
export interface SequenceStep {
  /** Identificador único del paso dentro de la secuencia. */
  id: string;
  /** Instrucción breve o nombre del paso que verá el niño junto al pictograma. */
  text: string;
  /** Pictograma asociado al paso (seleccionado con el buscador HU-10). */
  pictogram: Pictogram;
}

/**
 * Secuencia guardada de forma persistente para reutilizar en otras sesiones (HU-09 / CU-08).
 */
export interface SavedSequence {
  /** Identificador único de la secuencia guardada. */
  id: string;
  /** Nombre único asignado por el terapeuta o familiar. */
  name: string;
  /** Lista ordenada de pasos de la rutina. */
  steps: SequenceStep[];
  /**
   * Índice del último paso visto si el usuario salió antes de terminar (HU-08 / CU-07 3b).
   * Es `null` si no se inició o si se completó hasta el final.
   */
  lastViewedStepIndex: number | null;
  /** Fecha ISO de última modificación. */
  updatedAt: string;
}

/**
 * Estado de la secuencia activa en edición/ejecución en la sesión actual.
 */
export interface ActiveSequenceDraft {
  /** Si proviene de una secuencia guardada, referencia su ID; si es nueva, `null`. */
  savedId: string | null;
  /** Nombre actual en el editor. */
  name: string;
  /** Pasos actuales de la secuencia. */
  steps: SequenceStep[];
  /** Último paso visto si se interrumpió la ejecución (HU-08). */
  lastViewedStepIndex: number | null;
}

/**
 * Resultado de una operación de guardado (HU-09).
 */
export interface SaveSequenceResult {
  ok: boolean;
  error?: string;
}

/**
 * Tiempo máximo permitido para completar una secuencia: 50 minutos (3000 segundos).
 */
export const MAX_SEQUENCE_TIME_MINUTES = 50;
export const MAX_SEQUENCE_TIME_SECONDS = MAX_SEQUENCE_TIME_MINUTES * 60;

/**
 * Motivo por el cual se llegó a la pantalla de fin de la secuencia.
 */
export type SequenceCompletionReason = "steps_completed" | "time_expired";


