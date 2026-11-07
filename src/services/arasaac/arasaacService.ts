import {
  DEFAULT_TIME_PICTOGRAM,
  FALLBACK_PICTOGRAMS,
  PICTOGRAM_CATEGORIES,
  filterCatalogByCategory
} from "./fallbackCatalog";
import type {
  ArasaacPictogramRaw,
  Pictogram,
  PictogramCategory,
  PictogramCategoryId,
  PictogramImageOptions,
  PictogramSearchOptions,
  PictogramSearchResult
} from "./types";

const API_BASE_URL = "https://api.arasaac.org/v1";
const STATIC_IMAGE_BASE_URL = "https://static.arasaac.org/pictograms";

const DEFAULT_LOCALE = "es";
const DEFAULT_LIMIT = 24;
const DEFAULT_MIN_BEST_RESULTS = 8;
const DEFAULT_RESOLUTION = 500;

/** Caché en memoria para evitar llamadas repetidas durante la misma sesión. */
const searchCache = new Map<string, Pictogram[]>();
const pictogramByIdCache = new Map<string, Pictogram>();

/**
 * Construye la URL de imagen de un pictograma de ARASAAC.
 * - Si solo se pide resolución estándar en color y sin variantes de piel/cabello,
 *   usa el CDN estático (`static.arasaac.org`) que es más rápido y cacheable.
 * - Si se especifican opciones de personalización (`skin`, `hair`, `color: false`,
 *   `backgroundColor`, `plural`, `action`), usa el endpoint dinámico de la API.
 */
export function getPictogramImageUrl(
  id: number,
  options: PictogramImageOptions = {}
): string {
  const {
    resolution = DEFAULT_RESOLUTION,
    color = true,
    backgroundColor,
    skin,
    hair,
    plural,
    action
  } = options;

  const usesDynamicOptions =
    !color ||
    Boolean(backgroundColor) ||
    Boolean(skin) ||
    Boolean(hair) ||
    Boolean(plural) ||
    Boolean(action);

  if (!usesDynamicOptions) {
    return `${STATIC_IMAGE_BASE_URL}/${id}/${id}_${resolution}.png`;
  }

  const params = new URLSearchParams();
  params.set("download", "false");
  params.set("resolution", String(resolution));

  if (!color) {
    params.set("color", "false");
  }
  if (backgroundColor) {
    params.set("backgroundColor", backgroundColor);
  }
  if (skin) {
    params.set("skin", skin);
  }
  if (hair) {
    params.set("hair", hair);
  }
  if (plural) {
    params.set("plural", "true");
  }
  if (action) {
    params.set("action", action);
  }

  return `${API_BASE_URL}/pictograms/${id}?${params.toString()}`;
}

/**
 * Quita tildes y normaliza espacios/minúsculas para comparaciones locales.
 */
function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * En ARASAAC los verbos en español suelen indexarse en infinitivo no reflexivo
 * (ej. "vestir" en lugar de "vestirse", "cepillar los dientes" en lugar de "cepillarse los dientes").
 * Esta función convierte infinitivos reflexivos comunes para ampliar la búsqueda si hace falta.
 */
