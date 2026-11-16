/**
 * Utilidad de sonido basada en Web Audio API para emitir la alerta sonora
 * al finalizar el tiempo disponible en el Secuenciador, sin depender de internet
 * ni de archivos de audio externos.
 */

let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

/**
 * Desbloquea el contexto de audio dentro de una interacción directa del usuario (clic/toque)
 * para prevenir bloqueos de reproducción automática en iOS/Safari y navegadores móviles.
 */
export function unlockSequencerAudio(): void {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    // Emitir un pulso inaudible brevísimo para desbloquear el canal en iOS/Safari
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Si el navegador bloquea el audio, la aplicación continúa con el aviso visual
  }
}

/**
 * Reproduce una melodía clara y amable de aviso cuando se termina el tiempo de la secuencia.
 */
export function playTimeUpAlert(): void {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    // Secuencia de notas amables (Do5 - Mi5 - Sol5 - Do6) repetida dos veces
    const notes = [
      { freq: 523.25, start: 0, duration: 0.18 },
      { freq: 659.25, start: 0.2, duration: 0.18 },
      { freq: 783.99, start: 0.4, duration: 0.18 },
      { freq: 1046.5, start: 0.6, duration: 0.35 },
      { freq: 783.99, start: 1.05, duration: 0.18 },
      { freq: 1046.5, start: 1.25, duration: 0.45 }
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0.0001, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.28, now + note.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration + 0.02);
    }
  } catch {
    // Si el dispositivo está silenciado o sin soporte de Web Audio, se ignora sin interrumpir la UI
  }
}
