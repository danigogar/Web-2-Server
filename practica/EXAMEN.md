# EXAMEN — Daniel Gogar

## Reto
F12 — Tests como contrato vivo: firma de albarán y aislamiento multi-tenant


## Tarea técnica

### Qué problema detecté

El feedback recibido apuntaba a varios puntos débiles que se confirmaron al revisar el código:

1. **Cobertura de tests insuficiente sobre la firma de albaranes.** El endpoint `signDeliveryNote` (`src/controllers/deliverynote.controller.js:65-87`) es el de mayor riesgo de negocio del proyecto — convierte un albarán en un documento inmutable y firmado. No tenía ni un solo test porque depende de Cloudinary (`uploadSignature`, `uploadPDF`) y de pdfkit, integraciones externas que el resto de la suite no toca. Lo mismo ocurría con la regla de no poder borrar un albarán firmado (`deleteDeliveryNote`, líneas 113-114).

2. **Aislamiento multi-tenant no verificado.** Aunque todos los controllers filtran por `companyId`, no existía ningún test que confirmase que un usuario de la compañía B no puede acceder a recursos de la compañía A.

3. **Fuga de clientes archivados** (`src/controllers/client.controller.js:56`). El método `getClientById` consultaba `Client.findOne({ _id: id, company: companyId })` sin incluir `deleted: false`, así que un cliente con `deleted: true` aún se devolvía si se conocía su ID, contradiciendo la semántica de archivado del resto de endpoints.

4. **Doble notificación a Slack** para errores 5xx no operacionales. El feedback me lo señaló y se confirmó en `src/app.js:77-82` y `src/middleware/error-handler.js:14-16`: los dos middlewares llamaban a `logToSlack`, generando dos mensajes en el canal por cada error inesperado.

5. **Antipatrón `new Promise(async (resolve, reject) => {...})`** en `src/services/pdf.service.js:4`. Si la función async lanzase antes de invocar resolve/reject (por ejemplo en el `await fetch(deliveryNote.signatureUrl)`), el error queda silenciado y la promesa cuelga.

6. **Fuga de eventos de presencia entre compañías** en `src/socket/index.js`. Las líneas 36 y 47 emitían `user:online` y `user:offline` con `io.emit(...)` (broadcast global), filtrando nombres y userIds entre todas las compañías conectadas al servidor — rompiendo el aislamiento multi-tenant en el plano de WebSockets.


### Cómo lo arreglé

**Tests añadidos** (dos ficheros nuevos):

- `tests/deliverynote-sign.test.js` — bloque `describe('signDeliveryNote — flujo de firma')` con tres casos: firma exitosa con `signed: true` persistido en BD (200), doble firma rechazada (400) y borrado de albarán firmado rechazado (403). Mockeo `uploadSignature`, `uploadPDF` y `generateDeliveryNotePDF` con `jest.unstable_mockModule` (la API ESM-compatible de Jest, ya que `jest.mock` clásico no funciona con `--experimental-vm-modules`). Verifico también que `uploadSignature` se llama exactamente una vez en el escenario de doble firma — confirmando que la segunda llamada se corta antes del upload.

- `tests/multitenant.test.js` — cuatro casos: GET, PUT y DELETE de un cliente desde otra compañía devuelven 404 (no 403, decisión justificada en la primera respuesta socrática), y verificación de que un cliente archivado vía `?soft=true` deja de aparecer en `GET /api/client/:id` pero sí sigue en `GET /api/client/archived`.

**Correcciones de código** (5 commits separados aproximadamente, puede que se me hay pasado alguno para alguna correción intermedia):

- `src/controllers/client.controller.js` — añadido `deleted: false` al filtro de `getClientById`.
- `src/app.js` — eliminado el middleware intermedio que duplicaba `logToSlack`. Eliminada también la importación de `logToSlack` en este fichero. Toda la lógica de logging vive ahora en `errorHandler`.
- `src/services/pdf.service.js` — refactor completo. Aislé la descarga de la firma en una función `async` (`fetchSignatureBuffer`) que se ejecuta antes de crear el `PDFDocument`, y la espera de los chunks del documento en una promesa síncrona (`collectPDFBuffer`) cuyo ejecutor solo engancha listeners (sin `async`). El antipatrón desaparece y los errores se propagan correctamente.
- `src/socket/index.js` — `io.emit('user:online'/'user:offline')` cambiado a `io.to(companyRoom).emit(...)`. Calculo el `companyRoom` una sola vez al conectar y lo reutilizo en el handler de `disconnect`.

