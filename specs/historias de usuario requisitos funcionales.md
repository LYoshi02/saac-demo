# Historias de usuario: requisitos funcionales

**Proyecto:** Herramientas de comunicación y rutinas para terapia ocupacional
**Sección:** 3a – Requisitos funcionales (método: historias de usuario)
**Versión:** borrador 1
**Fuente:** casos de uso CU-01 a CU-09 (archivo `casos-de-uso-requisitos-funcionales.md`)

## Roles

- **Terapeuta ocupacional:** configura y gestiona las herramientas para el niño.
- **Familiar / cuidador:** usa las mismas funciones que el terapeuta en el hogar.
- **Niño:** sigue la información en pantalla con apoyo; no opera la aplicación solo.

## Índice

| ID | Historia | Prioridad (MoSCoW) | Caso de uso de origen |
|---|---|---|---|
| HU-01 | Configurar cronómetro | Must | CU-01 |
| HU-02 | Ejecutar cronómetro con indicador de tiempo y aviso sonoro | Must | CU-02 |
| HU-03 | Recibir aviso visual de fin de tiempo | Should | CU-02 |
| HU-04 | Gestionar agenda diaria | Must | CU-03 |
| HU-05 | Registrar actividad realizada | Should | CU-04 |
| HU-06 | Consultar agenda semanal y copiar día | Could | CU-05 |
| HU-07 | Crear secuencia de pasos | Must | CU-06 |
| HU-08 | Ejecutar secuencia paso a paso | Must | CU-07 |
| HU-09 | Guardar y reutilizar secuencia | Could | CU-08 |
| HU-10 | Buscar pictograma | Must | CU-09 |
| HU-11 | Generar pictograma con IA | Could | CU-10 |

---

## Cronómetro

### HU-01: Configurar cronómetro (Must)

Como **terapeuta ocupacional**, quiero configurar un cronómetro con duración y pictograma de la actividad, para controlar el tiempo de la tarea con el niño.

**Criterios de aceptación**
- [ ] Puedo definir la duración en minutos y segundos.
- [ ] La duración máxima es de 60 minutos; con cero o más de 60 el sistema muestra un mensaje y no permite iniciar.
- [ ] Puedo elegir un pictograma de la biblioteca (HU-10); si no elijo ninguno, se usa un pictograma genérico de "tiempo".

### HU-02: Ejecutar cronómetro con indicador de tiempo y aviso sonoro (Must)

Como **terapeuta ocupacional**, quiero ver el pictograma junto a un indicador visual del tiempo restante y escuchar un aviso al terminar, para que el niño perciba cuánto falta sin depender de leer números.

**Criterios de aceptación**
- [ ] Al iniciar, veo el pictograma junto a un anillo o barra que se vacía de forma continua.
- [ ] El indicador se mantiene visible durante toda la cuenta, sin tapar el pictograma.
- [ ] Puedo pausar y reanudar; el indicador se detiene y continúa desde el mismo punto.
- [ ] Puedo reiniciar; el indicador vuelve a estar completo.
- [ ] Al llegar a cero, el sistema emite un aviso sonoro.
- [ ] Si no hay pictograma elegido, el indicador se muestra igual con una figura geométrica simple.
- [ ] En iPhone, si el audio está bloqueado, veo "Tocar para activar sonido" antes de iniciar (plan B por el riesgo de Safari).
- [ ] Si el navegador silencia la pestaña, el indicador y el aviso visual siguen funcionando.
- [ ] El indicador tiene contraste suficiente para distinguir el tiempo restante del transcurrido (WCAG AA).

### HU-03: Recibir aviso visual de fin de tiempo (Should)

Como **familiar**, quiero ver un aviso visual con pictograma cuando faltan pocos minutos, para anticipar el final de la actividad.

**Criterios de aceptación**
- [ ] El tiempo de aviso es configurable.
- [ ] Al llegar a ese punto, el indicador cambia de color y aparece el aviso con pictograma.
- [ ] El aviso visual no depende del sonido.

---

## Organizador

### HU-04: Gestionar agenda diaria (Must)

Como **terapeuta ocupacional**, quiero armar la agenda diaria con actividades, horario y pictograma, para mostrársela al niño.

**Criterios de aceptación**
- [ ] Puedo agregar una actividad con hora y pictograma (HU-10).
- [ ] Puedo editar hora, nombre o pictograma de una actividad.
- [ ] Puedo eliminar una actividad; el sistema pide confirmación antes de borrarla.
- [ ] Las actividades se ordenan por hora automáticamente.
- [ ] Si dos actividades tienen la misma hora, el sistema avisa, pero permite guardar.

### HU-05: Registrar actividad realizada (Should)

