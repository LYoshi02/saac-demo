interface AudioActivationResult {
  enabled: boolean;
  message: string;
}

let timerAudioContext: AudioContext | null = null;

function getTimerAudioContext(): AudioContext {
  if (typeof window === "undefined" || !window.AudioContext) {
    throw new Error("Este navegador no permite reproducir el aviso sonoro.");
  }

  if (!timerAudioContext) {
    timerAudioContext = new window.AudioContext();
  }

  return timerAudioContext;
}

export async function activateTimerAudio(): Promise<AudioActivationResult> {
  if (typeof window === "undefined" || !window.AudioContext) {
    return {
      enabled: false,
      message: "Este navegador no permite activar el sonido. El aviso visual seguirá disponible."
    };
  }

  let context: AudioContext;
  try {
    context = getTimerAudioContext();
    await context.resume();
  } catch {
    return {
      enabled: false,
      message:
        "No se pudo activar el sonido. Volvé a tocar el botón; el aviso visual sigue disponible."
    };
  }

  if (context.state !== "running") {
    return {
      enabled: false,
      message:
        "El navegador todavía bloquea el sonido. Volvé a tocar el botón; el aviso visual sigue disponible."
    };
  }

  return { enabled: true, message: "Sonido activado para esta sesión." };
}

export async function playTimerEndAlert(): Promise<void> {
  const context = getTimerAudioContext();
  if (context.state !== "running") {
    await context.resume();
  }
  if (context.state !== "running") {
    throw new Error("El navegador no permitió reproducir el aviso sonoro.");
  }

  const now = context.currentTime;
  const notes = [
    { frequency: 659.25, start: 0, duration: 0.2 },
    { frequency: 783.99, start: 0.24, duration: 0.2 },
    { frequency: 1046.5, start: 0.48, duration: 0.36 }
  ];

  for (const note of notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + note.start;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + note.duration + 0.02);
  }
}

export async function playTimerTick(tickNumber: number): Promise<void> {
  const context = getTimerAudioContext();
  if (context.state !== "running") {
    await context.resume();
  }
  if (context.state !== "running") {
    throw new Error("El navegador no permitió reproducir el tic del cronómetro.");
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequency = tickNumber % 2 === 0 ? 1500 : 1200;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.04);
}
