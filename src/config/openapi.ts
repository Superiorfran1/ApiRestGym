const apiKeySecurity = [{ ApiKeyQuery: [] }];

export const openApiDocument = {
    openapi: "3.0.3",
    info: {
        title: "API REST Gym",
        version: "1.0.0",
        description: "API para consultar y gestionar rutinas de entrenamiento y records."
    },
    servers: [{ url: "/api/v1", description: "API versionada" }],
    tags: [
        { name: "workouts", description: "Gestión de rutinas de entrenamiento." },
        { name: "records", description: "Gestión de marcas y registros." },
        { name: "API key", description: "Acceso a la clave de la API." }
    ],
    components: {
        securitySchemes: {
            ApiKeyQuery: {
                type: "apiKey",
                in: "query",
                name: "apikey",
                description: "API key requerida para las peticiones GET, excepto /api-key."
            }
        },
        schemas: {
            Workout: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    mode: { type: "string" },
                    equipment: { type: "array", items: { type: "string" } },
                    exercises: { type: "array", items: { type: "string" } },
                    createdAt: { type: "string", description: "Milisegundos desde epoch, como cadena." },
                    updatedAt: { type: "string", description: "Milisegundos desde epoch, como cadena." },
                    trainerTips: { type: "array", items: { type: "string" } }
                }
            },
            WorkoutInput: {
                type: "object",
                required: ["name", "mode", "equipment", "exercises", "trainerTips"],
                properties: {
                    name: { type: "string" },
                    mode: { type: "string" },
                    equipment: { type: "array", items: { type: "string" } },
                    exercises: { type: "array", items: { type: "string" } },
                    trainerTips: { type: "array", items: { type: "string" } }
                }
            },
            WorkoutRecord: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    workout: { type: "string" },
                    record: { type: "string" },
                    memberId: { type: "string" },
                    member: { type: "string", example: "/members/member-id" }
                }
            },
            RecordInput: {
                type: "object",
                required: ["workout", "record"],
                properties: {
                    workout: { type: "string" },
                    record: { type: "string" },
                    memberId: { type: "string" }
                }
            },
            Response: {
                type: "object",
                properties: {
                    status: { oneOf: [{ type: "string" }, { type: "integer" }] },
                    data: {}
                }
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    status: { type: "string", example: "fail" },
                    data: { type: "string" }
                }
            }
        },
        responses: {
            BadRequest: {
                description: "Validación fallida (JSON) o JSON mal formado (respuesta de error predeterminada de Express).",
                content: {
                    "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                    "text/html": { schema: { type: "string" } }
                }
            },
            PayloadTooLarge: {
                description: "El cuerpo JSON supera el límite predeterminado de 100 KB.",
                content: { "text/html": { schema: { type: "string" } } }
            },
            UnsupportedMediaType: {
                description: "Charset o codificación del cuerpo no compatible con el parser JSON.",
                content: { "text/html": { schema: { type: "string" } } }
            },
            InternalServerError: {
                description: "Error inesperado, por ejemplo, al leer o escribir data/db.json. La respuesta la genera Express y no tiene un formato JSON propio.",
                content: { "text/html": { schema: { type: "string" } } }
            }
        }
    },
    paths: {
        "/workouts": {
            get: {
                tags: ["workouts"],
                summary: "Listar workouts",
                description: "Filtros opcionales: name parcial (sensible a mayúsculas), mode exacto sin distinguir mayúsculas, equipment exacto y exercise exacto sin distinguir mayúsculas.",
                security: apiKeySecurity,
                parameters: [
                    { in: "query", name: "name", schema: { type: "string" } },
                    { in: "query", name: "mode", schema: { type: "string" } },
                    { in: "query", name: "equipment", schema: { type: "string" } },
                    { in: "query", name: "exercise", schema: { type: "string" } }
                ],
                responses: {
                    "200": { description: "Lista de workouts.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "401": { description: "API key ausente o inválida.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "503": { description: "API key no configurada.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            post: {
                tags: ["workouts"],
                summary: "Crear workout",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/WorkoutInput" } } }
                },
                responses: {
                    "201": { description: "Workout creado.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "413": { $ref: "#/components/responses/PayloadTooLarge" },
                    "415": { $ref: "#/components/responses/UnsupportedMediaType" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/workouts/{id}": {
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
            get: {
                tags: ["workouts"],
                summary: "Obtener workout",
                security: apiKeySecurity,
                responses: {
                    "200": { description: "Workout encontrado o null si no existe.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "401": { description: "API key ausente o inválida.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "503": { description: "API key no configurada.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            patch: {
                tags: ["workouts"],
                summary: "Actualizar workout parcialmente",
                description: "Enviar solo los campos que se desean cambiar. No se aceptan id ni createdAt.",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    mode: { type: "string" },
                                    equipment: { type: "array", items: { type: "string" } },
                                    exercises: { type: "array", items: { type: "string" } },
                                    trainerTips: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Workout actualizado.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "413": { $ref: "#/components/responses/PayloadTooLarge" },
                    "415": { $ref: "#/components/responses/UnsupportedMediaType" },
                    "500": { description: "Error de persistencia o workout inexistente; el servicio puede fallar al actualizarlo.", content: { "text/html": { schema: { type: "string" } } } }
                }
            },
            delete: {
                tags: ["workouts"],
                summary: "Eliminar workout",
                responses: {
                    "200": { description: "Resultado de la operación.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/records": {
            get: {
                tags: ["records"],
                summary: "Listar records",
                description: "Filtros opcionales: workout exacto, record parcial sin distinguir mayúsculas, memberId exacto.",
                security: apiKeySecurity,
                parameters: [
                    { in: "query", name: "workout", schema: { type: "string" } },
                    { in: "query", name: "record", schema: { type: "string" } },
                    { in: "query", name: "memberId", schema: { type: "string" } }
                ],
                responses: {
                    "200": { description: "Lista de records.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "401": { description: "API key ausente o inválida.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "503": { description: "API key no configurada.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            post: {
                tags: ["records"],
                summary: "Crear record",
                description: "Si se omite memberId, se asigna default-member.",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/RecordInput" } } }
                },
                responses: {
                    "201": { description: "Record creado.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "413": { $ref: "#/components/responses/PayloadTooLarge" },
                    "415": { $ref: "#/components/responses/UnsupportedMediaType" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/records/{id}": {
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
            get: {
                tags: ["records"],
                summary: "Obtener record",
                security: apiKeySecurity,
                responses: {
                    "200": { description: "Record encontrado o null si no existe.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "401": { description: "API key ausente o inválida.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "503": { description: "API key no configurada.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            patch: {
                tags: ["records"],
                summary: "Actualizar record parcialmente",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    workout: { type: "string" },
                                    record: { type: "string" },
                                    memberId: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Record actualizado.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "404": { description: "Record no encontrado.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "413": { $ref: "#/components/responses/PayloadTooLarge" },
                    "415": { $ref: "#/components/responses/UnsupportedMediaType" },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            },
            delete: {
                tags: ["records"],
                summary: "Eliminar record",
                responses: {
                    "200": { description: "Resultado de la operación.", content: { "application/json": { schema: { $ref: "#/components/schemas/Response" } } } },
                    "500": { $ref: "#/components/responses/InternalServerError" }
                }
            }
        },
        "/api-key": {
            get: {
                tags: ["API key"],
                summary: "Obtener API key",
                description: "Endpoint público que devuelve la API key configurada. No debe exponerse de esta forma en producción.",
                responses: {
                    "200": {
                        description: "API key configurada.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "ok" },
                                        data: { type: "object", properties: { apikey: { type: "string" } } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
