# Casos de uso: requisitos funcionales

**Proyecto:** Herramientas de comunicación y rutinas para terapia ocupacional
**Sección:** 3a – Requisitos funcionales (método: casos de uso)
**Versión:** borrador 1

## Actores

| Actor | Tipo | Descripción |
|---|---|---|
| Terapeuta ocupacional | Principal | Configura y gestiona las herramientas para el niño. |
| Familiar / cuidador | Principal | Usa las mismas funciones que el terapeuta en el hogar. |
| Niño | Asistido | Sigue la información en pantalla; no opera la aplicación sin apoyo. |
| Sistema | Secundario | Reproduce el sonido, guarda los datos y busca pictogramas en la biblioteca local. |

## Índice

| ID | Caso de uso | Requisito de historia de usuario | Prioridad (MoSCoW) |
|---|---|---|---|
| CU-01 | Configurar cronómetro | HU-01 | Must |
| CU-02 | Ejecutar cronómetro con aviso | HU-02, HU-03 | Must / Should |
| CU-03 | Gestionar agenda diaria | HU-04 | Must |
| CU-04 | Registrar actividad realizada | HU-05 | Should |
| CU-05 | Consultar agenda semanal y copiar día | HU-06 | Could |
| CU-06 | Crear secuencia de pasos | HU-07 | Must |
| CU-07 | Ejecutar secuencia paso a paso | HU-08 | Must |
| CU-08 | Guardar y reutilizar secuencia | HU-09 | Could |
| CU-09 | Buscar pictograma | HU-10 | Must |
| CU-10 | Generar pictograma con IA | HU-11 | Could |

---

## CU-01: Configurar cronómetro

- **Actor principal:** Terapeuta ocupacional (o familiar).
- **Precondiciones:** la aplicación está abierta.
- **Postcondiciones:** el cronómetro queda configurado con duración y pictograma.

**Flujo principal**
1. El actor selecciona "Cronómetro".
2. El actor define la duración en minutos y segundos.
3. El actor selecciona el pictograma de la actividad (CU-09).
4. El sistema muestra la configuración lista para iniciar.

**Flujos alternativos**
- 3a. El actor no elige pictograma: el sistema usa un pictograma genérico de "tiempo".

**Excepciones**
- 2a. La duración es cero o mayor a 60 minutos: el sistema muestra un mensaje y no permite iniciar.

---

## CU-02: Ejecutar cronómetro con aviso

- **Actor principal:** Terapeuta ocupacional (o familiar).
- **Actor secundario:** Sistema (sonido y aviso visual).
- **Precondiciones:** CU-01 completado.
- **Postcondiciones:** el cronómetro llegó a cero o fue reiniciado.

**Flujo principal**
1. El actor presiona "Iniciar".
2. El sistema muestra el pictograma de la actividad junto con un indicador visual del tiempo restante (anillo o barra que se vacía de forma continua mientras corre la cuenta).
3. Cuando faltan pocos minutos (valor configurable), el sistema cambia el color del indicador y muestra un aviso visual con pictograma.
4. Al llegar a cero, el sistema emite un aviso sonoro.

**Flujos alternativos**
- 2a. El actor presiona "Pausar": el sistema detiene la cuenta y el indicador; "Reanudar" continúa desde el mismo punto.
- 2b. El actor presiona "Reiniciar": el sistema vuelve a la duración configurada y el indicador vuelve a estar completo.
- 2c. El actor no eligió pictograma: el indicador se muestra igual, con una figura geométrica simple.

**Excepciones**
- 4a. En iPhone el audio está bloqueado: el sistema muestra "Tocar para activar sonido" antes de iniciar (plan B por el riesgo de Safari).
- 4b. El navegador silencia la pestaña: el aviso visual y el indicador se mantienen.

**Criterios de diseño del indicador**
- Se entiende sin leer números: el niño percibe cuánto tiempo queda solo con mirar la forma.
- Visible en todo momento mientras corre la cuenta, junto al pictograma, sin cubrirlo.
- Contraste suficiente para distinguir el tiempo restante del tiempo ya transcurrido (WCAG AA).

---

## CU-03: Gestionar agenda diaria

- **Actor principal:** Terapeuta ocupacional (o familiar).
- **Precondiciones:** la aplicación está abierta.
- **Postcondiciones:** la agenda del día refleja las altas, ediciones o bajas.

**Flujo principal**
1. El actor selecciona "Organizador" y el día.
2. El actor agrega una actividad con hora y pictograma (CU-09).
3. El sistema ordena las actividades por hora y guarda el cambio.

**Flujos alternativos**
- 2a. El actor edita una actividad existente: cambia hora, nombre o pictograma y confirma.
- 2b. El actor elimina una actividad: el sistema pide confirmación antes de borrarla.

**Excepciones**
- 3a. Dos actividades tienen la misma hora: el sistema avisa, pero permite guardar.

---

## CU-04: Registrar actividad realizada

- **Actor principal:** Terapeuta ocupacional (o familiar).
- **Precondiciones:** existe al menos una actividad en la agenda del día (CU-03).
- **Postcondiciones:** la actividad queda marcada como pendiente o realizada.

**Flujo principal**
1. El actor selecciona una actividad de la agenda.
2. El actor marca la actividad como "Realizada".
3. El sistema actualiza el estado y muestra el avance del día.

**Flujos alternativos**
- 2a. El actor desmarca la actividad: vuelve a "Pendiente".

---

## CU-05: Consultar agenda semanal y copiar día

- **Actor principal:** Familiar (o terapeuta).
- **Precondiciones:** existe una agenda diaria (CU-03).
- **Postcondiciones:** la agenda de un día queda copiada en otro, si se eligió esa opción.