Como **terapeuta ocupacional**, quiero marcar cada actividad como pendiente o realizada, para registrar el avance del día.

**Criterios de aceptación**
- [ ] Puedo marcar una actividad como "Realizada" y desmarcarla para volver a "Pendiente".
- [ ] El sistema muestra cuántas actividades del día están realizadas.

### HU-06: Consultar agenda semanal y copiar día (Could)

Como **familiar**, quiero ver la agenda de la semana y copiar un día a otro, para planificar sin rearmar cada agenda.

**Criterios de aceptación**
- [ ] Veo los 7 días con sus actividades.
- [ ] Puedo copiar las actividades de un día a otro.
- [ ] Si el día destino ya tiene actividades, puedo elegir entre agregar o reemplazar.

---

## Secuenciador

### HU-07: Crear secuencia de pasos (Must)

Como **terapeuta ocupacional**, quiero armar la secuencia de pasos de una rutina (por ejemplo, lavarse los dientes) con pictogramas ordenables, para que el niño la siga sin que un adulto la arme cada vez.

**Criterios de aceptación**
- [ ] Puedo agregar pasos, cada uno con su pictograma (HU-10).
- [ ] Puedo reordenar los pasos arrastrándolos o con flechas.
- [ ] Puedo eliminar un paso.
- [ ] Una secuencia con menos de 2 pasos no se puede ejecutar; el sistema lo indica.

### HU-08: Ejecutar secuencia paso a paso (Must)

Como **familiar**, quiero mostrar un paso por vez a pantalla completa y avanzar con un botón grande, para que el niño gane autonomía en la rutina.

**Criterios de aceptación**
- [ ] Veo el paso actual a pantalla completa, con pictograma y texto.
- [ ] El botón "Siguiente" es grande y permite avanzar al siguiente paso.
- [ ] Puedo volver al paso anterior con "Anterior".
- [ ] Al terminar el último paso, veo una pantalla de cierre.
- [ ] Si salgo antes de terminar, la aplicación conserva el último paso visto.

### HU-09: Guardar y reutilizar secuencia (Could)

Como **terapeuta ocupacional**, quiero guardar una secuencia con nombre y reutilizarla en otra sesión, para no rearmarla cada vez.

**Criterios de aceptación**
- [ ] Puedo guardar la secuencia con un nombre.
- [ ] Si el nombre ya existe, el sistema pide otro.
- [ ] En otra sesión, la secuencia aparece en mi lista para ejecutarla o editarla.

---

## Transversal

### HU-10: Buscar pictograma (Must)

Como **terapeuta ocupacional**, quiero buscar pictogramas en una biblioteca guardada en el proyecto, para usarlos en el cronómetro, la agenda y las secuencias.

**Criterios de aceptación**
- [ ] Puedo buscar por palabra clave desde cualquier funcionalidad.
- [ ] Los resultados salen de la biblioteca local (ARASAAC), sin depender de internet.
- [ ] Si no hay coincidencias, veo "Sin resultados" y puedo elegir una categoría.

### HU-11: Generar pictograma con IA (Could)

Como **terapeuta ocupacional**, quiero generar un pictograma con IA a partir de una descripción cuando no encuentro uno adecuado en la biblioteca, para representar actividades que ARASAAC no cubre.

**Criterios de aceptación**
- [ ] Puedo describir la acción u objeto en texto y solicitar la generación.
- [ ] Veo una vista previa del pictograma y puedo aceptarlo, regenerarlo o descartarlo antes de usarlo.
- [ ] Al aceptarlo, queda guardado en la biblioteca local del proyecto y puedo usarlo sin internet.
- [ ] El pictograma queda marcado como "generado con IA", para la atribución y el informe.
- [ ] Si la generación falla o no hay conexión, el sistema lo indica y ofrece buscar en ARASAAC o usar un pictograma genérico.

---

## Trazabilidad

| Historia | Caso de uso |
|---|---|
| HU-01 | CU-01 |
| HU-02 | CU-02 |
| HU-03 | CU-02 (flujo de aviso) |
| HU-04 | CU-03 |
| HU-05 | CU-04 |
| HU-06 | CU-05 |
| HU-07 | CU-06 |
| HU-08 | CU-07 |
| HU-09 | CU-08 |
| HU-10 | CU-09 |
| HU-11 | CU-10 |

## Referencias

- Cohn, M. (2004). *User Stories Applied*. Addison-Wesley.
- Sommerville, I. (2011). *Ingeniería de Software* (9.ª ed.). Pearson.
- Wiegers, K. y Beatty, J. (2013). *Software Requirements* (3.ª ed.). Microsoft Press.
