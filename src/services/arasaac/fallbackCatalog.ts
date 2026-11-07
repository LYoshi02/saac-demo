import type { Pictogram, PictogramCategory, PictogramCategoryId } from "./types";

const STATIC_BASE_URL = "https://static.arasaac.org/pictograms";

function buildStaticUrl(id: number, resolution = 500): string {
  return `${STATIC_BASE_URL}/${id}/${id}_${resolution}.png`;
}

/**
 * Categorías temáticas pensadas para rutinas diarias y sesiones de terapia ocupacional (HU-10).
 */
export const PICTOGRAM_CATEGORIES: PictogramCategory[] = [
  {
    id: "higiene",
    label: "Higiene y baño",
    description: "Lavarse las manos, cepillarse los dientes, ducharse e ir al baño."
  },
  {
    id: "alimentacion",
    label: "Alimentación",
    description: "Desayunar, almorzar, merendar, cenar y tomar agua."
  },
  {
    id: "vestimenta",
    label: "Vestimenta",
    description: "Vestirse, ponerse las zapatillas, campera y preparar la ropa."
  },
  {
    id: "descanso",
    label: "Descanso y sueño",
    description: "Ir a la cama, dormir, despertarse y relajarse."
  },
  {
    id: "escuela",
    label: "Escuela y tareas",
    description: "Ir al colegio, leer, pintar, recortar y guardar útiles."
  },
  {
    id: "juego",
    label: "Juego y recreación",
    description: "Jugar, armar bloques, pelota, plaza y compartir turnos."
  },
  {
    id: "emociones",
    label: "Emociones y estados",
    description: "Contento, tranquilo, cansado, enojado y pedir ayuda."
  },
  {
    id: "tiempo",
    label: "Tiempo y espera",
    description: "Reloj, esperar turno, empezar y terminar una actividad."
  }
];

/**
 * Pictograma genérico de "tiempo" requerido por HU-01 / CU-01 cuando el usuario
 * configura el cronómetro sin elegir un pictograma específico.
 */
export const DEFAULT_TIME_PICTOGRAM: Pictogram = {
  id: 2549,
  label: "Tiempo / Reloj",
  keywords: ["tiempo", "reloj", "hora", "minutos", "cronómetro"],
  categories: ["tiempo"],
  imageUrl: buildStaticUrl(2549),
  source: "arasaac"
};

/**
 * Catálogo semilla con IDs reales verificados de ARASAAC.
 * Se utiliza para:
 * 1. Explorar por categoría cuando una búsqueda por texto no da resultados (CU-09 flujo 3a).
 * 2. Responder búsquedas básicas si no hay conexión a internet.
 */
export const FALLBACK_PICTOGRAMS: Pictogram[] = [
  // Higiene
  {
    id: 2326,
    label: "Lavarse los dientes",
    keywords: ["lavarse los dientes", "cepillar los dientes", "cepillarse", "dientes", "higiene"],
    categories: ["higiene"],
    imageUrl: buildStaticUrl(2326),
    source: "arasaac"
  },
  {
    id: 8975,
    label: "Lavarse las manos",
    keywords: ["lavarse las manos", "lavar las manos", "manos", "jabón", "agua", "higiene"],
    categories: ["higiene"],
    imageUrl: buildStaticUrl(8975),
    source: "arasaac"
  },
  {
    id: 26803,
    label: "Ducharse",
    keywords: ["ducharse", "duchar", "bañarse", "agua", "higiene"],
    categories: ["higiene"],
    imageUrl: buildStaticUrl(26803),
    source: "arasaac"
  },
  {
    id: 6929,
    label: "Ir al baño",
    keywords: ["baño", "cuarto de baño", "inodoro", "pis", "higiene"],
    categories: ["higiene"],
    imageUrl: buildStaticUrl(6929),
    source: "arasaac"
  },

  // Alimentación
  {
    id: 4625,
    label: "Desayunar",
    keywords: ["desayunar", "desayuno", "merendar", "merienda", "leche"],
    categories: ["alimentacion"],
    imageUrl: buildStaticUrl(4625),
    source: "arasaac"
  },
  {
    id: 2349,
    label: "Comer",
    keywords: ["comer", "almorzar", "cenar", "comida", "plato"],
    categories: ["alimentacion"],
    imageUrl: buildStaticUrl(2349),
    source: "arasaac"
  },
  {
    id: 2276,
    label: "Tomar agua",
    keywords: ["beber", "tomar agua", "agua", "vaso", "sed"],
    categories: ["alimentacion"],
    imageUrl: buildStaticUrl(2276),
    source: "arasaac"
  },

  // Vestimenta
  {
    id: 6627,
    label: "Vestirse",
    keywords: ["vestirse", "vestir", "ropa", "ponerse la ropa", "cambiarse"],
    categories: ["vestimenta"],
    imageUrl: buildStaticUrl(6627),
    source: "arasaac"
  },

  // Descanso
  {
    id: 2369,
    label: "Dormir",
    keywords: ["dormir", "descansar", "sueño", "acostarse", "noche"],
    categories: ["descanso"],
    imageUrl: buildStaticUrl(2369),
    source: "arasaac"
  },
  {
    id: 25900,
    label: "Cama",
    keywords: ["cama", "hacer la cama", "acostarse", "habitación"],
    categories: ["descanso"],
    imageUrl: buildStaticUrl(25900),
    source: "arasaac"
  },

  // Escuela
  {
    id: 3082,
    label: "Ir al colegio",
    keywords: ["colegio", "escuela", "clase", "estudiar", "aula"],
    categories: ["escuela"],
    imageUrl: buildStaticUrl(3082),
    source: "arasaac"
  },
  {
    id: 7141,
    label: "Leer",
    keywords: ["leer", "cuento", "libro", "lectura", "tarea"],
    categories: ["escuela"],
    imageUrl: buildStaticUrl(7141),
    source: "arasaac"
  },
  {
    id: 2348,
    label: "Pintar / Dibujar",
    keywords: ["pintar", "dibujar", "colorear", "arte", "lápices"],
    categories: ["escuela", "juego"],
    imageUrl: buildStaticUrl(2348),
    source: "arasaac"
  },

  // Juego
  {
    id: 2439,
    label: "Jugar",
    keywords: ["jugar", "juego", "juguetes", "recreo", "divertirse"],
    categories: ["juego"],
    imageUrl: buildStaticUrl(2439),
    source: "arasaac"
  },

  // Emociones
  {
    id: 3245,
    label: "Contento",
    keywords: ["contento", "feliz", "alegría", "alegre", "bien"],
    categories: ["emociones"],
    imageUrl: buildStaticUrl(3245),
    source: "arasaac"
  },
  {
    id: 31310,
    label: "Tranquilo",
    keywords: ["tranquilo", "calma", "relajado", "respirar"],
    categories: ["emociones", "descanso"],
    imageUrl: buildStaticUrl(31310),
    source: "arasaac"
  },

  // Tiempo
  DEFAULT_TIME_PICTOGRAM,
  {
    id: 36914,
    label: "Esperar",
    keywords: ["esperar", "turno", "paciencia", "tiempo"],
    categories: ["tiempo"],
    imageUrl: buildStaticUrl(36914),
    source: "arasaac"
  }
];

/**
 * Filtra los pictogramas del catálogo base que pertenecen a una categoría.
 */
export function filterCatalogByCategory(categoryId: PictogramCategoryId): Pictogram[] {
  return FALLBACK_PICTOGRAMS.filter((item) => item.categories.includes(categoryId));
}