**Flujo principal**
1. El actor selecciona "Vista semanal".
2. El sistema muestra los 7 días con sus actividades.
3. El actor selecciona un día y elige "Copiar a…".
4. El actor elige el día destino y confirma.
5. El sistema copia las actividades según la opción elegida: las agrega a las existentes o reemplaza las del día destino.

**Excepciones**
- 4a. El día destino tiene actividades: el sistema pide elegir entre agregar o reemplazar.

---

## CU-06: Crear secuencia de pasos

- **Actor principal:** Terapeuta ocupacional.
- **Precondiciones:** la aplicación está abierta.
- **Postcondiciones:** la secuencia queda guardada en la sesión (ver CU-08 para guardarla de forma permanente).

**Flujo principal**
1. El actor selecciona "Secuenciador" y "Nueva secuencia".
2. El actor agrega pasos, cada uno con su pictograma (CU-09).
3. El actor ordena los pasos arrastrándolos o con flechas.
4. El sistema muestra la secuencia terminada.

**Flujos alternativos**
- 2a. El actor elimina un paso.
- 3a. El actor cambia el orden de un paso ya ordenado.

**Excepciones**
- 4a. La secuencia tiene menos de 2 pasos: el sistema no permite ejecutarla.

---

## CU-07: Ejecutar secuencia paso a paso

- **Actor principal:** Familiar (con el niño).
- **Actor secundario:** Niño (observa la pantalla).
- **Precondiciones:** existe una secuencia con al menos 2 pasos (CU-06 o CU-08).
- **Postcondiciones:** el actor completó la secuencia o la cerró antes de terminar.

**Flujo principal**
1. El actor selecciona "Ejecutar" sobre una secuencia.
2. El sistema muestra el primer paso a pantalla completa, con pictograma y texto.
3. El actor presiona "Siguiente" para completar el paso.
4. El sistema repite el paso 3 hasta el último paso.
5. El sistema muestra una pantalla de cierre de la secuencia.

**Flujos alternativos**
- 3a. El actor presiona "Anterior": el sistema vuelve al paso previo.
- 3b. El actor sale de la secuencia: el sistema conserva el último paso visto.

---

## CU-08: Guardar y reutilizar secuencia

- **Actor principal:** Terapeuta ocupacional.
- **Precondiciones:** existe una secuencia creada (CU-06).
- **Postcondiciones:** la secuencia queda disponible para uso posterior.

**Flujo principal**
1. El actor selecciona "Guardar" sobre la secuencia.
2. El actor le asigna un nombre.
3. El sistema guarda la secuencia en la lista de secuencias.
4. En otra sesión, el actor abre la lista y selecciona la secuencia para ejecutarla (CU-07) o editarla.

**Excepciones**
- 2a. El nombre ya existe: el sistema pide otro nombre.

---

## CU-09: Buscar pictograma

- **Actor principal:** Terapeuta ocupacional (o familiar).
- **Actor secundario:** Sistema (biblioteca local de pictogramas ARASAAC e IA).
- **Precondiciones:** la aplicación está abierta.
- **Postcondiciones:** el actor selecciona un pictograma para una actividad o paso.

**Flujo principal**
1. El actor abre el buscador de pictogramas desde cualquier funcionalidad.
2. El actor escribe una palabra clave.
3. El sistema muestra los pictogramas que coinciden, desde la biblioteca guardada en el proyecto.
4. El actor selecciona un pictograma.

**Excepciones**
- 3a. No hay coincidencias: el sistema muestra "Sin resultados", permite elegir una categoría y ofrece "Generar con IA" (CU-10).

---

## CU-10: Generar pictograma con IA

- **Actor principal:** Terapeuta ocupacional (o familiar).
- **Actor secundario:** Sistema (servicio de generación de imágenes).
- **Precondiciones:** la aplicación tiene conexión a internet y el actor no encontró un pictograma adecuado en la biblioteca (CU-09).
- **Postcondiciones:** el pictograma generado queda guardado en el proyecto y marcado como generado con IA.

**Flujo principal**
1. El actor selecciona "Generar con IA" desde el buscador de pictogramas.
2. El actor describe la acción o el objeto en texto (por ejemplo, "niño lavándose los dientes, dibujo simple, fondo blanco").
3. El sistema genera una imagen y la muestra en vista previa.
4. El actor acepta el pictograma.
5. El sistema lo guarda en la biblioteca local y lo marca como "generado con IA".

**Flujos alternativos**
- 4a. El actor no lo acepta: el sistema permite regenerarlo con la misma descripción o con una nueva.
- 4b. El actor descarta el pictograma: el sistema vuelve al buscador de pictogramas (CU-09).

**Excepciones**
- 3a. Sin conexión o error del servicio: el sistema muestra un mensaje y ofrece buscar en la biblioteca ARASAAC o usar un pictograma genérico.
- 5a. El actor quiere reutilizar el pictograma en otra sesión: se usa desde la biblioteca local, sin volver a generarlo.

---

## Trazabilidad con historias de usuario

| Historia | Caso de uso |
|---|---|
| HU-01 | CU-01 |
| HU-02 | CU-02 |
| HU-03 | CU-02 (flujo 3) |
| HU-04 | CU-03 |
| HU-05 | CU-04 |
| HU-06 | CU-05 |
| HU-07 | CU-06 |
| HU-08 | CU-07 |
| HU-09 | CU-08 |
| HU-10 | CU-09 |
| HU-11 | CU-10 |

## Referencias

- Sommerville, I. (2016). *Ingeniería de Software* (10.ª ed.). Pearson.
- ARASAAC. Pictogramas de comunicación. Gobierno de Aragón. https://arasaac.org (licencia abierta con atribución, sin uso comercial).
- Pictogramas generados con IA: [completar herramienta, versión y fecha de generación]. Indicar en el informe qué pictogramas son generados.
