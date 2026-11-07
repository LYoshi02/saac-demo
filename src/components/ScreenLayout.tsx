import type { ReactNode } from "react";

interface ScreenLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

/** Estructura común de las pantallas de cada módulo: encabezado con "Volver" + contenido. */
export default function ScreenLayout({ title, onBack, children }: ScreenLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] rounded-2xl border-2 border-slate-300 px-4 py-2 text-base font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
          >
            ← Inicio
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

