# Ejemplos Prácticos - Módulo de Evaluaciones

## Escenario 1: Orientador Configura Evaluaciones del Trimestre

### Paso 1: Ver tipos de evaluación disponibles
```bash
GET /tipo-evaluacion
```

### Paso 2: Crear evaluaciones para Matemáticas
```json
POST /evaluaciones

// Examen
{
  "nombre": "Examen Trimestral I - Matemáticas",
  "puntaje_minimo": 0,
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 1
}

// Tareas
{
  "nombre": "Tarea 1 - Ecuaciones",
  "puntaje_minimo": 0,
  "puntaje_maximo": 5,
  "id_tipo_evaluacion": 2
}

{
  "nombre": "Tarea 2 - Geometría",
  "puntaje_minimo": 0,
  "puntaje_maximo": 5,
  "id_tipo_evaluacion": 2
}

// Proyecto
{
  "nombre": "Proyecto Final - Aplicación Matemática",
  "puntaje_minimo": 0,
  "puntaje_maximo": 15,
  "id_tipo_evaluacion": 3
}
```

### Paso 3: Ver todas las evaluaciones creadas
```bash
GET /evaluaciones/tipo/1  # Ver todos los exámenes
GET /evaluaciones/tipo/2  # Ver todas las tareas
```

---

## Escenario 2: Personal Administrativo Analiza Rendimiento

### Paso 1: Ver estadísticas generales
```bash
GET /evaluaciones/estadisticas
```

**Respuesta esperada:**
```json
{
  "totalEvaluaciones": 25,
  "totalNotas": 750,
  "promedioGeneral": "7.65",
  "evaluacionesPorTipo": [
    {
      "id": 1,
      "nombre": "Examen",
      "totalEvaluaciones": 10
    },
    {
      "id": 2,
      "nombre": "Tarea",
      "totalEvaluaciones": 12
    },
    {
      "id": 3,
      "nombre": "Proyecto",
      "totalEvaluaciones": 3
    }
  ]
}
```

### Paso 2: Ver historial de exámenes
```bash
GET /evaluaciones/historial?id_tipo_evaluacion=1&limite=20
```

### Paso 3: Buscar evaluaciones específicas
```bash
GET /evaluaciones/historial?nombre=Matemáticas
```

**Respuesta con estadísticas:**
```json
{
  "total": 3,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1,
  "evaluaciones": [
    {
      "id_evaluacion": 1,
      "nombre": "Examen Trimestral I - Matemáticas",
      "puntaje_minimo": 0,
      "puntaje_maximo": 10,
      "tipoEvaluacion": {
        "nombre": "Examen",
        "activo": true
      },
      "estadisticas": {
        "promedio": "7.85",
        "notaMaxima": 10,
        "notaMinima": 5.5,
        "totalNotas": 30
      },
      "notas": [
        {
          "id_nota": 150,
          "calificacion": 9.5,
          "fecha_registro": "2025-11-05T10:30:00Z",
          "alumno": {
            "id_alumno": 5,
            "nombre": "María",
            "apellido": "González"
          }
        }
        // ... últimas 5 notas
      ]
    }
  ]
}
```

---

## Escenario 3: Administrador Genera Reportes

### Paso 1: Filtrar por rango de fechas
```bash
GET /evaluaciones/historial?fecha_inicio=2025-01-01&fecha_fin=2025-03-31
```

### Paso 2: Paginación para reportes grandes
```bash
# Primera página
GET /evaluaciones/historial?pagina=1&limite=50

# Segunda página
GET /evaluaciones/historial?pagina=2&limite=50
```

### Paso 3: Combinar múltiples filtros
```bash
GET /evaluaciones/historial?id_tipo_evaluacion=1&nombre=Examen&fecha_inicio=2025-01-01&pagina=1&limite=20
```

---

## Escenario 4: Actualización de Evaluaciones

### Caso 1: Cambiar escala de calificación
```json
PATCH /evaluaciones/5

{
  "puntaje_maximo": 100
}
```

### Caso 2: Renombrar evaluación
```json
PATCH /evaluaciones/5

{
  "nombre": "Examen Final - Matemáticas Avanzadas"
}
```

### Caso 3: Cambiar tipo de evaluación
```json
PATCH /evaluaciones/5

{
  "id_tipo_evaluacion": 2
}
```

**Nota:** Se validará que el nuevo tipo esté activo y que no exista otra evaluación con el mismo nombre.

---

## Escenario 5: Manejo de Errores Comunes

### Error 1: Tipo de evaluación inactivo
```json
POST /evaluaciones
{
  "nombre": "Nueva Evaluación",
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 999
}
```

**Respuesta:**
```json
{
  "statusCode": 404,
  "message": "Tipo de evaluación con ID 999 no encontrado"
}
```

