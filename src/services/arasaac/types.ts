/**
 * Tipos de dominio y contratos de la API de ARASAAC (https://api.arasaac.org/v1).
 */

/** Resoluciones estáticas válidas en el CDN de ARASAAC. */
export type ArasaacResolution = 300 | 500 | 2500;

/** Variantes de tono de piel soportadas por el endpoint dinámico de ARASAAC. */
export type ArasaacSkinTone = "white" | "black" | "assian" | "mulatto" | "aztec";

/** Variantes de color de cabello soportadas por el endpoint dinámico de ARASAAC. */
export type ArasaacHairColor =
  | "blonde"
  | "brown"
  | "darkBrown"
  | "gray"
  | "darkGray"
  | "red"
  | "black";

/** Tiempo verbal para el marcador de acción del pictograma. */
export type ArasaacActionTense = "past" | "future";

/** Opciones de imagen para construir la URL de un pictograma de ARASAAC. */
export interface PictogramImageOptions {
  /** Resolución en píxeles (por defecto 500). */
  resolution?: ArasaacResolution;
  /** Si es false, se solicita el pictograma en blanco y negro (por defecto true). */
  color?: boolean;
  /** Color de fondo hexadecimal sin '#' (ej. "FFFFFF") o clave Fitzgerald. */
  backgroundColor?: string;
  /** Tono de piel para figuras humanas. */
  skin?: ArasaacSkinTone;
  /** Color de pelo para figuras humanas. */
  hair?: ArasaacHairColor;
  /** Marca visual de plural en la esquina superior. */
  plural?: boolean;
  /** Marca visual de tiempo verbal (pasado o futuro). */
  action?: ArasaacActionTense;
}

/** Origen del pictograma para trazabilidad y atribución legal (ARASAAC vs IA en HU-11). */
export type PictogramSource = "arasaac" | "ai";

/** Identificadores de categorías temáticas para terapia ocupacional y rutinas (HU-10). */
export type PictogramCategoryId =
  | "higiene"
  | "alimentacion"
  | "vestimenta"
  | "descanso"
  | "escuela"
  | "juego"
  | "emociones"
  | "tiempo";

/** Categoría temática para búsqueda guiada cuando no hay resultados por texto (HU-10). */
export interface PictogramCategory {
  id: PictogramCategoryId;
  label: string;
  description: string;
}

/** Modelo normalizado de pictograma utilizado dentro de la aplicación SAAC. */
export interface Pictogram {
  /** Identificador numérico único (ID oficial de ARASAAC o ID local). */
  id: number;
  /** Etiqueta principal legible en español. */
  label: string;
  /** Palabras clave asociadas para búsqueda y coincidencia. */
  keywords: string[];
  /** Categorías asociadas al pictograma. */
  categories: string[];
  /** URL lista para renderizar en una etiqueta <img>. */
  imageUrl: string;
  /** Fuente del pictograma para cumplir con la atribución requerida. */
  source: PictogramSource;
}

/** Opciones para la búsqueda de pictogramas en el servicio. */
export interface PictogramSearchOptions {
  /** Idioma de búsqueda en ARASAAC (por defecto "es"). */
  locale?: string;
  /** Cantidad máxima de resultados a devolver (por defecto 24). */
  limit?: number;
  /** Cantidad mínima de resultados de bestsearch antes de complementar con search (por defecto 8). */
  minBestResults?: number;
  /** Señal para cancelar peticiones en curso (ej. al tipear rápido en un buscador). */
  signal?: AbortSignal;
  /** Opciones de visualización para las URLs de imagen devueltas. */
  imageOptions?: PictogramImageOptions;
}

/** Resultado estructurado de una búsqueda de pictogramas. */
export interface PictogramSearchResult {
  /** Lista de pictogramas encontrados. */
  items: Pictogram[];
  /** Indica si los resultados provienen del catálogo local por falta de conexión. */
  fromFallback: boolean;
}

/** Palabra clave dentro del objeto crudo devuelto por la API de ARASAAC. */
export interface ArasaacKeywordRaw {
  keyword?: string;
  type?: number;
  meaning?: string;
  plural?: string;
  hasLocution?: boolean;
}

/** Esquema crudo de pictograma devuelto por GET /v1/pictograms/{locale}/... */
export interface ArasaacPictogramRaw {
  _id: number;
  created?: string;
  lastUpdated?: string;
  schematic?: boolean;
  sex?: boolean;
  violence?: boolean;
  aac?: boolean;
  aacColor?: boolean;
  skin?: boolean;
  hair?: boolean;
  downloads?: number;
  categories?: string[];
  tags?: string[];
  keywords?: ArasaacKeywordRaw[];
}

