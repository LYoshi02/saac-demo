import { FEATURES, type FeatureId } from "../../features";
import FeatureCard from "./FeatureCard";

interface HomeScreenProps {
  onSelect: (id: FeatureId) => void;
}

export default function HomeScreen({ onSelect }: HomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">SAAC</h1>
          <p className="text-base text-slate-600">Herramientas de comunicación y rutinas</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h2 className="mb-6 text-xl font-semibold text-slate-800">¿Qué querés usar?</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} onSelect={onSelect} />
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-5xl px-6 py-4 text-sm text-slate-600">
          Pictogramas:{" "}
          <a
            href="https://arasaac.org"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-800 underline"
          >
            ARASAAC
          </a>{" "}
          (Gobierno de Aragón) – licencia CC BY-NC-SA.
        </p>
      </footer>
    </div>
  );
}
