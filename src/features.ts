/**
 * Módulos del MVP (solo requisitos priorizados como Must en specs/).
 * El buscador de pictogramas (HU-10) es transversal y se accede desde cada módulo.
 */
export type FeatureId = "timer" | "organizer" | "sequencer";

export type Accent = "sky" | "emerald" | "violet";

export interface Feature {
  id: FeatureId;
  title: string;
  description: string;
  /** Trazabilidad con las historias de usuario. */
  stories: string[];
  accent: Accent;
}

export const FEATURES: Feature[] = [
  {
    id: "timer",
    title: "Cronómetro",
    description: "Controlá el tiempo de una actividad con un indicador visual.",
    stories: ["HU-01", "HU-02"],
    accent: "sky"
  },
  {
    id: "organizer",
    title: "Organizador",
    description: "Armá la agenda del día con horarios y pictogramas.",
    stories: ["HU-04"],
    accent: "emerald"
  },
  {
    id: "sequencer",
    title: "Secuenciador",
    description: "Creá rutinas y mostralas paso a paso.",
    stories: ["HU-07", "HU-08"],
    accent: "violet"
  }
];

