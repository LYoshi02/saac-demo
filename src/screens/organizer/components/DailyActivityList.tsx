import { useState } from "react";
import type { DailyActivity } from "../types";

export interface DailyActivityListProps {
  dayLabel: string;
  activities: DailyActivity[];
  duplicateTimes: Set<string>;
  onEditActivity: (activity: DailyActivity) => void;
  onDeleteActivity: (activityId: string) => void;
}

interface TimeOfDayPeriod {
  label: "Mañana" | "Tarde" | "Noche";
  badgeClass: string;
}

/**
 * Determina el momento del día a partir de una hora en formato "HH:MM" para acompañar
 * el horario numérico con una referencia visual simple.
 */
function getTimeOfDayPeriod(time: string): TimeOfDayPeriod {
  const hourPart = Number.parseInt(time.split(":")[0] ?? "0", 10);

  if (hourPart >= 6 && hourPart < 13) {
    return {
      label: "Mañana",
      badgeClass: "border-sky-300 bg-sky-100 text-sky-950"
    };
  }

  if (hourPart >= 13 && hourPart < 20) {
    return {
      label: "Tarde",
      badgeClass: "border-amber-300 bg-amber-100 text-amber-950"
    };
  }

  return {
    label: "Noche",
    badgeClass: "border-slate-400 bg-slate-200 text-slate-900"
  };
}

/**
 * Lista cronológica de actividades del día seleccionado (HU-04 / CU-03).
 * Incluye confirmación explícita antes de borrar cualquier actividad (CU-03 2b).
 */
export default function DailyActivityList({
  dayLabel,
  activities,
  duplicateTimes,
  onEditActivity,
  onDeleteActivity
}: DailyActivityListProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-emerald-300 bg-slate-50 p-10 text-center">
        <p className="text-xl font-bold text-slate-900">
          Todavía no hay actividades cargadas para el {dayLabel.toLowerCase()}
        </p>
        <p className="max-w-md text-base text-slate-600">
          Agregá actividades con su horario y pictograma para armar la agenda del día y mostrársela al niño.
        </p>
      </div>
    );
  }

  return (
    <ol
      aria-label={`Actividades del día ${dayLabel}`}
      className="flex flex-col gap-4"
    >
      {activities.map((activity) => {
        const period = getTimeOfDayPeriod(activity.time);
        const hasDuplicateTime = duplicateTimes.has(activity.time);
        const isConfirmingDelete = confirmingDeleteId === activity.id;

        return (
          <li
            key={activity.id}
            className={`flex flex-col gap-4 rounded-3xl border-2 bg-white p-4 shadow-sm transition md:flex-row md:items-center md:justify-between md:p-5 ${
              hasDuplicateTime
                ? "border-amber-300 hover:border-amber-400"
                : "border-slate-200 hover:border-emerald-300"
            }`}
          >
            {/* Bloque izquierdo: Horario + Pictograma (juntos en fila en mobile) + Nombre */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Par de recuadros iguales (Hora y Pictograma lado a lado incluso en mobile) */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Tarjeta de horario y momento del día */}
                <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 p-2 text-center">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {activity.time}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${period.badgeClass}`}
                  >
                    {period.label}
                  </span>
                </div>

                {/* Recuadro del pictograma */}
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 p-2">
                  <img
                    src={activity.pictogram.imageUrl}
                    alt={activity.title}
                    loading="lazy"
                    className="h-24 w-24 object-contain"
                  />
                </div>
              </div>

              {/* Título y metadatos de la actividad */}
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="break-words text-xl font-extrabold text-slate-900 sm:text-2xl">
                  {activity.title}
                </h3>
                <p className="text-sm font-medium text-slate-600">
                  Pictograma: {activity.pictogram.label}
                </p>
                {hasDuplicateTime && (
                  <span
                    role="status"
                    className="mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900"
                  >
                    ⚠ Comparte el horario {activity.time} con otra actividad
                  </span>
                )}
              </div>
            </div>

            {/* Bloque derecho: Acciones de edición y eliminación con confirmación (HU-04 / CU-03) */}
            {!isConfirmingDelete ? (
              <div className="grid w-full grid-cols-2 gap-2.5 md:flex md:w-auto md:shrink-0 md:items-center md:justify-end">
                <button
                  type="button"
                  onClick={() => onEditActivity(activity)}
                  aria-label={`Editar actividad ${activity.title} de las ${activity.time}`}
                  className="min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-5 py-2 text-base font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(activity.id)}
                  aria-label={`Eliminar actividad ${activity.title} de las ${activity.time}`}
                  className="min-h-[48px] rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-2 text-base font-bold text-red-800 transition hover:border-red-400 hover:bg-red-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                >
                  Borrar
                </button>
              </div>
            ) : (
              <div
                role="alert"
                className="flex w-full flex-col justify-center gap-1.5 rounded-2xl border-2 border-red-300 bg-red-50 px-3.5 py-2 md:h-28 md:w-80 md:shrink-0"
              >
                <p
                  title={`¿Seguro que querés borrar «${activity.title}» (${activity.time})?`}
                  className="truncate text-center text-xs font-bold text-red-900 sm:text-sm"
                >
                  ¿Borrar «{activity.title}» ({activity.time})?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteActivity(activity.id);
                      setConfirmingDeleteId(null);
                    }}
                    className="h-11 rounded-xl border-2 border-red-600 bg-red-600 px-3 text-sm font-extrabold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                  >
                    Sí, borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(null)}
                    className="h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
