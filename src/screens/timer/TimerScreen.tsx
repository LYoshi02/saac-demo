import { useEffect, useId, useRef, useState } from "react";
import PictogramPickerModal from "../../components/pictogram-picker/PictogramPickerModal";
import ScreenLayout from "../../components/ScreenLayout";
import { getDefaultTimePictogram, type Pictogram } from "../../services/arasaac";
import TimerProgress from "./TimerProgress";
import {
  activateTimerAudio,
  playTimerEndAlert,
  playTimerTick
} from "./soundAlert";

type TimerPhase = "setup" | "running" | "paused" | "finished";
type AudioStatus = "pending" | "activating" | "enabled" | "unavailable";

const TIMER_UPDATE_INTERVAL_MS = 50;

function parseTimePart(value: string): number | null {
  if (value.trim() === "") {
    return 0;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface TimerScreenProps {
  onBack: () => void;
}

export default function TimerScreen({ onBack }: TimerScreenProps) {
  const minutesInputId = useId();
  const secondsInputId = useId();
  const pictogramPreviewId = useId();
  const durationErrorId = useId();

  const [minutesInput, setMinutesInput] = useState("");
  const [secondsInput, setSecondsInput] = useState("");
  const [selectedPictogram, setSelectedPictogram] = useState<Pictogram | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>("setup");
  const [remainingMs, setRemainingMs] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("pending");
  const [audioMessage, setAudioMessage] = useState(
    "El aviso sonoro está activado. Si el navegador lo bloquea, podés habilitarlo antes de empezar."
  );

  const deadlineRef = useRef(0);
  const remainingRef = useRef(0);
  const alertPlayedRef = useRef(false);
  const lastTickSecondRef = useRef(0);
  const tickNumberRef = useRef(0);
  const pictogram = selectedPictogram ?? getDefaultTimePictogram();

  const minutes = parseTimePart(minutesInput);
  const seconds = parseTimePart(secondsInput);
  let durationError: string | null = null;
  let durationSeconds: number | null = null;

  if (minutes === null || seconds === null) {
    durationError = "Ingresá minutos y segundos como números enteros de 0 o más.";
  } else if (minutes > 50) {
    durationError = "La duración máxima es de 50 minutos.";
  } else if (seconds > 59) {
    durationError = "Los segundos tienen que estar entre 0 y 59.";
  } else {
    durationSeconds = minutes * 60 + seconds;
    if (durationSeconds < 1) {
      durationError = "La duración tiene que ser de al menos 1 segundo.";
    } else if (durationSeconds > 50 * 60) {
      durationError = "La duración máxima es de 50 minutos.";
    }
  }

  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    const updateRemainingTime = () => {
      const nextRemainingMs = Math.max(0, deadlineRef.current - performance.now());
      remainingRef.current = nextRemainingMs;
      setRemainingMs(nextRemainingMs);

      const remainingSeconds = Math.ceil(nextRemainingMs / 1000);
      const tickDue = remainingSeconds < lastTickSecondRef.current;
      lastTickSecondRef.current = remainingSeconds;

      if (tickDue && soundEnabled && audioStatus === "enabled") {
        tickNumberRef.current += 1;
        void playTimerTick(tickNumberRef.current).catch(() => {
          setAudioStatus("unavailable");
          setAudioMessage(
            "No se pudo reproducir el tic del cronómetro. El indicador visual sigue disponible."
          );
        });
      }

      if (nextRemainingMs === 0) {
        setPhase("finished");
        if (!alertPlayedRef.current) {
          alertPlayedRef.current = true;
          if (soundEnabled) {
            void playTimerEndAlert().catch(() => {
              setAudioStatus("unavailable");
              setAudioMessage(
                "No se pudo reproducir el aviso sonoro. La finalización visual sigue disponible."
              );
            });
          }
        }
      }
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, TIMER_UPDATE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [audioStatus, phase, soundEnabled]);

  const handleStart = () => {
    setShowValidation(true);
    if (durationError || durationSeconds === null) {
      return;
    }

    if (soundEnabled && audioStatus !== "enabled") {
      void handleActivateAudio();
    }

    remainingRef.current = durationSeconds * 1000;
    deadlineRef.current = performance.now() + remainingRef.current;
    alertPlayedRef.current = false;
    lastTickSecondRef.current = Math.ceil(remainingRef.current / 1000);
    tickNumberRef.current = 0;
    setRemainingMs(remainingRef.current);
    setPhase("running");
  };

  const handlePause = () => {
    const nextRemainingMs = Math.max(0, deadlineRef.current - performance.now());
    if (nextRemainingMs === 0) {
      return;
    }

    remainingRef.current = nextRemainingMs;
    setRemainingMs(nextRemainingMs);
    setPhase("paused");
  };

  const handleResume = () => {
    lastTickSecondRef.current = Math.ceil(remainingRef.current / 1000);
    deadlineRef.current = performance.now() + remainingRef.current;
    setPhase("running");
  };

  const handleReset = () => {
    if (durationSeconds === null) {
      setPhase("setup");
      setRemainingMs(0);
      return;
    }

    remainingRef.current = durationSeconds * 1000;
    setRemainingMs(remainingRef.current);
    alertPlayedRef.current = false;
    lastTickSecondRef.current = Math.ceil(remainingRef.current / 1000);
    tickNumberRef.current = 0;
    setPhase("paused");
  };

  const handleEditConfiguration = () => {
    setPhase("setup");
    setRemainingMs(0);
    remainingRef.current = 0;
    alertPlayedRef.current = false;
  };

  const handleActivateAudio = async () => {
    setAudioStatus("activating");
    setAudioMessage("Activando el sonido…");

    const result = await activateTimerAudio();
    if (result.enabled) {
      setAudioStatus("enabled");
      setAudioMessage("Sonido activado para esta sesión.");
    } else {
      setAudioStatus("unavailable");
      setAudioMessage(result.message);
    }
  };

  const handleToggleSound = async () => {
    if (soundEnabled && audioStatus === "enabled") {
      setSoundEnabled(false);
      setAudioMessage("Aviso sonoro desactivado. El aviso visual sigue disponible.");
      return;
    }

    if (!soundEnabled) {
      setSoundEnabled(true);
      if (audioStatus === "enabled") {
        setAudioMessage("Aviso sonoro activado para esta sesión.");
        return;
      }
    }

    await handleActivateAudio();
  };

  const totalDurationMs = (durationSeconds ?? 0) * 1000;

  return (
    <ScreenLayout title="Cronómetro" onBack={onBack}>
      {phase === "setup" ? (
        <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Prepará el tiempo de la actividad
            </h2>
            <p className="text-base text-slate-700">
              Elegí cuánto va a durar y el pictograma que la representa.
            </p>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-lg font-bold text-slate-900">Duración</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor={minutesInputId} className="font-semibold text-slate-800">
                  Minutos (0 a 50)
                </label>
                <input
                  id={minutesInputId}
                  type="number"
                  min={0}
                  max={50}
                  step={1}
                  inputMode="numeric"
                  value={minutesInput}
                  onChange={(event) => setMinutesInput(event.target.value)}
                  aria-invalid={showValidation && Boolean(durationError)}
                  aria-describedby={
                    showValidation && durationError ? durationErrorId : undefined
                  }
                  className="min-h-[52px] rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg font-bold text-slate-900 focus:border-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={secondsInputId} className="font-semibold text-slate-800">
                  Segundos (0 a 59)
                </label>
                <input
                  id={secondsInputId}
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  inputMode="numeric"
                  value={secondsInput}
                  onChange={(event) => setSecondsInput(event.target.value)}
                  aria-invalid={showValidation && Boolean(durationError)}
                  aria-describedby={
                    showValidation && durationError ? durationErrorId : undefined
                  }
                  className="min-h-[52px] rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg font-bold text-slate-900 focus:border-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              La duración puede ser de 1 segundo a 50 minutos.
            </p>
            {showValidation && durationError && (
              <p id={durationErrorId} role="alert" className="font-semibold text-red-800">
                {durationError}
              </p>
            )}
          </fieldset>

          <section
            aria-labelledby={pictogramPreviewId}
            className="flex flex-col gap-4 rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:p-5"
          >
            <img
              src={pictogram.imageUrl}
              alt={pictogram.label}
              className="h-28 w-28 self-center rounded-2xl bg-white object-contain p-2 sm:self-auto"
            />
            <div className="flex flex-1 flex-col gap-2">
              <h3 id={pictogramPreviewId} className="text-lg font-bold text-slate-900">
                Pictograma de la actividad
              </h3>
              <p className="text-slate-700">{pictogram.label}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="min-h-[48px] w-full rounded-2xl bg-sky-600 px-4 py-2 font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:w-auto"
                >
                  {selectedPictogram ? "Cambiar pictograma" : "Elegir pictograma"}
                </button>
                {selectedPictogram && (
                  <button
                    type="button"
                    onClick={() => setSelectedPictogram(null)}
                    className="min-h-[48px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400 sm:w-auto"
                  >
                    Usar pictograma genérico
                  </button>
                )}
              </div>
            </div>
          </section>

          <section
            aria-label="Configuración del sonido"
            className="flex flex-col gap-3 rounded-3xl border-2 border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-slate-900">Sonidos del cronómetro</h3>
              <p role="status" aria-live="polite" className="text-sm text-slate-700">
                {audioMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleToggleSound()}
              disabled={audioStatus === "activating"}
              className="min-h-[48px] shrink-0 rounded-2xl border-2 border-sky-700 bg-white px-4 py-2 font-bold text-sky-900 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {audioStatus === "activating"
                ? "Activando…"
                : soundEnabled && audioStatus === "enabled"
                  ? "Desactivar sonido"
                  : soundEnabled
                    ? "Tocar para activar sonido"
                    : "Activar sonido"}
            </button>
          </section>

          <button
            type="button"
            onClick={handleStart}
            className="min-h-[56px] rounded-2xl bg-sky-700 px-6 py-3 text-lg font-extrabold text-white shadow-sm transition hover:bg-sky-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            Iniciar cronómetro
          </button>
          <PictogramPickerModal
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            onSelect={setSelectedPictogram}
            selectedId={selectedPictogram?.id ?? null}
            accent="sky"
          />
        </section>
      ) : (
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border-2 border-sky-200 bg-white p-5 text-center shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {phase === "finished" ? "¡Se terminó el tiempo!" : "Tiempo de la actividad"}
            </h2>
            <p className="text-lg font-semibold text-slate-700">{pictogram.label}</p>
          </div>

          <TimerProgress
            totalMs={totalDurationMs}
            remainingMs={remainingMs}
            pictogram={pictogram}
          />

          <p
            role="timer"
            aria-live={phase === "finished" ? "assertive" : "off"}
            className="text-5xl font-extrabold tabular-nums text-slate-900"
          >
            {formatDuration(Math.ceil(remainingMs / 1000))}
          </p>

          {phase === "running" && (
            <div className="flex w-full flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handlePause}
                className="min-h-[56px] rounded-2xl bg-sky-700 px-6 py-3 text-lg font-extrabold text-white transition hover:bg-sky-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                Pausar
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[56px] rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 text-lg font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
              >
                Reiniciar
              </button>
            </div>
          )}

          {phase === "paused" && (
            <div className="flex w-full flex-wrap justify-center gap-3">
              <p className="w-full font-semibold text-slate-700">El cronómetro está en pausa.</p>
              <button
                type="button"
                onClick={handleResume}
                className="min-h-[56px] rounded-2xl bg-sky-700 px-6 py-3 text-lg font-extrabold text-white transition hover:bg-sky-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                Reanudar
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[56px] rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 text-lg font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
              >
                Reiniciar
              </button>
              <button
                type="button"
                onClick={handleEditConfiguration}
                className="min-h-[56px] rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 text-lg font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
              >
                Cambiar configuración
              </button>
            </div>
          )}

          {phase === "finished" && (
            <div className="flex w-full flex-wrap justify-center gap-3">
              {(!soundEnabled || audioStatus !== "enabled") && (
                <p role="status" className="w-full text-slate-700">
                  {audioMessage}
                </p>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[56px] rounded-2xl bg-sky-700 px-6 py-3 text-lg font-extrabold text-white transition hover:bg-sky-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                Reiniciar
              </button>
              <button
                type="button"
                onClick={handleEditConfiguration}
                className="min-h-[56px] rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 text-lg font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
              >
                Configurar otra actividad
              </button>
            </div>
          )}
        </section>
      )}
    </ScreenLayout>
  );
}
