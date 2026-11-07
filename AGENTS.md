# AGENTS.md — Guía para Agentes de IA y Desarrolladores

## 1. Contexto del Proyecto

**SAAC – Herramientas de comunicación y rutinas para terapia ocupacional** es una aplicación web diseñada para asistir a terapeutas ocupacionales y familiares/cuidadores en el acompañamiento de niños mediante apoyos visuales (pictogramas de **ARASAAC**).

### Roles de Usuario
- **Terapeuta ocupacional / Familiar (Actores principales):** Configuran y operan las herramientas (cronómetro, agenda diaria, secuencias de pasos).
- **Niño (Actor asistido):** Observa y sigue la información visual en pantalla con apoyo; la interfaz debe ser clara, predecible y comprensible sin necesidad de saber leer o interpretar números complejos.

---

## 2. Stack Tecnológico y Comandos

- **Framework UI:** React 18 (`react`, `react-dom`)
- **Lenguaje:** TypeScript 5 (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`)
- **Bundler / Dev Server:** Vite 6
- **Estilos:** Tailwind CSS 3
- **Navegación:** Estado local en `src/App.tsx` (sin `react-router` por ahora)

### Comandos Principales
```bash
npm run dev      # Inicia el servidor de desarrollo de Vite
npm run build    # Ejecuta verificación de tipos (tsc) y empaquetado de producción (vite build)
npm run preview  # Previsualiza el build de producción
```

> **Regla de verificación:** Antes de dar por finalizada cualquier tarea, ejecutá siempre `npm run build` para validar que no existan errores de tipos en TypeScript ni problemas de empaquetado.

---

## 3. Arquitectura de Carpetas y Prevención de Conflictos en Git

El repositorio está estructurado para que distintos integrantes del equipo trabajen en paralelo sobre pantallas diferentes **sin generar conflictos de merge en Git**:

```text
saac-demo/
├── specs/                        # Especificaciones funcionales (Casos de Uso e Historias de Usuario)
│   ├── casos de uso requisitos funcionales.md
│   └── historias de usuario requisitos funcionales.md
├── src/
│   ├── components/               # SOLO componentes transversales/compartidos entre pantallas
│   │   ├── icons.tsx
│   │   ├── Placeholder.tsx
│   │   └── ScreenLayout.tsx
│   ├── screens/                  # Carpetas independientes por pantalla/módulo
│   │   ├── home/                 # Pantalla de inicio (HomeScreen, FeatureCard, index.ts)
│   │   ├── timer/                # Módulo Cronómetro (HU-01, HU-02, HU-03)
│   │   ├── organizer/            # Módulo Organizador / Agenda (HU-04, HU-05, HU-06)
│   │   └── sequencer/            # Módulo Secuenciador de rutinas (HU-07, HU-08, HU-09)
│   ├── App.tsx                   # Punto de entrada de navegación por estado
│   ├── features.ts               # Definición de módulos del MVP y metadatos
│   ├── index.css                 # Directivas base de Tailwind CSS
│   └── main.tsx                  # Punto de montaje de React
```

### Reglas de Modularidad
1. **Aislamiento por pantalla:** Todo subcomponente, hook, tipo, constante o utilidad que pertenezca a una única pantalla **debe crearse dentro de su carpeta correspondiente** en `src/screens/<pantalla>/` (por ejemplo, `src/screens/timer/components/` o `src/screens/timer/useTimer.ts`).
2. **No modificar archivos compartidos sin necesidad:** Evitá editar `src/App.tsx`, `src/features.ts` o archivos en `src/components/` cuando estés desarrollando la lógica interna de una pantalla, salvo que la tarea sea explícitamente transversal (como el buscador de pictogramas `HU-10`).
3. **Barrel exports (`index.ts`):** Cada carpeta dentro de `src/screens/<pantalla>/` expone su componente principal mediante su archivo `index.ts`.

---

## 4. Módulos y Trazabilidad Funcional (`specs/`)

Toda implementación debe respetar los criterios de aceptación documentados en `specs/historias de usuario requisitos funcionales.md` y `specs/casos de uso requisitos funcionales.md`:

| Módulo | Carpeta | Historias de Usuario / Casos de Uso | Alcance Principal |
|---|---|---|---|
| **Cronómetro** (`sky`) | `src/screens/timer/` | **HU-01** (Must), **HU-02** (Must), **HU-03** (Should) / CU-01, CU-02 | Duración entre 1 s y 60 min; pictograma de actividad (o genérico de tiempo); indicador visual continuo (anillo o barra que se vacía sin cubrir el pictograma); pausar, reanudar y reiniciar; aviso visual configurable; aviso sonoro con plan B para bloqueo de audio en iOS/Safari ("Tocar para activar sonido"). |
| **Organizador** (`emerald`) | `src/screens/organizer/` | **HU-04** (Must), **HU-05** (Should), **HU-06** (Could) / CU-03 a CU-05 | Alta, edición y baja (con confirmación) de actividades diarias con hora y pictograma; ordenamiento automático por hora; aviso no bloqueante si dos actividades comparten hora; marcar como realizada/pendiente; vista semanal y copia de día. |
| **Secuenciador** (`violet`) | `src/screens/sequencer/` | **HU-07** (Must), **HU-08** (Must), **HU-09** (Could) / CU-06 a CU-08 | Creación de secuencias con pasos y pictogramas reordenables (mínimo 2 pasos para ejecutar); ejecución paso a paso a pantalla completa con botones grandes ("Siguiente" / "Anterior") y pantalla de cierre; conservación del último paso visto al salir; guardado y reutilización. |
| **Buscador de Pictogramas** (Transversal) | `src/components/` (cuando se implemente) | **HU-10** (Must), **HU-11** (Could) / CU-09, CU-10 | Búsqueda offline en biblioteca local de pictogramas ARASAAC por palabra clave o categoría; generación opcional con IA (marcando atribución `"generado con IA"` y fallback sin conexión). |

---

## 5. Pautas de UI, UX y Accesibilidad

- **Idioma:** Toda la interfaz de usuario, textos, etiquetas ARIA, comentarios de código y mensajes de error deben estar en **español rioplatense** (por ejemplo: *"¿Qué querés usar?"*, *"Controlá"*, *"Armá"*, *"Mostralas"*).
- **Accesibilidad y Diseño Cognitivo:**
  - **Áreas táctiles grandes:** Los botones e interacciones principales deben tener al menos `min-h-[48px]` (o más en vistas de ejecución con el niño), bordes redondeados (`rounded-2xl` / `rounded-3xl`) y estados de foco claros (`focus-visible:ring-4`).
  - **Contraste WCAG AA:** Mantener alto contraste en textos (`text-slate-900` / `text-slate-800` sobre fondos claros `bg-slate-50` / `bg-white`) y en los indicadores de progreso.
  - **Comprensión sin lectura numérica:** Los indicadores visuales (como el cronómetro o el progreso de pasos) deben entenderse de un vistazo mediante formas y colores sin depender exclusivamente de leer texto o números.
- **Paleta de Acentos por Módulo (Tailwind):**
  - Cronómetro (`timer`): `sky`
  - Organizador (`organizer`): `emerald`
  - Secuenciador (`sequencer`): `violet`
  - **Importante con Tailwind:** Escribir siempre nombres de clases completos y estáticos (no concatenar strings dinámicos como `` `bg-${accent}-100` ``) para evitar que PurgeCSS/Tailwind elimine las clases en el build.
- **Atribución Legal:** Mantener visible la atribución a **ARASAAC** (Gobierno de Aragón – licencia CC BY-NC-SA) y, si se implementan pictogramas con IA (HU-11), identificarlos explícitamente como generados con IA.

---

## 6. Estilo de Código y Convenciones

El proyecto utiliza Prettier (`.prettierrc`) y TypeScript estricto (`tsconfig.json`):

- **Comillas:** Dobles (`"singleQuote": false`).
- **Punto y coma:** Obligatorio (`"semi": true`).
- **Indentación:** 2 espacios (`"useTabs": false`, `"tabWidth": 2`).
- **Ancho de línea:** Máximo 100 caracteres (`"printWidth": 100`).
- **Comas finales:** Ninguna (`"trailingComma": "none"`).
- **TypeScript:**
  - Usar `import type { ... }` cuando se importen únicamente tipos o interfaces.
  - No dejar variables ni parámetros sin usar (`noUnusedLocals` y `noUnusedParameters` están activos y hacen fallar `npm run build`).

