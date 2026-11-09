import { useState } from "react";
import ScreenLayout from "../../components/ScreenLayout";
import ActivityFormModal from "./components/ActivityFormModal";
import DailyActivityList from "./components/DailyActivityList";
import { DAYS_OF_WEEK, type ActivityFormValues, type DailyActivity } from "./types";
import { useOrganizer } from "./useOrganizer";

interface OrganizerScreenProps {
  onBack: () => void;
}

/**
 * Módulo Organizador – HU-04 / CU-03 (Must): Gestionar agenda diaria.
 * Permite seleccionar el día, agregar actividades con horario y pictograma (HU-10),
 * editarlas, eliminarlas con confirmación previa, ordenarlas automáticamente por hora
 * y avisar sin bloquear cuando dos actividades comparten el mismo horario.
 */
export default function OrganizerScreen({ onBack }: OrganizerScreenProps) {
  const {
    selectedDay,
    setSelectedDay,
    schedulesByDay,
    activities,
    duplicateTimes,
    getActivitiesAtSameTime,
    addActivity,
    updateActivity,
    deleteActivity
  } = useOrganizer();

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const selectedDayOption =
    DAYS_OF_WEEK.find((day) => day.id === selectedDay) ?? DAYS_OF_WEEK[0];

  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (activity: DailyActivity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const handleSaveActivity = (values: ActivityFormValues) => {
    const conflicts = getActivitiesAtSameTime(values.time, editingActivity?.id);

    if (editingActivity) {
      updateActivity(editingActivity.id, values);
    } else {
      addActivity(values);
    }

    if (conflicts.length > 0) {
      setStatusNotice(
        `Se guardó «${values.title}» a las ${values.time}. Aviso: comparte el mismo horario con ${conflicts.map((item) => `«${item.title}»`).join(", ")}.`
      );
    } else {
      setStatusNotice(null);
    }
  };

  const duplicateTimesList = Array.from(duplicateTimes).sort();

  return (
    <ScreenLayout title="Organizador" onBack={onBack}>
      <div className="flex flex-col gap-6">
        {/* Selector de día de la agenda diaria (CU-03 paso 1) */}
        <section
          aria-label="Seleccionar día de la semana"
          className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3">
            <h2 className="text-base font-extrabold text-slate-800">
              Elegí el día de la agenda
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = day.id === selectedDay;
              const count = schedulesByDay[day.id]?.length ?? 0;

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.id);
                    setStatusNotice(null);
                  }}
                  aria-pressed={isSelected}
                  className={`flex min-h-[52px] flex-col items-center justify-center rounded-2xl border-2 px-3 py-2 text-center transition last:col-span-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:last:col-span-1 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <span className="text-sm font-extrabold">{day.label}</span>
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    {count} {count === 1 ? "actividad" : "actividades"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Contenedor principal de la agenda diaria (HU-04 / CU-03) */}
        <section
          aria-label={`Agenda diaria del ${selectedDayOption.label}`}
          className="flex flex-col gap-5 rounded-3xl border-2 border-emerald-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-7"
        >
          {/* Encabezado del día con botón principal para agregar actividad */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Agenda del {selectedDayOption.label}
                </h2>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-3 py-0.5 text-sm font-bold text-emerald-900">
                  {activities.length}{" "}
                  {activities.length === 1 ? "actividad" : "actividades"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Armá la rutina del día con horarios y pictogramas para mostrársela al niño.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-6 py-2.5 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:w-auto"
            >
              + Agregar actividad
            </button>
          </div>

          {/* Aviso no bloqueante si se guardó o existen actividades con el mismo horario (CU-03 3a) */}
          {(statusNotice || duplicateTimesList.length > 0) && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950"
            >
              <span>
                {statusNotice ??
                  `⚠ Aviso: Hay actividades que comparten el mismo horario (${duplicateTimesList.join(", ")}). Podés mantenerlas así o editar su hora cuando quieras.`}
              </span>
              {statusNotice && (
                <button
                  type="button"
                  onClick={() => setStatusNotice(null)}
                  className="rounded-xl border border-amber-400 bg-white px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                >
                  Entendido
                </button>
              )}
            </div>
          )}

          {/* Lista ordenada de actividades del día */}
          <DailyActivityList
            dayLabel={selectedDayOption.label}
            activities={activities}
            duplicateTimes={duplicateTimes}
            onEditActivity={handleOpenEditModal}
            onDeleteActivity={(activityId) => {
              deleteActivity(activityId);
              setStatusNotice(null);
            }}
          />
        </section>
      </div>

      {/* Modal para agregar o editar actividad (HU-04 / CU-03) */}
      <ActivityFormModal
        isOpen={isFormOpen}
        dayLabel={selectedDayOption.label}
        initialActivity={editingActivity}
        getActivitiesAtSameTime={getActivitiesAtSameTime}
        onClose={() => {
          setIsFormOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
      />
    </ScreenLayout>
  );
}
