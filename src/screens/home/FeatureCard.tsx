import type { Accent, Feature, FeatureId } from "../../features";
import { CalendarIcon, StepsIcon, TimerIcon } from "../../components/icons";

const ICONS: Record<FeatureId, (props: { className?: string }) => JSX.Element> = {
  timer: TimerIcon,
  organizer: CalendarIcon,
  sequencer: StepsIcon
};

// Clases completas para que Tailwind no las purgue.
const ACCENTS: Record<Accent, { card: string; icon: string }> = {
  sky: {
    card: "border-sky-200 hover:border-sky-400 focus-visible:ring-sky-300",
    icon: "bg-sky-100 text-sky-800"
  },
  emerald: {
    card: "border-emerald-200 hover:border-emerald-400 focus-visible:ring-emerald-300",
    icon: "bg-emerald-100 text-emerald-800"
  },
  violet: {
    card: "border-violet-200 hover:border-violet-400 focus-visible:ring-violet-300",
    icon: "bg-violet-100 text-violet-800"
  }
};

interface FeatureCardProps {
  feature: Feature;
  onSelect: (id: FeatureId) => void;
}

export default function FeatureCard({ feature, onSelect }: FeatureCardProps) {
  const Icon = ICONS[feature.id];
  const accent = ACCENTS[feature.accent];

  return (
    <button
      type="button"
      onClick={() => onSelect(feature.id)}
      className={`group flex min-h-[12rem] w-full flex-col items-center gap-4 rounded-3xl border-2 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 active:scale-[0.98] ${accent.card}`}
    >
      <span
        className={`flex h-20 w-20 items-center justify-center rounded-2xl ${accent.icon}`}
      >
        <Icon className="h-12 w-12" />
      </span>
      <span className="text-2xl font-bold text-slate-900">{feature.title}</span>
      <span className="text-base text-slate-700">{feature.description}</span>
    </button>
  );
}

