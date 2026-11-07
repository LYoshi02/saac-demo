import { useId } from "react";
import type { Accent } from "../../features";
import {
  getDefaultTimePictogram,
  usePictogramSearch,
  type Pictogram,
  type PictogramCategoryId,
  type PictogramImageOptions
} from "../../services/arasaac";

/**
 * Clases completas estáticas por acento de módulo para evitar que Tailwind las purgue.
 */
const ACCENT_STYLES: Record<
  Accent,
  {
    inputFocus: string;
    chipActive: string;
    chipInactive: string;
    cardSelected: string;
    cardUnselected: string;
    badgeSelected: string;
    buttonPrimary: string;
  }
> = {
  sky: {
    inputFocus: "focus:border-sky-500 focus-visible:ring-sky-300",
    chipActive:
      "border-sky-600 bg-sky-600 text-white focus-visible:ring-sky-300",
    chipInactive:
      "border-slate-300 bg-white text-slate-800 hover:border-sky-400 hover:bg-sky-50 focus-visible:ring-sky-300",
    cardSelected:
      "border-sky-600 bg-sky-50 ring-4 ring-sky-200 focus-visible:ring-sky-400",
    cardUnselected:
      "border-slate-200 bg-white hover:border-sky-400 focus-visible:ring-sky-300",
    badgeSelected: "bg-sky-700 text-white",
    buttonPrimary:
      "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-300"
  },
  emerald: {
    inputFocus: "focus:border-emerald-500 focus-visible:ring-emerald-300",
    chipActive:
      "border-emerald-600 bg-emerald-600 text-white focus-visible:ring-emerald-300",
    chipInactive:
      "border-slate-300 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50 focus-visible:ring-emerald-300",
    cardSelected:
      "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-200 focus-visible:ring-emerald-400",
    cardUnselected:
      "border-slate-200 bg-white hover:border-emerald-400 focus-visible:ring-emerald-300",
    badgeSelected: "bg-emerald-700 text-white",
    buttonPrimary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300"
  },
  violet: {
    inputFocus: "focus:border-violet-500 focus-visible:ring-violet-300",
    chipActive:
      "border-violet-600 bg-violet-600 text-white focus-visible:ring-violet-300",
    chipInactive:
      "border-slate-300 bg-white text-slate-800 hover:border-violet-400 hover:bg-violet-50 focus-visible:ring-violet-300",
    cardSelected:
      "border-violet-600 bg-violet-50 ring-4 ring-violet-200 focus-visible:ring-violet-400",
    cardUnselected:
      "border-slate-200 bg-white hover:border-violet-400 focus-visible:ring-violet-300",
    badgeSelected: "bg-violet-700 text-white",
    buttonPrimary:
      "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-300"
  }
};

export interface PictogramPickerProps {
  /** ID del pictograma seleccionado actualmente para resaltarlo en la grilla. */
  selectedId?: number | null;
  /** Callback que se ejecuta cuando el usuario elige un pictograma. */
  onSelect: (pictogram: Pictogram) => void;
  /** Color de acento del módulo donde se inserta ("sky" | "emerald" | "violet"). */
  accent?: Accent;
  /** Categoría inicial seleccionada (opcional). */
  initialCategory?: PictogramCategoryId | null;
  /** Texto inicial en el buscador (opcional). */
  initialQuery?: string;
  /** Muestra un botón de acceso rápido para usar el pictograma genérico de tiempo (HU-01). */
  allowDefaultTimePictogram?: boolean;
  /** Callback opcional para disparar la generación con IA (HU-11 / CU-10) cuando no hay resultados. */
  onRequestAiGeneration?: (query: string) => void;
  /** Opciones adicionales para el formato de imagen de ARASAAC. */
  imageOptions?: PictogramImageOptions;
}

/**
 * Componente transversal para buscar y seleccionar pictogramas de ARASAAC (HU-10 / CU-09).
 * Puede utilizarse embebido dentro de un formulario o dentro de `PictogramPickerModal`.
 */