### Por qué mi solución es correcta

Cubre las dos dimensiones que pedía el reto: **regla de negocio** (firma idempotente, no-edit/no-delete sobre firmados) y **aislamiento multi-tenant** (clientes y eventos de presencia). Los tests son de integración real contra el `app` Express con Supertest, así que verifican el contrato HTTP completo (status, body, persistencia en BD) y no solo el comportamiento del controller aislado.

Las decisiones de mock (storage + pdf, no Mongo) son las correctas: Mongo se levanta en memoria con `mongodb-memory-server` desde `tests/setup.js`, así que probar la persistencia es barato y rápido; en cambio Cloudinary y pdfkit son dependencias externas/binarias que conviene aislar. El uso de `jest.unstable_mockModule` antes del `await import('../src/app.js')` es la forma estándar y soportada para mockear módulos ESM en Jest cuando se ejecuta con `--experimental-vm-modules`.

La cobertura final es **115 tests pasando, 0 fallos**, con coverage por encima del 70 % en las cuatro métricas de la rúbrica.


## Respuestas socráticas

### 1. ¿Por qué 403 al borrar un albarán firmado es más correcto que 400 o 409?

El 403 (Forbidden) comunica al cliente HTTP que la petición está bien formada y entendida, pero la operación está prohibida por **una política sobre el estado del recurso** — el albarán está firmado y por diseño es inmutable. Un 400 (Bad Request) implicaría que la petición tiene un problema de forma (body malformado, parámetro inválido), lo cual es falso aquí: la sintaxis de `DELETE /api/deliverynote/:id` es perfectamente válida. Un 409 (Conflict) sería incluso más preciso si la imposibilidad viniera de **un conflicto con el estado actual que el cliente podría resolver** (por ejemplo, "primero desfirma y luego borra"); pero como en BildyApp un albarán firmado es **definitivamente inmutable**, no hay conflicto resoluble — es una prohibición permanente, lo que encaja mejor con 403.

### 2. ¿Debería `getClientById` devolver clientes archivados? Consecuencias para la regla de negocio.

No, no debería. El archivado (soft delete, `deleted: true`) es una forma de "ocultar" un recurso preservando su histórico para integridad referencial: los proyectos y albaranes que lo referencian siguen apuntando válidamente a su `_id`. Pero la API tiene dos vías separadas para acceder a archivados — `GET /api/client/archived` y la opción `?archived=true` del listado — así que `GET /api/client/:id` debe seguir el mismo criterio que `GET /api/client/` por defecto: omitir lo archivado. Si no lo filtramos, generamos una **inconsistencia semántica**: el cliente "no existe" en el listado pero "sí existe" si conoces su ID, exponiendo además datos que el usuario decidió archivar. La consecuencia real es que un proyecto puede legítimamente apuntar a un cliente archivado (el ObjectId sigue siendo válido), pero la UI debería resolver ese caso mostrando "Cliente archivado" o forzando la consulta al endpoint específico de archivados — no obteniendo el documento por la puerta de atrás.

### 3. ¿En qué condición exacta se producía la doble notificación a Slack y cómo lo corregí?

La condición era: cualquier error con `statusCode >= 500` y `isOperational === false` (o sin `isOperational` definido). El antiguo middleware en `app.js:77-82` filtraba con `err.statusCode >= 500 && !err.isOperational` y llamaba a `logToSlack(err, req)` antes de `next(err)`. Acto seguido, `errorHandler` en `error-handler.js:14-16` aplicaba un filtro casi idéntico (`err.statusCode >= 500 || (!err.statusCode && !err.isOperational)`) y volvía a llamar a `logToSlack`. Cualquier error 500 inesperado (un `TypeError` en un controller, un fallo de Mongoose no contemplado) cumplía las dos condiciones y producía dos mensajes en Slack. Lo corregí eliminando el middleware intermedio de `app.js` y la importación de `logToSlack` en ese fichero, dejando `errorHandler` como **único punto de logging**. El criterio que apliqué fue el principio de responsabilidad única: el `errorHandler` ya tenía toda la información para decidir si loggear o no, así que el middleware intermedio era redundante y duplicaba el conocimiento de la regla.

### 4. ¿Cómo refactorizé `pdf.service.js` sin envolver en `new Promise(async...)`?

