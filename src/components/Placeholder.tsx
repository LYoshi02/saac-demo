interface PlaceholderProps {
  stories: string[];
}

/** Contenido temporal mientras se construye cada pantalla. */
export default function Placeholder({ stories }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-xl font-semibold text-slate-800">En construcción</p>
      <p className="text-base text-slate-600">Historias de usuario: {stories.join(", ")}</p>
    </div>
  );
}

