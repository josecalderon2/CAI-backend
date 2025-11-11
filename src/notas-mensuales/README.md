# 📝 Módulo de Notas Mensuales - API Documentation

## Descripción

Módulo simplificado para la gestión de notas mensuales de alumnos. Este módulo proporciona endpoints REST para crear, actualizar y consultar notas mensuales con cálculo automático del promedio.

## Características

✅ Creación de notas mensuales con validación
✅ Actualización parcial de notas existentes
✅ Cálculo automático del promedio
✅ Consultas con filtros múltiples
✅ Validación de datos de entrada
✅ Documentación Swagger completa

---

## 🔗 Endpoints Disponibles

### 1. Crear Nota Mensual

**POST** `/notas-mensuales`

Crea una nueva nota mensual para un alumno en una asignatura específica.

#### Request Body

```json
{
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 8.5,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.5,
  "laboratorio_escrito": 8.0,
  "examen_mensual": 9.0
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción | Rango |
|-------|------|-----------|-------------|-------|
| `id_alumno` | `number` | ✅ Sí | ID del alumno | - |
| `id_asignatura` | `number` | ✅ Sí | ID de la asignatura | - |
| `mes` | `number` | ✅ Sí | Mes del año | 1-12 |
| `anio` | `number` | ✅ Sí | Año académico | 2020-2100 |
| `tarea_1` | `number` | ❌ No | Nota de Tarea 1 | 0-10 |
| `revision_libros_cuadernos` | `number` | ❌ No | Revisión de libros/cuadernos | 0-10 |
| `tarea_2` | `number` | ❌ No | Nota de Tarea 2 | 0-10 |
| `laboratorio_escrito` | `number` | ❌ No | Nota de Laboratorio escrito | 0-10 |
| `examen_mensual` | `number` | ❌ No | Nota del examen mensual | 0-10 |

#### Response (201 Created)

```json
{
  "id": 1,
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 8.5,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.5,
  "laboratorio_escrito": 8.0,
  "examen_mensual": 9.0,
  "promedio": 8.4,
  "fecha_creacion": "2025-03-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-03-15T10:30:00.000Z"
}
```

#### Códigos de Error

- `400 Bad Request` - Datos de entrada inválidos
- `404 Not Found` - Alumno o asignatura no encontrados
- `409 Conflict` - Ya existe una nota para este alumno, asignatura, mes y año

---

### 2. Actualizar Nota Mensual

**PATCH** `/notas-mensuales/:id`

Actualiza una nota mensual existente. El promedio se recalcula automáticamente.

#### Request Body (todos los campos opcionales)

```json
{
  "tarea_1": 9.0,
  "revision_libros_cuadernos": 9.5,
  "tarea_2": 8.5,
  "laboratorio_escrito": 9.0,
  "examen_mensual": 9.5
}
```

#### Response (200 OK)

```json
{
  "id": 1,
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 9.0,
  "revision_libros_cuadernos": 9.5,
  "tarea_2": 8.5,
  "laboratorio_escrito": 9.0,
  "examen_mensual": 9.5,
  "promedio": 9.1,
  "fecha_creacion": "2025-03-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-03-16T14:20:00.000Z"
}
```

#### Códigos de Error

- `400 Bad Request` - Datos de entrada inválidos
- `404 Not Found` - Nota mensual no encontrada

---

### 3. Consultar Notas Mensuales

**GET** `/notas-mensuales`

Obtiene notas mensuales con filtros opcionales.

#### Query Parameters (todos opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `id_alumno` | `number` | Filtrar por alumno | `?id_alumno=1` |
| `id_asignatura` | `number` | Filtrar por asignatura | `?id_asignatura=1` |
| `mes` | `number` | Filtrar por mes (1-12) | `?mes=3` |
| `anio` | `number` | Filtrar por año | `?anio=2025` |

#### Ejemplos de Uso

```bash
# Obtener todas las notas
GET /notas-mensuales

# Notas de un alumno específico
GET /notas-mensuales?id_alumno=1

# Notas de una asignatura específica
GET /notas-mensuales?id_asignatura=1

# Notas de un alumno en una asignatura
GET /notas-mensuales?id_alumno=1&id_asignatura=1

# Notas de un mes y año específico
GET /notas-mensuales?mes=3&anio=2025