export default function PictogramPicker({
  selectedId = null,
  onSelect,
  accent = "sky",
  initialCategory = null,
  initialQuery = "",
  allowDefaultTimePictogram = false,
  onRequestAiGeneration,
  imageOptions
}: PictogramPickerProps) {
  const searchInputId = useId();
  const styles = ACCENT_STYLES[accent];

  const {
    query,
    setQuery,
    selectedCategory,
    selectCategory,
    categories,
    pictograms,
    isLoading,
    error,
    fromFallback,
    hasNoResults,
    clearSearch
  } = usePictogramSearch({
    initialQuery,
    initialCategory,
    imageOptions
  });

  const handleUseDefaultTime = () => {
    onSelect(getDefaultTimePictogram());
  };

  return (
    <section
      aria-label="Buscador de pictogramas"
      className="flex flex-col gap-5 rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 sm:p-6"
    >
      {/* Barra de búsqueda por palabra clave */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={searchInputId}
            className="text-lg font-bold text-slate-900"
          >
            Buscá un pictograma
          </label>

          {allowDefaultTimePictogram && (
            <button
              type="button"
              onClick={handleUseDefaultTime}
              className="min-h-[44px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
            >
              Usar pictograma genérico de tiempo
            </button>
          )}
        </div>

        <div className="relative flex items-center gap-2">
          <input
            id={searchInputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Escribí una actividad o palabra clave (ej. lavarse los dientes, comer, jugar)…"
            className={`min-h-[52px] w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:ring-4 ${styles.inputFocus}`}
          />

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="min-h-[52px] shrink-0 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filtro rápido por categorías (HU-10) */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Categorías sugeridas:
        </span>
        <div
          role="group"
          aria-label="Categorías de pictogramas"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => selectCategory(null)}
            aria-pressed={!query.trim() && selectedCategory === null}
            className={`min-h-[44px] rounded-2xl border-2 px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 ${
              !query.trim() && selectedCategory === null
                ? styles.chipActive
                : styles.chipInactive
            }`}
          >
            Destacados
          </button>

          {categories.map((category) => {
            const isActive = !query.trim() && selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                aria-pressed={isActive}
                title={category.description}
                className={`min-h-[44px] rounded-2xl border-2 px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 ${
                  isActive ? styles.chipActive : styles.chipInactive
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aviso de modo sin conexión (fallback) */}
      {fromFallback && (
        <div
          role="status"
          className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
        >
          Sin conexión con el servidor de ARASAAC. Mostrando pictogramas guardados en la biblioteca local.
        </div>
      )}

      {/* Mensaje de error si ocurriera algún problema inesperado */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
        >
          {error}
        </div>
      )}

      {/* Indicador de carga */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800" />
          <p className="text-base font-semibold text-slate-800">
            Buscando pictogramas para «{query.trim()}»…
          </p>
        </div>
      )}

      {/* Estado "Sin resultados" (HU-10 / CU-09 flujo alternativo 3a) */}
      {!isLoading && hasNoResults && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center"
        >
          <p className="text-xl font-bold text-slate-900">Sin resultados</p>
          <p className="max-w-lg text-base text-slate-700">
            No encontramos pictogramas que coincidan con{" "}
            <span className="font-semibold text-slate-900">«{query.trim()}»</span>.
            Probá con otra palabra o elegí una categoría:
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className={`min-h-[48px] rounded-2xl border-2 px-4 py-2 text-base font-semibold transition focus:outline-none focus-visible:ring-4 ${styles.chipInactive}`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {onRequestAiGeneration && (
            <div className="mt-2 flex flex-col items-center gap-2 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                ¿Necesitás representar una actividad específica que no está en la biblioteca?
              </p>
              <button
                type="button"
                onClick={() => onRequestAiGeneration(query.trim())}
                className={`min-h-[48px] rounded-2xl px-5 py-2.5 text-base font-bold shadow-sm transition focus:outline-none focus-visible:ring-4 ${styles.buttonPrimary}`}
              >
                Generar pictograma con IA
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grilla de resultados */}
      {!isLoading && pictograms.length > 0 && (
        <div
          role="listbox"
          aria-label="Resultados de pictogramas"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
        >
          {pictograms.map((pictogram) => {
            const isSelected = selectedId === pictogram.id;
            return (
              <button
                key={pictogram.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(pictogram)}
                className={`group relative flex min-h-[11rem] flex-col items-center justify-between gap-3 rounded-3xl border-2 p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 active:scale-[0.98] ${
                  isSelected ? styles.cardSelected : styles.cardUnselected
                }`}
              >
                {isSelected && (
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${styles.badgeSelected}`}
                  >
                    Elegido
                  </span>
                )}

                {pictogram.source === "ai" && (
                  <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    Generado con IA
                  </span>
                )}

                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-2">
                  <img
                    src={pictogram.imageUrl}
                    alt={pictogram.label}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>

                <span className="line-clamp-2 text-base font-bold capitalize text-slate-900">
                  {pictogram.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pie de atribución legal requerida por ARASAAC */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
        <span>
          Símbolos pictográficos de{" "}
          <a
            href="https://arasaac.org"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-800 underline"
          >
            ARASAAC
          </a>{" "}
          (Gobierno de Aragón) – Licencia CC BY-NC-SA.
        </span>
        <span>Mostrando {pictograms.length} pictogramas</span>
      </footer>
    </section>
  );
}

