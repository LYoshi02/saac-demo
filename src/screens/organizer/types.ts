import type { Pictogram } from "../../services/arasaac";

/**
 * Días de la semana disponibles para seleccionar al gestionar la agenda diaria (CU-03 paso 1).
 */
export type DayOfWeek =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export interface DayOption {
  id: DayOfWeek;
  label: string;
  shortLabel: string;
}

export const DAYS_OF_WEEK: DayOption[] = [
  { id: "lunes", label: "Lunes", shortLabel: "Lun" },
  { id: "martes", label: "Martes", shortLabel: "Mar" },
  { id: "miercoles", label: "Miércoles", shortLabel: "Mié" },
  { id: "jueves", label: "Jueves", shortLabel: "Jue" },
  { id: "viernes", label: "Viernes", shortLabel: "Vie" },
  { id: "sabado", label: "Sábado", shortLabel: "Sáb" },
  { id: "domingo", label: "Domingo", shortLabel: "Dom" }
];

/**
 * Representa una actividad dentro de la agenda diaria (HU-04 / CU-03).
 */
export interface DailyActivity {
  /** Identificador único de la actividad. */
  id: string;
  /** Hora en formato 24 horas "HH:MM" (por ejemplo, "08:30"). */
  time: string;
  /** Nombre descriptivo de la actividad para mostrar junto al pictograma. */
  title: string;
  /** Pictograma asociado a la actividad (seleccionado con el buscador HU-10). */
  pictogram: Pictogram;
}

/**
 * Valores del formulario para crear o editar una actividad (HU-04 / CU-03).
 */
export interface ActivityFormValues {
  time: string;
  title: string;
  pictogram: Pictogram;
}

/**
 * Diccionario de agendas diarias indexadas por día de la semana.
 */
export type DailySchedulesByDay = Record<DayOfWeek, DailyActivity[]>;
