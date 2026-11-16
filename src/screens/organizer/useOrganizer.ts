import { useCallback, useEffect, useMemo, useState } from "react";
import { getPictogramImageUrl } from "../../services/arasaac";
import {
  DAYS_OF_WEEK,
  type ActivityFormValues,
  type DailyActivity,
  type DailySchedulesByDay,
  type DayOfWeek
} from "./types";

const ORGANIZER_STORAGE_KEY = "saac_organizer_daily_v1";

/**
 * Obtiene el día de la semana actual según la fecha del dispositivo.
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const mapping: Record<number, DayOfWeek> = {
    0: "domingo",
    1: "lunes",
    2: "martes",
    3: "miercoles",
    4: "jueves",
    5: "viernes",
    6: "sabado"
  };
  return mapping[jsDay] ?? "lunes";
}

/**
 * Ordena las actividades cronológicamente por hora ("HH:MM") (HU-04 / CU-03 paso 3).
 */
export function sortActivitiesByTime(activities: DailyActivity[]): DailyActivity[] {
  return [...activities].sort((a, b) => a.time.localeCompare(b.time));
}

function generateActivityId(): string {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Crea una agenda diaria inicial de ejemplo en el día actual para que el terapeuta
 * o familiar tenga actividades de muestra listas en la primera sesión.
 */
function createDefaultSchedules(): DailySchedulesByDay {
  const currentDay = getCurrentDayOfWeek();

  const sampleActivities: DailyActivity[] = sortActivitiesByTime([
    {
      id: "seed-act-1",
      time: "08:30",
      title: "Desayunar",
      pictogram: {
        id: 4625,
        label: "Desayunar",
        keywords: ["desayunar", "desayuno", "leche"],
        categories: ["alimentacion"],
        imageUrl: getPictogramImageUrl(4625),
        source: "arasaac"
      }
    },
    {
      id: "seed-act-2",
      time: "09:00",
      title: "Lavarse los dientes",
      pictogram: {
        id: 2326,
        label: "Lavarse los dientes",
        keywords: ["lavarse los dientes", "cepillar los dientes", "higiene"],
        categories: ["higiene"],
        imageUrl: getPictogramImageUrl(2326),
        source: "arasaac"
      }
    },
    {
      id: "seed-act-3",
      time: "09:30",
      title: "Ir al colegio",
      pictogram: {
        id: 3082,
        label: "Ir al colegio",
        keywords: ["colegio", "escuela", "clase"],
        categories: ["escuela"],
        imageUrl: getPictogramImageUrl(3082),
        source: "arasaac"
      }
    },
    {
      id: "seed-act-4",
      time: "12:30",
      title: "Almorzar",
      pictogram: {
        id: 2349,
        label: "Comer",
        keywords: ["comer", "almorzar", "comida"],
        categories: ["alimentacion"],
        imageUrl: getPictogramImageUrl(2349),
        source: "arasaac"
      }
    },
    {
      id: "seed-act-5",
      time: "17:00",
      title: "Jugar",
      pictogram: {
        id: 2439,
        label: "Jugar",
        keywords: ["jugar", "juego", "juguetes"],
        categories: ["juego"],
        imageUrl: getPictogramImageUrl(2439),
        source: "arasaac"
      }
    }
  ]);

  const emptySchedules: DailySchedulesByDay = {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: []
  };

  return {
    ...emptySchedules,
    [currentDay]: sampleActivities
  };
}

function loadSchedulesFromStorage(): DailySchedulesByDay {
  try {
    const raw = window.localStorage.getItem(ORGANIZER_STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultSchedules();
      window.localStorage.setItem(ORGANIZER_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<DailySchedulesByDay>;
    const normalized: DailySchedulesByDay = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: []
    };

    for (const day of DAYS_OF_WEEK) {
      const list = parsed?.[day.id];
      normalized[day.id] = Array.isArray(list) ? sortActivitiesByTime(list) : [];
    }

    return normalized;
  } catch {
    return createDefaultSchedules();
  }
}

/**
 * Hook de estado y persistencia del módulo Organizador para HU-04 / CU-03 (Must).
 */
export function useOrganizer() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getCurrentDayOfWeek());
  const [schedulesByDay, setSchedulesByDay] = useState<DailySchedulesByDay>(() =>
    loadSchedulesFromStorage()
  );

  // Persistir cambios en localStorage automáticamente
  useEffect(() => {
    try {
      window.localStorage.setItem(ORGANIZER_STORAGE_KEY, JSON.stringify(schedulesByDay));
    } catch {
      // Ignorar si el almacenamiento local está lleno o bloqueado
    }
  }, [schedulesByDay]);

  const activities = useMemo(
    () => schedulesByDay[selectedDay] ?? [],
    [schedulesByDay, selectedDay]
  );

  /**
   * Conjunto de horas ("HH:MM") que tienen dos o más actividades en el día seleccionado
   * (HU-04 / CU-03 excepción 3a).
   */
  const duplicateTimes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const activity of activities) {
      counts.set(activity.time, (counts.get(activity.time) ?? 0) + 1);
    }

    const duplicates = new Set<string>();
    for (const [time, count] of counts.entries()) {
      if (count > 1) {
        duplicates.add(time);
      }
    }
    return duplicates;
  }, [activities]);

  /**
   * Devuelve las actividades del día actual que coinciden con `time`, excluyendo opcionalmente
   * la actividad que se está editando. Permite mostrar el aviso no bloqueante de horario repetido.
   */
  const getActivitiesAtSameTime = useCallback(
    (time: string, excludeActivityId?: string): DailyActivity[] => {
      const cleanTime = time.trim();
      if (!cleanTime) {
        return [];
      }
      return activities.filter(
        (item) => item.time === cleanTime && item.id !== excludeActivityId
      );
    },
    [activities]
  );

  /**
   * Agrega una nueva actividad al día seleccionado y reordena la lista por hora (HU-04 / CU-03).
   */
  const addActivity = useCallback(
    (values: ActivityFormValues): DailyActivity => {
      const cleanTitle = values.title.trim() || values.pictogram.label;
      const newActivity: DailyActivity = {
        id: generateActivityId(),
        time: values.time,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        pictogram: values.pictogram
      };

      setSchedulesByDay((prev) => ({
        ...prev,
        [selectedDay]: sortActivitiesByTime([...(prev[selectedDay] ?? []), newActivity])
      }));

      return newActivity;
    },
    [selectedDay]
  );

  /**
   * Edita hora, nombre o pictograma de una actividad existente y reordena por hora (CU-03 2a).
   */
  const updateActivity = useCallback(
    (activityId: string, values: ActivityFormValues) => {
      const cleanTitle = values.title.trim() || values.pictogram.label;
      const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      setSchedulesByDay((prev) => {
        const currentList = prev[selectedDay] ?? [];
        const updatedList = currentList.map((item) =>
          item.id === activityId
            ? {
                ...item,
                time: values.time,
                title: formattedTitle,
                pictogram: values.pictogram
              }
            : item
        );

        return {
          ...prev,
          [selectedDay]: sortActivitiesByTime(updatedList)
        };
      });
    },
    [selectedDay]
  );

  /**
   * Elimina una actividad del día seleccionado (CU-03 2b).
   */
  const deleteActivity = useCallback(
    (activityId: string) => {
      setSchedulesByDay((prev) => ({
        ...prev,
        [selectedDay]: (prev[selectedDay] ?? []).filter((item) => item.id !== activityId)
      }));
    },
    [selectedDay]
  );

  return {
    selectedDay,
    setSelectedDay,
    schedulesByDay,
    activities,
    duplicateTimes,
    getActivitiesAtSameTime,
    addActivity,
    updateActivity,
    deleteActivity
  };
}
