# API REST Gym

Backend REST para gestionar rutinas de entrenamiento (*workouts*) y marcas o registros (*records*). Está implementado con Node.js, TypeScript y Express; los datos se guardan en un fichero JSON local.

## Requisitos y puesta en marcha

- Node.js y npm.
- Dependencias instaladas con `npm install`.

Comandos disponibles:

```bash
npm run dev
npm start
```

Ambos comandos arrancan `index.ts` con `tsx`; `dev` observa los cambios y reinicia el proceso. El servidor escucha en el puerto definido por `PORT`, o en el puerto `3002` si no se proporciona.

## Documentación interactiva

Con el servidor en marcha, abre `http://localhost:3002/api/docs` para usar Swagger UI. La especificación OpenAPI en JSON está disponible en `http://localhost:3002/api/docs.json`. Estas dos rutas no requieren API key.

## Organización

| Ruta | Responsabilidad |
| --- | --- |
| `index.ts` | Configura Express, middleware y rutas principales. |
| `src/config/openapi.ts` | Define la especificación OpenAPI que sirve Swagger UI. |
| `src/v1/routes/` | Define las rutas de workouts, records y API key. |
| `src/controller/` | Valida entradas HTTP y construye respuestas. |
| `src/services/` | Contiene las operaciones y reglas de negocio. |
| `src/database/ficheros.ts` | Lee y escribe `data/db.json`. |
| `src/types/workout.ts` | Define los tipos de datos del dominio. |
| `src/middleware/apiKeyAuth.ts` | Protege las peticiones GET con API key. |
| `src/config/env.ts` | Configuración del puerto y de la API key. |

El middleware global habilita CORS y analiza cuerpos JSON. La persistencia es local: cada operación lee o escribe el fichero `data/db.json`; no se utiliza una base de datos externa.

## Autenticación

Las peticiones **GET** requieren el parámetro de consulta `apikey`, excepto `GET /api/v1/api-key`. Las operaciones de escritura (POST, PATCH y DELETE) no pasan por esta comprobación.

```text
GET /api/v1/workouts?apikey=<API_KEY>
```

`GET /api/v1/api-key` entrega la API key en la respuesta y no requiere autenticación. La clave está configurada en el código del backend, no mediante una variable de entorno. Este comportamiento facilita obtenerla para desarrollo, pero no es adecuado para producción: se recomienda proteger o retirar ese endpoint y cargar la clave desde una configuración segura.

Si no hay una clave configurada, las peticiones GET protegidas responden `503`. Si falta o no coincide, responden `401`. La validación compara las claves con una función de tiempo constante.

## Endpoints

La URL base de la API versionada es `/api/v1`.

### Workouts

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/workouts` | Lista workouts; admite filtros opcionales. |
| GET | `/workouts/:id` | Busca un workout por ID. |
| POST | `/workouts` | Crea un workout. |
| PATCH | `/workouts/:id` | Actualiza parcialmente un workout. |
| DELETE | `/workouts/:id` | Elimina los workouts con ese ID. |

Filtros de `GET /workouts`:

| Parámetro | Comportamiento |
| --- | --- |
| `name` | Coincidencia parcial, sensible a mayúsculas. |
| `mode` | Coincidencia exacta sin distinguir mayúsculas. |
| `equipment` | Coincidencia exacta con un elemento de `equipment`. |
| `exercise` | Coincidencia exacta sin distinguir mayúsculas con un ejercicio. |

El cuerpo de creación requiere `name`, `mode`, `equipment`, `exercises` y `trainerTips`. El servidor genera `id`, `createdAt` y `updatedAt`.

En PATCH se pueden enviar los campos que se quieran cambiar. El ID proviene de la ruta; no se debe incluir `id` ni `createdAt`. El servidor conserva los valores omitidos y actualiza `updatedAt`.

Ejemplo de creación:

```json
{
  "name": "Fuerza básica",
  "mode": "strength",
  "equipment": ["barbell"],
  "exercises": ["squat"],
  "trainerTips": ["Mantén la espalda neutra"]
}
```

### Records

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/records` | Lista records; admite filtros opcionales. |
| GET | `/records/:id` | Busca un record por ID. |
| POST | `/records` | Crea un record. |
| PATCH | `/records/:id` | Actualiza parcialmente un record. |
| DELETE | `/records/:id` | Elimina los records con ese ID. |

Filtros de `GET /records`:

| Parámetro | Comportamiento |
| --- | --- |
| `workout` | Coincidencia exacta. |
| `record` | Coincidencia parcial sin distinguir mayúsculas. |
| `memberId` | Coincidencia exacta. |

El cuerpo de POST requiere `workout` y `record` como cadenas; `memberId` es opcional. Si se omite, el servicio asigna el identificador `default-member`. El registro también incluye el campo `member` con la referencia `/members/{memberId}`.

PATCH acepta cualquiera de `workout`, `record` y `memberId`. Si se modifica el miembro, se actualiza también la referencia `member`.

Ejemplo:

```json
{
  "workout": "id-del-workout",
  "record": "5 reps",
  "memberId": "id-del-miembro"
}
```

### API key

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api-key` | Devuelve la API key configurada; no requiere autenticación. |

La ruta completa es `/api/v1/api-key`.

## Modelos

### Workout

```text
{
  id: string,
  name: string,
  mode: string,
  equipment: string[],
  exercises: string[],
  createdAt: string,
  updatedAt: string,
  trainerTips: string[]
}
```

Las marcas de tiempo generadas por el servicio son cadenas con el valor numérico de `Date.now()` (milisegundos desde epoch).

### WorkoutRecord

```text
{
  id: string,
  workout: string,
  record: string,
  memberId?: string,
  member?: string
}
```

El fichero `data/db.json` contiene las colecciones `workouts`, `members` y `records`.

## Respuestas y errores

La mayoría de respuestas correctas usan un objeto con `status` y `data`. Los errores que generan los controladores suelen devolver JSON con `status: "fail"` y un mensaje en `data`. Los errores del parser y los errores internos usan la respuesta predeterminada de Express, que no está normalizada como JSON.

Errores documentados en Swagger:

| Código | Causa |
| --- | --- |
| `400` | Validación fallida o cuerpo JSON mal formado. La validación de los controladores devuelve JSON; el error de parseo puede devolver HTML. |
| `401` | Falta la API key o no es válida en un GET protegido. |
| `404` | Se intenta actualizar un record que no existe. |
| `413` | El cuerpo JSON supera el límite predeterminado del parser (100 KB). |
| `415` | Charset o codificación no compatible al analizar el cuerpo JSON. |
| `500` | Error inesperado, por ejemplo, al leer o escribir `data/db.json`; también puede ocurrir al intentar actualizar un workout inexistente. |
| `503` | La API key no está configurada para proteger las peticiones GET. |

Las operaciones POST devuelven `201`; la creación y actualización de workouts responde con `data: true` si la persistencia termina correctamente. GET devuelve el recurso o una lista. La búsqueda de un workout o record inexistente devuelve `data: null`; eliminar un ID que no existe no produce un error de “no encontrado”. La creación y actualización de records también devuelve el resultado booleano de la persistencia.

El endpoint `GET /records/:id` devuelve `status: 200` dentro del cuerpo JSON, mientras que los demás GET individuales usan una estructura similar. Los errores de almacenamiento se convierten en `HttpError` con estado `500`; actualmente no hay un middleware global que normalice estos errores en una respuesta JSON propia.