# Notas de un alumno en un mes específico
GET /notas-mensuales?id_alumno=1&mes=3&anio=2025
```

#### Response (200 OK)

```json
[
  {
    "id": 1,
    "id_alumno": 1,
    "id_asignatura": 1,
    "mes": 3,
    "anio": 2025,
    "tarea_1": 8.5,
    "revision_libros_cuadernos": 9.0,
    "tarea_2": 7.5,
    "laboratorio_escrito": 8.0,
    "examen_mensual": 9.0,
    "promedio": 8.4,
    "fecha_creacion": "2025-03-15T10:30:00.000Z",
    "fecha_actualizacion": "2025-03-15T10:30:00.000Z"
  }
]
```

---

### 4. Obtener Nota Mensual por ID

**GET** `/notas-mensuales/:id`

Obtiene una nota mensual específica por su ID.

#### Response (200 OK)

```json
{
  "id": 1,
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 8.5,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.5,
  "laboratorio_escrito": 8.0,
  "examen_mensual": 9.0,
  "promedio": 8.4,
  "fecha_creacion": "2025-03-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-03-15T10:30:00.000Z"
}
```

#### Códigos de Error

- `404 Not Found` - Nota mensual no encontrada

---

## 📊 Cálculo del Promedio

El backend calcula el promedio automáticamente siguiendo el **sistema de evaluación oficial**:

### Fórmula de Cálculo:

1. **Promedio Puro de Actividades**: Suma de todas las actividades / Cantidad de actividades
2. **Promedio Actividades 70%**: Promedio Puro × 0.70
3. **Promedio Examen 30%**: Nota del Examen × 0.30
4. **Nota Mensual**: Promedio Actividades 70% + Promedio Examen 30%

### Ejemplo Completo de Cálculo

Si se ingresan las siguientes notas:
- `tarea_1`: 8.0
- `revision_libros_cuadernos`: 9.0
- `tarea_2`: 7.0
- `laboratorio_escrito`: 8.0
- `examen_mensual`: 9.0

**Cálculos paso a paso:**
1. **Promedio Puro Actividades** = (8.0 + 9.0 + 7.0 + 8.0) / 4 = **8.000**
2. **Promedio Actividades 70%** = 8.000 × 0.70 = **5.600**
3. **Promedio Examen 30%** = 9.0 × 0.30 = **2.700**
4. **Nota Mensual** = 5.600 + 2.700 = **8.300**

**Nota:** Todos los cálculos se redondean a **3 decimales**.

---

## 🎯 Sistema de Trimestres

El sistema determina automáticamente el trimestre basado en el mes:

| Trimestre | Meses | Meses Numéricos |
|-----------|-------|-----------------|
| 1 | Febrero, Marzo, Abril | 2, 3, 4 |
| 2 | Mayo, Junio, Julio | 5, 6, 7 |
| 3 | Agosto, Septiembre, Octubre | 8, 9, 10 |

**Nota:** Los meses fuera de este rango (1, 11, 12) generarán un error de validación.

---

## 🔒 Validaciones

### Validaciones de Campos

- **ID Alumno/Asignatura**: Debe existir en la base de datos
- **Mes**: Debe estar entre 1 y 12
- **Año**: Debe estar entre 2020 y 2100
- **Notas**: Deben estar entre 0 y 10
- **Unicidad**: No pueden existir dos notas para el mismo alumno, asignatura, mes y año

### Validaciones de Negocio

- El alumno debe existir y estar activo
- La asignatura debe existir
- El mes debe ser válido para el sistema trimestral (2-10)

---

## 🚀 Ejemplos de Uso con cURL

### Crear Nota Mensual

```bash
curl -X POST http://localhost:3000/notas-mensuales \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "mes": 3,
    "anio": 2025,
    "tarea_1": 8.5,
    "examen_mensual": 9.0
  }'
```

### Actualizar Nota Mensual

```bash
curl -X PATCH http://localhost:3000/notas-mensuales/1 \
  -H "Content-Type: application/json" \
  -d '{
    "examen_mensual": 9.5
  }'
```

### Consultar Notas

```bash
# Todas las notas de un alumno
curl http://localhost:3000/notas-mensuales?id_alumno=1

# Notas de un mes específico
curl http://localhost:3000/notas-mensuales?mes=3&anio=2025
```

---

## 📚 Documentación Swagger

La documentación interactiva de Swagger está disponible en:

```
http://localhost:3000/api
```

Busca la sección **"Notas Mensuales"** para probar los endpoints directamente desde el navegador.

---

## 🛠️ Estructura del Módulo

```
src/notas-mensuales/
├── dto/
│   ├── create-nota-mensual.dto.ts
│   ├── update-nota-mensual.dto.ts
│   ├── query-nota-mensual.dto.ts
│   ├── nota-mensual-response.dto.ts
│   └── index.ts
├── notas-mensuales.controller.ts
├── notas-mensuales.service.ts
└── notas-mensuales.module.ts
```

---

## ⚠️ Notas Importantes

1. **Campos Opcionales**: Todos los campos de notas (tarea_1, tarea_2, etc.) son opcionales. El sistema calcula el promedio solo con las notas ingresadas.

2. **Almacenamiento Simplificado**: Esta versión simplificada almacena la información directamente en la tabla `NotaMensual`. No utiliza la tabla `ActividadEvaluacion`.

3. **Compatibilidad**: Este módulo coexiste con el módulo `sistema-evaluacion` existente, que tiene funcionalidades más avanzadas.

4. **Cálculo del Trimestre**: El trimestre se calcula automáticamente basado en el mes ingresado.

---

## 🔄 Diferencias con sistema-evaluacion

| Característica | notas-mensuales | sistema-evaluacion |
|---------------|-----------------|-------------------|
| Complejidad | Simple | Completa |
| Endpoints | CRUD básico | CRUD + Reportes |
| Validaciones | Básicas | Avanzadas por nivel educativo |
| Estrategias | No | Sí (Básica/Bachillerato) |
| Actividades | No detalladas | Detalladas por tipo |
| Uso | Ingreso rápido | Sistema completo |

---

## 📞 Soporte

Para dudas o problemas, contacta al equipo de desarrollo.
