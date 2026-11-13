# SAAC — Herramientas de comunicación y rutinas para terapia ocupacional

Aplicación web diseñada para asistir a **terapeutas ocupacionales** y **familiares/cuidadores** en el acompañamiento de niños mediante apoyos visuales aumentativos y alternativos (pictogramas de **ARASAAC**).

El sistema permite anticipar tiempos, estructurar la agenda diaria y guiar secuencias de pasos de forma visual, predecible y comprensible sin necesidad de que el niño sepa leer o interpretar números complejos.

---

## 🎯 Roles de usuario

- **Terapeuta ocupacional / Familiar (Actores principales):** Configuran y operan las herramientas de la aplicación (cronómetro visual, agenda diaria y secuenciador de rutinas).
- **Niño (Actor asistido):** Observa y sigue la información visual en pantalla con el acompañamiento del adulto.

---

## ✨ Módulos principales y alcance funcional

Toda la implementación está trazada con las especificaciones funcionales documentadas en la carpeta [`specs/`](./specs/):

| Módulo | Color de acento | Historias de Usuario | Funcionalidades clave |
| :--- | :---: | :---: | :--- |
| **Cronómetro** (`timer`) | `sky` | **HU-01**, **HU-02**, **HU-03** | Configuración de duración (1 s a 60 min) con pictograma de actividad o genérico de tiempo; indicador visual continuo (anillo y barra de progreso que no tapan el pictograma); controles para pausar, reanudar y reiniciar; alerta visual de tiempo próximo a terminar; aviso sonoro con desbloqueo preventivo para iOS/Safari. |
| **Organizador** (`organizer`) | `emerald` | **HU-04**, **HU-05**, **HU-06** | Gestión de agenda diaria con horarios y pictogramas; ordenamiento cronológico automático y aviso no bloqueante de horarios superpuestos; registro de actividades realizadas/pendientes; vista semanal y copia de actividades entre días. |
| **Secuenciador** (`sequencer`) | `violet` | **HU-07**, **HU-08**, **HU-09** | Creación y edición de rutinas paso a paso con pictogramas reordenables; modo de ejecución a pantalla completa con controles táctiles grandes (*Anterior* / *Siguiente*), cronómetro opcional por paso y pantalla de felicitación al finalizar; biblioteca de secuencias guardadas y plantillas predefinidas. |
| **Buscador de Pictogramas** (Transversal) | — | **HU-10**, **HU-11** | Búsqueda de pictogramas por palabra clave o categoría conectada a la API de **ARASAAC**, con caché local y catálogo *offline* de respaldo para garantizar disponibilidad sin conexión. |

---

## 🛠️ Stack tecnológico

- **Framework UI:** [React 18](https://react.dev/) (`react`, `react-dom`)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/) (modo `strict` activado)
- **Bundler y servidor de desarrollo:** [Vite 6](https://vite.dev/)
- **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Pictogramas:** API REST de [ARASAAC](https://arasaac.org/) + catálogo local de respaldo (`fallbackCatalog`)

---

## 🚀 Instalación y puesta en marcha

### Requisitos previos
- **Node.js** 18+ y **npm** instalados en el sistema.

### Pasos

1. **Instalar las dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

3. **Compilar y verificar tipos para producción:**
   ```bash
   npm run build
   ```

4. **Previsualizar el build de producción localmente:**
   ```bash
   npm run preview
   ```

---

## 📂 Estructura del proyecto

El repositorio está organizado modularmente por pantalla para facilitar el trabajo colaborativo en paralelo y evitar conflictos de *merge*:

```text
saac-demo/
├── specs/                        # Especificaciones funcionales
│   ├── casos de uso requisitos funcionales.md
│   └── historias de usuario requisitos funcionales.md
├── src/
│   ├── components/               # Componentes transversales compartidos (ScreenLayout, buscador de pictogramas, íconos)
│   ├── services/
│   │   └── arasaac/              # Cliente de API ARASAAC, caché, hooks de búsqueda y catálogo offline
│   ├── screens/                  # Módulos independientes por pantalla
│   │   ├── home/                 # Pantalla de inicio y selección de herramientas
│   │   ├── timer/                # Módulo Cronómetro visual (HU-01 a HU-03)
│   │   ├── organizer/            # Módulo Organizador / Agenda diaria y semanal (HU-04 a HU-06)
│   │   └── sequencer/            # Módulo Secuenciador de rutinas paso a paso (HU-07 a HU-09)
│   ├── App.tsx                   # Punto de entrada y navegación por estado
│   ├── features.ts               # Definición de módulos y metadatos de trazabilidad
│   ├── index.css                 # Directivas base de Tailwind CSS
│   └── main.tsx                  # Punto de montaje de React
├── AGENTS.md                     # Guía de arquitectura, estilo y convenciones de desarrollo
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## ♿ Principios de accesibilidad y diseño cognitivo

- **Comprensión sin lectura numérica:** Los indicadores de tiempo y de avance en rutinas comunican el estado mediante formas, colores y progreso visual continuo.
- **Áreas táctiles amplias:** Botones con altura mínima de `48px` (y controles aún mayores en las vistas de ejecución junto al niño), bordes redondeados y foco visible (`focus-visible:ring-4`).
- **Alto contraste (WCAG AA):** Paleta clara y consistente por módulo (`sky`, `emerald`, `violet`) sobre fondos limpios (`slate-50` / `white`) para evitar sobrecarga sensorial.
- **Tolerancia a fallos de red y audio:** Catálogo local de pictogramas en caso de pérdida de conexión a internet y aviso explícito cuando el navegador bloquea la reproducción automática de sonido (iOS/Safari).

---

## 📜 Atribución y licencias

Los símbolos pictográficos utilizados son propiedad del **Gobierno de Aragón** y han sido creados por **Sergio Palao** para **[ARASAAC](http://www.arasaac.org)**, que los distribuye bajo Licencia **Creative Commons BY-NC-SA**.