### Error 2: Puntaje mínimo mayor que máximo
```json
POST /evaluaciones
{
  "nombre": "Evaluación Test",
  "puntaje_minimo": 10,
  "puntaje_maximo": 5,
  "id_tipo_evaluacion": 1
}
```

**Respuesta:**
```json
{
  "statusCode": 400,
  "message": "El puntaje mínimo no puede ser mayor que el puntaje máximo"
}
```

### Error 3: Nombre duplicado
```json
POST /evaluaciones
{
  "nombre": "Examen Final - Matemáticas",
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 1
}
```

**Respuesta:**
```json
{
  "statusCode": 409,
  "message": "Ya existe una evaluación con el nombre \"Examen Final - Matemáticas\" para este tipo de evaluación"
}
```

### Error 4: Eliminar evaluación con notas
```bash
DELETE /evaluaciones/5
```

**Respuesta:**
```json
{
  "statusCode": 409,
  "message": "No se puede eliminar la evaluación porque tiene 30 nota(s) asociada(s)"
}
```

---

## Escenario 6: Workflow Completo del Trimestre

### Fase 1: Planificación (Orientador)
```bash
# 1. Ver tipos disponibles
GET /tipo-evaluacion

# 2. Crear evaluaciones del trimestre
POST /evaluaciones (múltiples veces)

# 3. Verificar evaluaciones creadas
GET /evaluaciones
```

### Fase 2: Ejecución (Durante el trimestre)
```bash
# Ver evaluaciones pendientes
GET /evaluaciones/tipo/1

# Ver detalle de una evaluación específica
GET /evaluaciones/15
```

### Fase 3: Seguimiento (Personal Administrativo)
```bash
# Ver progreso general
GET /evaluaciones/estadisticas

# Ver evaluaciones con más registros
GET /evaluaciones/historial?limite=10

# Filtrar por tipo
GET /evaluaciones/historial?id_tipo_evaluacion=1
```

### Fase 4: Cierre y Análisis (Admin)
```bash
# Reporte completo del trimestre
GET /evaluaciones/historial?fecha_inicio=2025-01-01&fecha_fin=2025-03-31&limite=100

# Estadísticas finales
GET /evaluaciones/estadisticas

# Análisis por tipo
GET /evaluaciones/tipo/1
GET /evaluaciones/tipo/2
GET /evaluaciones/tipo/3
```

---

## Scripts de Automatización

### Script 1: Crear evaluaciones estándar
```javascript
const evaluacionesEstandar = [
  { nombre: 'Examen Trimestral I', tipo: 1, max: 10 },
  { nombre: 'Examen Trimestral II', tipo: 1, max: 10 },
  { nombre: 'Examen Final', tipo: 1, max: 15 },
  { nombre: 'Tarea 1', tipo: 2, max: 5 },
  { nombre: 'Tarea 2', tipo: 2, max: 5 },
  { nombre: 'Proyecto Final', tipo: 3, max: 20 }
];

for (const ev of evaluacionesEstandar) {
  await fetch('/evaluaciones', {
    method: 'POST',
    body: JSON.stringify({
      nombre: `${ev.nombre} - Matemáticas`,
      puntaje_minimo: 0,
      puntaje_maximo: ev.max,
      id_tipo_evaluacion: ev.tipo
    })
  });
}
```

### Script 2: Exportar reporte completo
```javascript
async function exportarReporte() {
  const limite = 100;
  let pagina = 1;
  let todasLasEvaluaciones = [];
  
  while (true) {
    const response = await fetch(
      `/evaluaciones/historial?pagina=${pagina}&limite=${limite}`
    );
    const data = await response.json();
    
    todasLasEvaluaciones.push(...data.evaluaciones);
    
    if (pagina >= data.totalPaginas) break;
    pagina++;
  }
  
  return todasLasEvaluaciones;
}
```

---

## Tips y Mejores Prácticas

### 1. Nomenclatura de Evaluaciones
✅ **Bueno:** "Examen Trimestral I - Matemáticas"
❌ **Malo:** "Examen 1"

### 2. Uso de Puntajes
- Define rangos claros (0-10, 0-100)
- Mantén consistencia por asignatura
- Documenta el sistema de calificación

### 3. Historial y Reportes
- Usa paginación para grandes volúmenes
- Filtra por fechas específicas
- Aprovecha las estadísticas automáticas

### 4. Eliminación Segura
- Verifica que no hay notas antes de eliminar
- Considera desactivar en lugar de eliminar
- Mantén histórico para auditoría

### 5. Permisos
- Solo orientador crea/modifica evaluaciones
- Admin y P.A consultan historial
- Admin tiene acceso total