El antipatrón consiste en pasar una función `async` como ejecutor de `new Promise`: si esa función `await`-ea algo y lanza antes de llamar a `resolve` o `reject`, el rejection se traga porque el ejecutor de Promise ignora cualquier valor retornado (y una `async` retorna implícitamente). Mi refactor lo descompone en tres piezas. Primero, una función `fetchSignatureBuffer(url)` puramente `async` que descarga la firma desde Cloudinary y devuelve un `Buffer` o `null` — esto se ejecuta **antes** de crear el `PDFDocument`. Segundo, una función `collectPDFBuffer(doc)` que devuelve una Promise envolvente cuyo ejecutor es **síncrono**: solo engancha los listeners `data`/`end`/`error` del documento (que sí son una API basada en eventos legítima de envolver). Tercero, la función principal `generateDeliveryNotePDF` queda como un flujo `async/await` lineal: `await fetchSignatureBuffer(...)`, crear el `doc`, escribir contenido síncronamente, llamar a `doc.end()` y devolver la promesa de `collectPDFBuffer`. El contrato externo se mantiene — devuelve un `Buffer` con el PDF — pero ahora cualquier error en la descarga, la creación o la escritura se propaga limpiamente.

### 5. ¿Cómo rompía `io.emit('user:online')` el aislamiento multi-tenant y cuál fue el cambio mínimo?

`io.emit(evento, datos)` envía el evento a **todos los sockets conectados al servidor**, sin filtrar por sala. Como cada socket de BildyApp está autenticado y se une a una sala `company:<id>` para recibir notificaciones específicas, el resto de eventos también deberían respetar esa segmentación. Al usar `io.emit` para `user:online` y `user:offline`, un usuario de la compañía A recibía los `userId` y `name` de cualquier usuario que se conectase desde **otra compañía**, filtrando información que en un entorno multi-empresa real (varias empresas usando la misma API) sería un leak grave: nombres reales, patrones de actividad, número aproximado de empleados de la competencia. El cambio mínimo fue calcular el `companyRoom` al inicio del handler de `connection`, hacer `socket.join(companyRoom)` y reemplazar las dos llamadas `io.emit(...)` por `io.to(companyRoom).emit(...)`. La sala se reutiliza por closure en el listener de `disconnect`. Resultado: los eventos de presencia ahora se restringen a la propia compañía, igual que ya hacían los eventos de negocio (`client:new`, `project:new`, `deliverynote:new`).


## Proceso

**Tiempo total invertido:** ~1 hora, tieempo dejado en clase:
- Análisis del feedback y verificación de los bugs en el repo: 10 minutoss
- Correcciones de código (4 commits): 30 minutos
- Tests nuevos (signDeliveryNote y multi-tenant): 10 minutos
- Redacción del EXAMEN.md y revisión final: 10 minutos

**Herramientas usadas:**
- VS Code como IDE principal
- GitHub Desktop para los commits y push
- PowerShell para `npm test` y `npm test -- --coverage`
- Claude (Anthropic, modelo Opus 4.7) como apoyo para verificar conceptos y refactor
- Documentación oficial de Jest (`jest.unstable_mockModule` y mocking ESM)
- Documentación de pdfkit y Cloudinary para entender los contratos a mockear

**Prompts a IA (literales):**
- "Te paso también el formato de entrega [...] Cómo entregar: 1. Desde tu rama actual: git checkout -b examen [...]" — para enmarcar el flujo de trabajo y commits.
- "vamos con la defensa/mejora del proyecto que envié. Resulta que la defensa consiste en realizar estos pasos" + texto del feedback del profesor — para que la IA verificase los bugs en el código real antes de proponer correcciones.
- "A) Completo, B) Corregir el controller. 1. Tienes la versión más reciente, 2. Sobre el proyecto Mongoose Actual, 3. Completo" — para fijar el alcance de las correcciones (todos los bugs, no solo los imprescindibles).
- "después de modificar los 5 primeros ficheros y hacer test" + log de salida de Jest con `ReferenceError: jest is not defined` — para diagnosticar el fallo del global `jest` en modo ESM y resolverlo añadiendo `import { jest } from '@jest/globals'` al `middleware.test.js`.

La IA se utilizó para verificar conceptos (mocking ESM con `jest.unstable_mockModule`, antipatrones de `new Promise(async)`, semántica HTTP de 403 vs 409) y para revisar las correcciones contra el código real verificando líneas concretas del repo. Las decisiones técnicas (qué mockear, dónde poner los tests, qué status code usar en cada caso) las he tomado entendiendo el porqué y validándolas con la suite de tests, no copiando ciegamente.

También he utilizado la IA para ayudarme a redactar el EXAMEN.md, aunque añadiendo bastantes cosas de forma manual.
