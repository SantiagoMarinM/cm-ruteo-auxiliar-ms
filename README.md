# Módulo de Ruteo Auxiliar

Este módulo gestiona las operaciones relacionadas con la validación de usuarios, obtención de rutas y sincronización de prioridades para un sistema de logística/ruteo.

## Endpoints Disponibles

| Método | Ruta                      | Descripción                                                |
|--------|---------------------------|------------------------------------------------------------|
| POST   | /usuarios/validacion      | Valida un equipo antes de autorizar su salida a ruta      |
| GET    | /rutas                    | Obtiene las rutas asignadas a un equipo específico         |
| PATCH  | /tarea/prioridades        | Recalcula y sincroniza las prioridades de los envíos       |
| DELETE | /redis                    | Elimina la caché actual de redis                           |

---

## Clases Principales

### `ValidarUsuarioUseCase`

- **Responsabilidad**: Valida la autorización de un equipo antes de salir a ruta.
- **Dependencias**:
  - `IEquipoVehiculoRepository`
  - `IRutaRepository`
  - `IGotTokenApi`
  - `EventsPublisher`
- **Flujo**:
  1. Valida el token JWT del cliente.
  2. Consulta la información del equipo y vehículo.
  3. Verifica si ya tiene una ruta asignada.
  4. Publica un evento en PubSub si todo es válido.

---

### `ObtenerRutasUseCase`

- **Responsabilidad**: Consulta la base de datos para obtener las rutas asignadas a un equipo.
- **Parámetros**: `codigo_equipo`, `terminal_equipo`, `fecha_ruta`
- **Flujo**:
  1. Log de inicio.
  2. Consulta en base de datos mediante `rutaRepository`.
  3. Devuelve las rutas obtenidas.

---

### `TareaUseCase`

- **Responsabilidad**: Recalcula y sincroniza las prioridades de todos los envíos.
- **Flujo**:
  1. Llama a `sincronizacionEnvios` para actualizar datos en base.
  2. Obtiene todos los envíos desde Redis por prioridad.
  3. Recalcula prioridades según `fecha_limite_entrega`.
  4. Guarda nuevamente en Redis separados por prioridad.

---

## Consideraciones

- Se usa `Inversify` para inyección de dependencias.
- La lógica de negocio está desacoplada del transporte HTTP.
- Redis se usa como cache intermedio para los envíos según prioridad.
- Pub/Sub se utiliza para emitir eventos relacionados con la validación de equipos.

---

## Autor y mantenimiento

- Desarrollado como parte de examen de seniority para la empresa Coordinadora Mercantil.
- Se recomienda utilizar yarn como gestor de paquetes y versiones de Node por encima de la 18.
