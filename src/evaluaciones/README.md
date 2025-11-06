# Módulo de Evaluaciones

## Descripción
Este módulo permite la gestión completa de evaluaciones en el sistema educativo. Las evaluaciones están basadas en tipos de evaluación predefinidos y permiten establecer puntajes mínimos y máximos.

## Características Principales

### 1. **Gestión de Evaluaciones (Orientador)**
- ✅ Crear evaluaciones con nombre específico
- ✅ Asignar puntaje mínimo y máximo
- ✅ Vincular con tipos de evaluación existentes
- ✅ Actualizar evaluaciones
- ✅ Eliminar evaluaciones (si no tienen notas asociadas)

### 2. **Historial de Evaluaciones (Admin & Personal Administrativo)**
- ✅ Consultar historial completo de evaluaciones
- ✅ Filtrar por tipo de evaluación
- ✅ Buscar por nombre
- ✅ Filtrar por rango de fechas
- ✅ Paginación de resultados
- ✅ Estadísticas por evaluación

### 3. **Estadísticas Generales**
- ✅ Total de evaluaciones
- ✅ Distribución por tipo de evaluación
- ✅ Promedio general de calificaciones
- ✅ Total de notas registradas

## Endpoints

### **POST** `/evaluaciones`
**Crear nueva evaluación**
- **Roles:** Orientador, Admin
- **Body:**
```json
{
  "nombre": "Examen Final de Matemáticas",
  "puntaje_minimo": 0,
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 1
}
```

### **GET** `/evaluaciones`
**Obtener todas las evaluaciones**
- **Roles:** Orientador, P.A, Admin
- **Response:**
```json
{
  "total": 15,
  "evaluaciones": [
    {
      "id_evaluacion": 1,
      "nombre": "Examen Final de Matemáticas",
      "puntaje_minimo": 0,
      "puntaje_maximo": 10,
      "id_tipo_evaluacion": 1,
      "tipoEvaluacion": {
        "id_tipo_evaluacion": 1,
        "nombre": "Examen",
        "activo": true
      },
      "_count": {
        "notas": 30
      }
    }
  ]
}
```

### **GET** `/evaluaciones/tipo/:idTipo`
**Obtener evaluaciones por tipo**
- **Roles:** Orientador, P.A, Admin
- **Params:** `idTipo` - ID del tipo de evaluación
- **Response:**
```json
{
  "tipoEvaluacion": "Examen",
  "total": 5,
  "evaluaciones": [...]
}
```

### **GET** `/evaluaciones/historial`
**Obtener historial de evaluaciones**
- **Roles:** P.A, Admin
- **Query Params:**
  - `id_tipo_evaluacion` (opcional): Filtrar por tipo
  - `nombre` (opcional): Buscar por nombre
  - `fecha_inicio` (opcional): Fecha inicio (YYYY-MM-DD)
  - `fecha_fin` (opcional): Fecha fin (YYYY-MM-DD)
  - `pagina` (opcional, default: 1): Número de página
  - `limite` (opcional, default: 10): Elementos por página

- **Response:**
```json
{
  "total": 50,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 5,
  "evaluaciones": [
    {
      "id_evaluacion": 1,
      "nombre": "Examen Final de Matemáticas",
      "puntaje_minimo": 0,
      "puntaje_maximo": 10,
      "tipoEvaluacion": {...},
      "notas": [...],
      "estadisticas": {
        "promedio": "7.85",
        "notaMaxima": 10,
        "notaMinima": 5.5,
        "totalNotas": 30
      }
    }
  ]
}
```

### **GET** `/evaluaciones/estadisticas`
**Obtener estadísticas generales**
- **Roles:** P.A, Admin
- **Response:**
```json
{
  "totalEvaluaciones": 15,
  "totalNotas": 450,
  "promedioGeneral": "7.65",
  "evaluacionesPorTipo": [
    {
      "id": 1,
      "nombre": "Examen",
      "totalEvaluaciones": 8
    },
    {
      "id": 2,
      "nombre": "Tarea",
      "totalEvaluaciones": 7
    }
  ]
}
```

### **GET** `/evaluaciones/:id`
**Obtener evaluación por ID**
- **Roles:** Orientador, P.A, Admin
- **Params:** `id` - ID de la evaluación

### **PATCH** `/evaluaciones/:id`
**Actualizar evaluación**
- **Roles:** Orientador, Admin
- **Params:** `id` - ID de la evaluación
- **Body:** (todos los campos son opcionales)
```json
{
  "nombre": "Nuevo nombre",
  "puntaje_minimo": 0,
  "puntaje_maximo": 100,
  "id_tipo_evaluacion": 2
}
```

### **DELETE** `/evaluaciones/:id`
**Eliminar evaluación**
- **Roles:** Orientador, Admin
- **Params:** `id` - ID de la evaluación
- **Nota:** Solo se puede eliminar si no tiene notas asociadas

