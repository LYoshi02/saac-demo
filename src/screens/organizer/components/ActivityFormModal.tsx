import { useEffect, useId, useState, type FormEvent } from "react";
import { PictogramPickerModal } from "../../../components/pictogram-picker";
import type { Pictogram } from "../../../services/arasaac";
import type { ActivityFormValues, DailyActivity } from "../types";

export interface ActivityFormModalProps {
  isOpen: boolean;
  dayLabel: string;
  initialActivity: DailyActivity | null;
  getActivitiesAtSameTime: (time: string, excludeActivityId?: string) => DailyActivity[];
  onClose: () => void;
  onSave: (values: ActivityFormValues) => void;
}

function parseHourPart(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }
  const num = Number(value.trim());
  return Number.isInteger(num) && num >= 0 && num <= 23 ? num : null;
}

function parseMinutePart(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }
  const num = Number(value.trim());
  return Number.isInteger(num) && num >= 0 && num <= 59 ? num : null;
}

/**
 * Diálogo modal accesible para agregar una nueva actividad o editar una existente
 * en la agenda diaria (HU-04 / CU-03).
 */
export default function ActivityFormModal({
  isOpen,
  dayLabel,
  initialActivity,
  getActivitiesAtSameTime,
  onClose,
  onSave
}: ActivityFormModalProps) {
  const modalTitleId = useId();
  const hourInputId = useId();
  const minuteInputId = useId();
  const titleInputId = useId();

  const [hourInput, setHourInput] = useState<string>("0");
  const [minuteInput, setMinuteInput] = useState<string>("0");
  const [title, setTitle] = useState<string>("");
  const [pictogram, setPictogram] = useState<Pictogram | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialActivity) {
      const [initHour = "0", initMinute = "0"] = initialActivity.time.split(":");
      const numHour = Number(initHour);
      const numMinute = Number(initMinute);
      setHourInput(Number.isNaN(numHour) ? "0" : String(numHour));
      setMinuteInput(Number.isNaN(numMinute) ? "0" : String(numMinute));
      setTitle(initialActivity.title);
      setPictogram(initialActivity.pictogram);
    } else {
      setHourInput("0");
      setMinuteInput("0");
      setTitle("");
      setPictogram(null);
    }
    setValidationError(null);
    setIsPickerOpen(false);
  }, [isOpen, initialActivity]);

  useEffect(() => {
    if (!isOpen || isPickerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPickerOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const parsedHour = parseHourPart(hourInput);
  const parsedMinute = parseMinutePart(minuteInput);

  const currentTime =
    parsedHour !== null && parsedMinute !== null
      ? `${String(parsedHour).padStart(2, "0")}:${String(parsedMinute).padStart(2, "0")}`
      : null;

  const sameTimeActivities = currentTime
    ? getActivitiesAtSameTime(currentTime, initialActivity?.id)
    : [];

  const handleSelectPictogram = (selected: Pictogram) => {
    // Si el nombre todavía está vacío al elegir pictograma, sugerir el nombre del pictograma
    if (!title.trim()) {
      setTitle(selected.label);
    }

    setPictogram(selected);
    setValidationError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() && !pictogram) {
      setValidationError("Escribí el nombre de la actividad.");
      return;
    }

    if (parsedHour === null) {
      setValidationError("La hora tiene que ser un número entero entre 0 y 23.");
      return;
    }

    if (parsedMinute === null) {
      setValidationError("Los minutos tienen que ser un número entero entre 0 y 59.");
      return;
    }

    if (!pictogram) {
      setValidationError("Elegí un pictograma para representar la actividad.");
      return;
    }

    const cleanTitle = title.trim() || pictogram.label;
    onSave({
      time: currentTime!,
      title: cleanTitle,
      pictogram
    });
    onClose();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4">
            <div>
              <h2 id={modalTitleId} className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                {initialActivity ? "Editar actividad" : "Agregar actividad"}
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Agenda del {dayLabel.toLowerCase()}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] shrink-0 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
            >
              Cerrar
            </button>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:gap-6 sm:p-6"
          >
            {/* Paso 1: Nombre de la actividad */}
            <div className="flex flex-col gap-2">
              <label htmlFor={titleInputId} className="text-base font-bold text-slate-800">
                1. Nombre de la actividad
              </label>
              <input
                id={titleInputId}
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setValidationError(null);
                }}
                placeholder="Ej. Desayunar, Ir al colegio, Lavarse las manos…"
                className="min-h-[52px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
              />
            </div>

            {/* Paso 2: Horario de la actividad en formato 24 hs y aviso si se repite (HU-04 / CU-03 3a) */}
            <div className="flex flex-col gap-2">
              <span className="text-base font-bold text-slate-800">
                2. Horario de la actividad (24 hs)
              </span>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={hourInputId} className="text-sm font-bold text-slate-800">
                    Hora (0 a 23)
                  </label>
                  <input
                    id={hourInputId}
                    type="number"
                    min={0}
                    max={23}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={hourInput}
                    onChange={(event) => {
                      setHourInput(event.target.value);
                      setValidationError(null);
                    }}
                    className="min-h-[50px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={minuteInputId} className="text-sm font-bold text-slate-800">
                    Minutos (0 a 59)
                  </label>
                  <input
                    id={minuteInputId}
                    type="number"
                    min={0}
                    max={59}
                    step={1}
                    inputMode="numeric"
                    placeholder="0"
                    value={minuteInput}
                    onChange={(event) => {
                      setMinuteInput(event.target.value);
                      setValidationError(null);
                    }}
                    className="min-h-[50px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-lg font-extrabold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                  />
                </div>
              </div>

              {/* Aviso no bloqueante si otra actividad ya tiene la misma hora (HU-04 / CU-03 3a) */}
              {currentTime && sameTimeActivities.length > 0 && (
                <div
                  role="status"
                  className="mt-1 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950"
                >
                  ⚠ Aviso: Ya tenés{" "}
                  {sameTimeActivities.length === 1
                    ? `otra actividad agendada a las ${currentTime} («${sameTimeActivities[0]?.title}»)`
                    : `${sameTimeActivities.length} actividades agendadas a las ${currentTime} (${sameTimeActivities.map((a) => `«${a.title}»`).join(", ")})`}
                  . Igual podés guardar esta actividad si querés mantenerlas en el mismo horario.
                </div>
              )}
            </div>

            {/* Paso 3: Pictograma de la actividad (HU-10 / CU-09) */}
            <div className="flex flex-col gap-2">
              <span className="text-base font-bold text-slate-800">
                3. Pictograma de la actividad
              </span>

              <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-2">
                  {pictogram ? (
                    <img
                      src={pictogram.imageUrl}
                      alt={pictogram.label}
                      className="h-24 w-24 object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs font-semibold text-slate-400">
                      Sin pictograma elegido
                    </span>
                  )}
                </div>

                <div className="flex w-full flex-1 flex-col items-center gap-3 text-center sm:w-auto sm:items-start sm:text-left">
                  <p className="text-base font-bold text-slate-900">
                    {pictogram
                      ? `Seleccionado: ${pictogram.label}`
                      : "Todavía no elegiste un pictograma"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="min-h-[48px] w-full rounded-2xl border-2 border-emerald-600 bg-emerald-600 px-5 py-2 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:w-auto"
                  >
                    {pictogram ? "Cambiar pictograma…" : "Buscar pictograma…"}
                  </button>
                </div>
              </div>
            </div>

            {validationError && (
              <div
                role="alert"
                className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-900"
              >
                {validationError}
              </div>
            )}

            <footer className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:flex sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400 sm:px-5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[48px] rounded-2xl bg-emerald-600 px-4 py-2.5 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:px-6"
              >
                {initialActivity ? "Guardar cambios" : "Guardar actividad"}
              </button>
            </footer>
          </form>
        </div>
      </div>

      {/* Buscador transversal de pictogramas (HU-10) */}
      <PictogramPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title="Elegir pictograma para la actividad"
        selectedId={pictogram?.id ?? null}
        onSelect={handleSelectPictogram}
        accent="emerald"
      />
    </>
  );
}
