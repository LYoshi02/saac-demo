import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPictogramCategories,
  getPictogramsByCategory,
  searchPictograms
} from "./arasaacService";
import { FALLBACK_PICTOGRAMS } from "./fallbackCatalog";
import type {
  Pictogram,
  PictogramCategory,
  PictogramCategoryId,
  PictogramImageOptions
} from "./types";

export interface UsePictogramSearchOptions {
  /** Texto de búsqueda inicial (por defecto ""). */
  initialQuery?: string;
  /** Categoría activa inicial cuando no hay texto de búsqueda (por defecto null, muestra todas las sugerencias). */
  initialCategory?: PictogramCategoryId | null;
  /** Tiempo de espera (ms) antes de disparar la búsqueda al escribir (por defecto 300). */
  debounceMs?: number;
  /** Cantidad máxima de resultados a solicitar (por defecto 24). */
  limit?: number;
  /** Opciones de formato de imagen para las URLs devueltas. */
  imageOptions?: PictogramImageOptions;
}

export interface UsePictogramSearchReturn {
  /** Texto actual en el campo de búsqueda. */
  query: string;
  /** Actualiza el texto de búsqueda. Al escribir texto, se limpia la categoría activa. */
  setQuery: (value: string) => void;
  /** Categoría actualmente seleccionada, o null si no hay filtro de categoría. */
  selectedCategory: PictogramCategoryId | null;
  /** Selecciona una categoría temática (y limpia el texto de búsqueda para mostrar esa categoría). */
  selectCategory: (categoryId: PictogramCategoryId | null) => void;
  /** Lista de todas las categorías temáticas disponibles (HU-10). */
  categories: PictogramCategory[];
  /** Lista de pictogramas visibles actualmente (resultados de búsqueda o de categoría). */
  pictograms: Pictogram[];
  /** Indica si hay una búsqueda en curso contra la API de ARASAAC. */
  isLoading: boolean;
  /** Mensaje de error en caso de falla inesperada. */
  error: string | null;
  /** Indica si los resultados actuales provienen del catálogo local por falta de conexión. */
  fromFallback: boolean;
  /** Es true cuando se buscó por palabra clave, terminó de cargar y no hubo ninguna coincidencia. */
  hasNoResults: boolean;
  /** Limpia el texto de búsqueda y restablece el estado inicial. */
  clearSearch: () => void;
}

/**
 * Custom hook para buscar pictogramas en ARASAAC con debounce, cancelación
 * automática de peticiones en vuelo (AbortController) y exploración por categorías (HU-10).
 */
export function usePictogramSearch(
  options: UsePictogramSearchOptions = {}
): UsePictogramSearchReturn {
  const {
    initialQuery = "",
    initialCategory = null,
    debounceMs = 300,
    limit = 24,
    imageOptions
  } = options;

  const [query, setQueryState] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<PictogramCategoryId | null>(
    initialCategory
  );
  const [searchResults, setSearchResults] = useState<Pictogram[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fromFallback, setFromFallback] = useState<boolean>(false);
  const [hasSearchedQuery, setHasSearchedQuery] = useState<boolean>(false);

  const categories = useMemo(() => getPictogramCategories(), []);
  const trimmedQuery = query.trim();

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    if (value.trim().length > 0) {
      setSelectedCategory(null);
    } else {
      setIsLoading(false);
      setError(null);
      setFromFallback(false);
      setHasSearchedQuery(false);
      setSearchResults([]);
    }
  }, []);

  const selectCategory = useCallback((categoryId: PictogramCategoryId | null) => {
    setSelectedCategory(categoryId);
    setQueryState("");
    setIsLoading(false);
    setError(null);
    setFromFallback(false);
    setHasSearchedQuery(false);
    setSearchResults([]);
  }, []);

  const clearSearch = useCallback(() => {
    setQueryState("");
    setIsLoading(false);
    setError(null);
    setFromFallback(false);
    setHasSearchedQuery(false);
    setSearchResults([]);
  }, []);

  useEffect(() => {
    if (!trimmedQuery) {
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const timerId = window.setTimeout(async () => {
      try {
        const result = await searchPictograms(trimmedQuery, {
          limit,
          signal: controller.signal,
          imageOptions
        });

        if (!controller.signal.aborted) {
          setSearchResults(result.items);
          setFromFallback(result.fromFallback);
          setHasSearchedQuery(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron buscar los pictogramas en este momento."
        );
        setSearchResults([]);
        setHasSearchedQuery(true);
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [trimmedQuery, debounceMs, limit, imageOptions]);

  const categoryPictograms = useMemo(() => {
    if (selectedCategory) {
      return getPictogramsByCategory(selectedCategory);
    }
    return FALLBACK_PICTOGRAMS.slice(0, limit);
  }, [selectedCategory, limit]);

  const pictograms = trimmedQuery ? searchResults : categoryPictograms;
  const hasNoResults = Boolean(trimmedQuery) && !isLoading && hasSearchedQuery && pictograms.length === 0;

  return {
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
  };
}