## Validaciones

### Creación/Actualización
- ✅ El nombre es obligatorio
- ✅ El tipo de evaluación debe existir y estar activo
- ✅ El puntaje mínimo no puede ser mayor que el máximo
- ✅ No puede haber dos evaluaciones con el mismo nombre para el mismo tipo

### Eliminación
- ✅ Solo se puede eliminar si no tiene notas asociadas
- ✅ Retorna el número de notas asociadas si no se puede eliminar

## Casos de Uso

### Orientador
1. **Crear evaluaciones del trimestre:**
   ```
   POST /evaluaciones
   {
     "nombre": "Examen Trimestral I - Matemáticas",
     "puntaje_maximo": 10,
     "id_tipo_evaluacion": 1
   }
   ```

2. **Consultar evaluaciones por tipo:**
   ```
   GET /evaluaciones/tipo/1
   ```

3. **Actualizar puntajes:**
   ```
   PATCH /evaluaciones/5
   {
     "puntaje_maximo": 100
   }
   ```

### Personal Administrativo / Admin
1. **Ver historial completo:**
   ```
   GET /evaluaciones/historial?pagina=1&limite=20
   ```

2. **Buscar evaluaciones:**
   ```
   GET /evaluaciones/historial?nombre=Examen&id_tipo_evaluacion=1
   ```

3. **Ver estadísticas:**
   ```
   GET /evaluaciones/estadisticas
   ```

## Relaciones en Base de Datos

```
Evaluacion
├── id_evaluacion (PK)
├── nombre
├── puntaje_minimo
├── puntaje_maximo
├── id_tipo_evaluacion (FK -> Tipo_evaluacion)
└── notas[] (Relación: Notas)

Tipo_evaluacion
├── id_tipo_evaluacion (PK)
├── nombre
├── activo
└── evaluaciones[] (Relación: Evaluacion)

Notas
├── id_nota (PK)
├── id_evaluacion (FK -> Evaluacion)
├── calificacion
├── fecha_registro
└── ...
```

## Permisos por Rol

| Endpoint | Orientador | P.A | Admin |
|----------|------------|-----|-------|
| POST /evaluaciones | ✅ | ❌ | ✅ |
| GET /evaluaciones | ✅ | ✅ | ✅ |
| GET /evaluaciones/tipo/:id | ✅ | ✅ | ✅ |
| GET /evaluaciones/historial | ❌ | ✅ | ✅ |
| GET /evaluaciones/estadisticas | ❌ | ✅ | ✅ |
| GET /evaluaciones/:id | ✅ | ✅ | ✅ |
| PATCH /evaluaciones/:id | ✅ | ❌ | ✅ |
| DELETE /evaluaciones/:id | ✅ | ❌ | ✅ |

## Ejemplos de Uso

### Crear varias evaluaciones para un trimestre
```bash
# Examen de Matemáticas
curl -X POST http://localhost:3000/evaluaciones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Examen Trimestral I - Matemáticas",
    "puntaje_minimo": 0,
    "puntaje_maximo": 10,
    "id_tipo_evaluacion": 1
  }'

# Tarea de Lenguaje
curl -X POST http://localhost:3000/evaluaciones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Tarea 1 - Comprensión Lectora",
    "puntaje_minimo": 0,
    "puntaje_maximo": 5,
    "id_tipo_evaluacion": 2
  }'
```

### Consultar historial con filtros
```bash
# Por tipo de evaluación
curl -X GET "http://localhost:3000/evaluaciones/historial?id_tipo_evaluacion=1" \
  -H "Authorization: Bearer <token>"

# Por nombre
curl -X GET "http://localhost:3000/evaluaciones/historial?nombre=Examen" \
  -H "Authorization: Bearer <token>"

# Con paginación
curl -X GET "http://localhost:3000/evaluaciones/historial?pagina=2&limite=20" \
  -H "Authorization: Bearer <token>"
```

## Notas Importantes

1. **Relación con Tipos de Evaluación:** Las evaluaciones dependen de los tipos de evaluación. Asegúrate de tener tipos activos antes de crear evaluaciones.

2. **Eliminación Segura:** No se pueden eliminar evaluaciones que ya tienen notas registradas para mantener la integridad de los datos históricos.

3. **Estadísticas en Tiempo Real:** Las estadísticas se calculan en tiempo real basándose en todas las notas registradas.

4. **Historial:** El historial incluye las últimas 5 notas de cada evaluación para contexto inmediato.

## Integración con Otros Módulos

- **Tipo Evaluación:** Depende del módulo de tipos de evaluación
- **Notas:** Relacionado con el módulo de notas
- **Alumnos:** Las notas conectan evaluaciones con alumnos