function toNonReflexiveSpanishQuery(query: string): string {
  return query
    .trim()
    .replace(/\blavarse los dientes\b/gi, "cepillar los dientes")
    .replace(/\b(\w+?[aeiáéí]r)se\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Determina si un pictograma crudo es apto para mostrarse en el contexto infantil de SAAC.
 */
function isChildSafePictogram(raw: ArasaacPictogramRaw): boolean {
  return !raw.violence && !raw.sex;
}

/**
 * Transforma un objeto crudo de la API de ARASAAC al modelo `Pictogram` de la aplicación.
 */
function mapRawToPictogram(
  raw: ArasaacPictogramRaw,
  preferredQuery?: string,
  imageOptions?: PictogramImageOptions
): Pictogram {
  const keywords = (raw.keywords ?? [])
    .map((entry) => entry.keyword?.trim() ?? "")
    .filter((kw): kw is string => kw.length > 0);

  const uniqueKeywords = Array.from(new Set(keywords));
  const normalizedQuery = preferredQuery ? normalizeText(preferredQuery) : "";

  const matchedKeyword = normalizedQuery
    ? uniqueKeywords.find((kw) => normalizeText(kw) === normalizedQuery) ??
      uniqueKeywords.find((kw) => normalizeText(kw).includes(normalizedQuery))
    : undefined;

  const label = matchedKeyword ?? uniqueKeywords[0] ?? `Pictograma #${raw._id}`;

  return {
    id: raw._id,
    label,
    keywords: uniqueKeywords,
    categories: raw.categories ?? [],
    imageUrl: getPictogramImageUrl(raw._id, imageOptions),
    source: "arasaac"
  };
}

/**
 * Ejecuta una consulta GET contra un endpoint de lista de pictogramas de ARASAAC.
 * Importante: ARASAAC devuelve HTTP 404 cuando no hay coincidencias para el término buscado.
 */
async function fetchPictogramEndpoint(
  endpointPath: string,
  signal?: AbortSignal
): Promise<ArasaacPictogramRaw[]> {
  const response = await fetch(`${API_BASE_URL}${endpointPath}`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    signal
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Error al consultar ARASAAC (${response.status} ${response.statusText})`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as ArasaacPictogramRaw[]) : [];
}

/**
 * Combina listas de pictogramas crudos sin duplicar `_id` y filtrando contenido inapropiado.
 */
function mergeUniquePictograms(
  target: Map<number, ArasaacPictogramRaw>,
  incoming: ArasaacPictogramRaw[],
  limit: number
): void {
  for (const item of incoming) {
    if (target.size >= limit) {
      break;
    }
    if (typeof item._id === "number" && isChildSafePictogram(item) && !target.has(item._id)) {
      target.set(item._id, item);
    }
  }
}

/**
 * Busca coincidencias en el catálogo local de respaldo (fallback sin conexión).
 */
export function searchFallbackCatalog(query: string, limit = DEFAULT_LIMIT): Pictogram[] {
  const normalized = normalizeText(query);
  if (!normalized) {
    return [];
  }

  const nonReflexive = normalizeText(toNonReflexiveSpanishQuery(query));

  return FALLBACK_PICTOGRAMS.filter((item) => {
    const labelNorm = normalizeText(item.label);
    if (labelNorm.includes(normalized) || (nonReflexive && labelNorm.includes(nonReflexive))) {
      return true;
    }
    return item.keywords.some((kw) => {
      const kwNorm = normalizeText(kw);
      return kwNorm.includes(normalized) || (nonReflexive && kwNorm.includes(nonReflexive));
    });
  }).slice(0, limit);
}

/**
 * Busca pictogramas en ARASAAC siguiendo la estrategia de dos pasos:
 * 1. Consulta primero `/bestsearch/{searchText}` para priorizar coincidencias exactas.
 * 2. Si obtiene menos de `minBestResults`, complementa con `/search/{searchText}`.
 * 3. Si el término incluye verbos reflexivos en español (ej. "vestirse") y aún faltan resultados,
 *    intenta la forma infinitiva no reflexiva ("vestir").
 * 4. Si ocurre un fallo de red (modo offline), recurre al catálogo local de respaldo.
 */
export async function searchPictograms(
  query: string,
  options: PictogramSearchOptions = {}
): Promise<PictogramSearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { items: [], fromFallback: false };
  }

  const {
    locale = DEFAULT_LOCALE,
    limit = DEFAULT_LIMIT,
    minBestResults = DEFAULT_MIN_BEST_RESULTS,
    signal,
    imageOptions
  } = options;

  const effectiveMinBest = Math.min(minBestResults, limit);
  const cacheKey = JSON.stringify({
    locale,
    q: normalizeText(cleanQuery),
    limit,
    minBestResults: effectiveMinBest,
    imageOptions
  });

  const cached = searchCache.get(cacheKey);
  if (cached) {
    return { items: cached, fromFallback: false };
  }

  try {
    const collected = new Map<number, ArasaacPictogramRaw>();
    const encodedQuery = encodeURIComponent(cleanQuery);

    // Paso 1: Búsqueda prioritaria en bestsearch
    const bestMatches = await fetchPictogramEndpoint(
      `/pictograms/${encodeURIComponent(locale)}/bestsearch/${encodedQuery}`,
      signal
    );
    mergeUniquePictograms(collected, bestMatches, limit);

    // Paso 2: Complementar con search amplio si bestsearch trajo pocos resultados
    if (collected.size < effectiveMinBest) {
      const broadMatches = await fetchPictogramEndpoint(
        `/pictograms/${encodeURIComponent(locale)}/search/${encodedQuery}`,
        signal
      );
      mergeUniquePictograms(collected, broadMatches, limit);
    }

    // Paso 3: Si es español y tiene verbos reflexivos (ej. "vestirse" -> "vestir"), complementar si sigue vacío/escaso
    if (locale === "es" && collected.size < effectiveMinBest) {
      const nonReflexiveQuery = toNonReflexiveSpanishQuery(cleanQuery);
      if (normalizeText(nonReflexiveQuery) !== normalizeText(cleanQuery)) {
        const encodedAlt = encodeURIComponent(nonReflexiveQuery);
        const altBest = await fetchPictogramEndpoint(
          `/pictograms/${encodeURIComponent(locale)}/bestsearch/${encodedAlt}`,
          signal
        );
        mergeUniquePictograms(collected, altBest, limit);

        if (collected.size < effectiveMinBest) {
          const altBroad = await fetchPictogramEndpoint(
            `/pictograms/${encodeURIComponent(locale)}/search/${encodedAlt}`,
            signal
          );
          mergeUniquePictograms(collected, altBroad, limit);
        }
      }
    }

    const items = Array.from(collected.values())
      .slice(0, limit)
      .map((raw) => mapRawToPictogram(raw, cleanQuery, imageOptions));

    searchCache.set(cacheKey, items);
    return { items, fromFallback: false };
  } catch (error) {
    // Si la petición fue cancelada mediante AbortController, propagamos la cancelación
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    // Fallback offline al catálogo local cuando no hay conexión o falla el servidor
    const fallbackItems = searchFallbackCatalog(cleanQuery, limit);
    return { items: fallbackItems, fromFallback: true };
  }
}

/**
 * Obtiene los detalles de un pictograma específico por su ID numérico en ARASAAC.
 */
export async function getPictogramById(
  id: number,
  options: {
    locale?: string;
    signal?: AbortSignal;
    imageOptions?: PictogramImageOptions;
  } = {}
): Promise<Pictogram | null> {
  const { locale = DEFAULT_LOCALE, signal, imageOptions } = options;
  const cacheKey = JSON.stringify({ id, locale, imageOptions });

  const cached = pictogramByIdCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/pictograms/${encodeURIComponent(locale)}/${id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        signal
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Error al obtener el pictograma #${id} (${response.status})`);
    }

    const raw = (await response.json()) as ArasaacPictogramRaw;
    const pictogram = mapRawToPictogram(raw, undefined, imageOptions);
    pictogramByIdCache.set(cacheKey, pictogram);
    return pictogram;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const localMatch = FALLBACK_PICTOGRAMS.find((item) => item.id === id) ?? null;
    return localMatch;
  }
}

/**
 * Devuelve la lista de categorías disponibles para explorar cuando no hay resultados (HU-10).
 */
export function getPictogramCategories(): PictogramCategory[] {
  return PICTOGRAM_CATEGORIES;
}

/**
 * Devuelve los pictogramas asociados a una categoría temática (HU-10 / CU-09 flujo 3a).
 */
export function getPictogramsByCategory(categoryId: PictogramCategoryId): Pictogram[] {
  return filterCatalogByCategory(categoryId);
}

/**
 * Devuelve el pictograma genérico de "tiempo" requerido por HU-01 cuando no se selecciona uno.
 */
export function getDefaultTimePictogram(): Pictogram {
  return DEFAULT_TIME_PICTOGRAM;
}

/**
 * Limpia la caché en memoria del servicio de pictogramas.
 */
export function clearPictogramCache(): void {
  searchCache.clear();
  pictogramByIdCache.clear();
}

