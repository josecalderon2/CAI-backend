# 📊 GUÍA COMPLETA DE REPORTES DE NOTAS

## 🎯 Conceptos Importantes

### Sistema de Evaluación por Grado

- **BÁSICA (Primaria y Secundaria)**: Usa **TRIMESTRES** (1, 2, 3)
  - Cada trimestre tiene 3 meses
  - Evaluaciones mensuales: Tarea, Revisión Cuaderno, Laboratorio (1 por mes)
  - Evaluaciones trimestrales: Actividad Integradora, Autoevaluación, Examen (1 por trimestre)

- **BACHILLERATO**: Usa **PERIODOS** (1, 2, 3, 4)
  - Cada periodo tiene diferentes evaluaciones
  - 1 evaluación de cada tipo por periodo
  - Tipos: Tarea, Laboratorio, Actividad Integradora, Coevaluación, Examen Parcial, Examen de Periodo

---

## 🚀 Preparación de Datos de Prueba

### Paso 1: Ejecutar Migraciones y Seeds

```bash
# Aplicar migraciones
npx prisma migrate dev

# Ejecutar seeds base
npx prisma db seed
```

### Paso 2: Generar Datos Completos para Reportes

```bash
# Script completo que genera evaluaciones, notas, asistencias y conductas
npx ts-node scripts/generar-datos-prueba-reportes.ts
```

**Este script genera:**

- ✅ Evaluaciones para todos los cursos (respetando trimestres/periodos)
- ✅ Notas aleatorias (7.0-10.0) para alumnos inscritos
- ✅ 30 registros de asistencia por alumno (90% presente)
- ✅ 1-3 infracciones de conducta por alumno

### Paso 3: Calcular Promedios

```bash
# Iniciar servidor
npm run start:dev

# En otra terminal, obtener IDs de alumnos
curl -s "http://localhost:3000/alumnos" \
  -H "Authorization: Bearer TU_TOKEN" | jq '.[0:5] | .[] | .id_alumno'

# Calcular promedios para cada alumno (reemplazar {id})
curl -X POST "http://localhost:3000/promedios/recalcular/{id}?anioAcademico=2025" \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 📋 ENDPOINTS DE REPORTES

### 1. Evaluaciones por Asignatura

**Endpoint:** `GET /reportes-notas/evaluaciones`

**Parámetros:**

- `id_asignatura` (requerido): ID de la asignatura
- `anio` (opcional): Año académico (default: 2025)
- `trimestre` (opcional): Para BÁSICA (1, 2, 3)
- `periodo` (opcional): Para BACHILLERATO (1, 2, 3, 4)

**Ejemplos:**

```bash
# Obtener IDs de asignaturas
curl -s "http://localhost:3000/asignaturas" \
  -H "Authorization: Bearer TOKEN" | jq '.[] | {id: .id_asignatura, nombre, curso: .curso.nombre}'

# Evaluaciones de una asignatura de BÁSICA
curl -s "http://localhost:3000/reportes-notas/evaluaciones?id_asignatura=4&anio=2025&trimestre=1" \
  -H "Authorization: Bearer TOKEN" | jq .

# Evaluaciones de una asignatura de BACHILLERATO
curl -s "http://localhost:3000/reportes-notas/evaluaciones?id_asignatura=1&anio=2025&periodo=1" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
{
  "asignatura": {
    "id_asignatura": 4
  },
  "anio_academico": "2025",
  "distribucionPorcentajes": [
    {
      "tipo": "TAREA",
      "cantidad": 3,
      "porcentaje_base": 15,
      "porcentaje_real_cada_uno": 5
    }
  ],
  "totalPorcentaje": 100
}
```

---

### 2. Alumnos con Calificaciones por Evaluación

**Endpoint:** `GET /reportes-notas/evaluacion/:id/alumnos-calificaciones`

**Ejemplo:**

```bash
# Obtener IDs de evaluaciones
curl -s "http://localhost:3000/evaluaciones" \
  -H "Authorization: Bearer TOKEN" | jq '.[0:5] | .[] | {id: .id_evaluacion, nombre}'

# Ver alumnos y sus calificaciones para una evaluación
curl -s "http://localhost:3000/reportes-notas/evaluacion/123/alumnos-calificaciones" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
{
  "evaluacion": {
    "id_evaluacion": 123,
    "nombre": "TAREA - Mes 2 (T1)"
  },
  "alumnos": [
    {
      "id_alumno": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "calificacion": 8.5
    }
  ]
}
```

---

### 3. Alumnos Pendientes por Evaluación

**Endpoint:** `GET /reportes-notas/evaluacion/:id/pendientes`

**Ejemplo:**

```bash
curl -s "http://localhost:3000/reportes-notas/evaluacion/123/pendientes" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
{
  "evaluacion": {
    "id_evaluacion": 123,
    "nombre": "TAREA - Mes 2 (T1)"
  },
  "total_alumnos": 25,
  "registrados": 23,
  "pendientes": [
    {
      "id_alumno": 15,
      "nombre": "María",
      "apellido": "González"
    }
  ]
}
```

---

### 4. Notas Históricas por Alumno

**Endpoint:** `GET /reportes-notas/alumno/:id/notas`

**Parámetros:**

- `anio` (opcional): Filtrar por año académico

**Ejemplo:**

```bash
# Obtener IDs de alumnos
curl -s "http://localhost:3000/alumnos" \
  -H "Authorization: Bearer TOKEN" | jq '.[0:5] | .[] | {id: .id_alumno, nombre, apellido}'

# Historial de notas de un alumno
curl -s "http://localhost:3000/reportes-notas/alumno/1/notas?anio=2025" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
[
  {
    "id_nota": 1,
    "calificacion": 8.5,
    "fecha_registro": "2025-03-15T10:00:00.000Z",
    "asignatura": {
      "id_asignatura": 4,
      "nombre": "Ciencias Naturales"
    },
    "evaluacion": {
      "id_evaluacion": 123,
      "nombre": "TAREA - Mes 2 (T1)",
      "trimestre": 1,
      "tipoEvaluacion": {
        "nombre": "TAREA",
        "porcentaje": 15
      }
    }
  }
]
```

---

### 5. Promedios por Alumno

**Endpoint:** `GET /reportes-notas/promedios/alumno/:id`

**Parámetros:**

- `anio` (opcional): Año académico (default: 2025)

**Ejemplo:**

```bash
curl -s "http://localhost:3000/reportes-notas/promedios/alumno/1?anio=2025" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada (BÁSICA):**

```json
{
  "anio": "2025",
  "mensual": [
    {
      "id": 1,
      "mes": 2,
      "trimestre": 1,
      "promedioTareas": 8.5,
      "promedioRevisiones": 9.0,
      "promedioLaboratorios": 8.8,
      "promedioMensual": 8.77
    }
  ],
  "trimestral": [
    {
      "id": 1,
      "trimestre": 1,
      "promedioMeses": 8.77,
      "actividadIntegradora": 9.5,
      "autoevaluacion": 10.0,
      "examenTrimestral": 8.0,
      "promedioTrimestral": 8.813,
      "aprobado": true
    }
  ],
  "finalesAsignatura": [
    {
      "id": 1,
      "asignaturaId": 4,
      "promedioTrimestre1": 8.813,
      "promedioTrimestre2": 8.5,
      "promedioTrimestre3": 9.0,
      "promedioFinal": 8.771,
      "aprobado": true
    }
  ],
  "finalAlumno": {
    "promedioGeneral": 8.771,
    "aprobadoTodasAsignaturas": true,
    "asignaturasReprobadas": 0
  }
}
```

**Respuesta esperada (BACHILLERATO):**

```json
{
  "anio": "2025",
  "periodo": [
    {
      "id": 1,
      "periodo": 1,
      "actividadIntegradora": 9.0,
      "promedioTareas": 8.7,
      "coevaluacion": 8.8,
      "promedioLaboratorios": 8.8,
      "examenParcial": 7.5,
      "examenPeriodo": 8.0,
      "promedioPeriodo": 8.28,
      "aprobado": true
    }
  ],
  "finalesAsignatura": [
    {
      "promedioPeriodo1": 8.28,
      "promedioPeriodo2": 8.28,
      "promedioPeriodo3": 8.28,
      "promedioPeriodo4": 8.28,
      "promedioFinal": 8.28,
      "aprobado": true
    }
  ],
  "finalAlumno": {
    "promedioGeneral": 8.28,
    "aprobadoTodasAsignaturas": true
  }
}
```

---

### 6. Ranking por Curso

**Endpoint:** `GET /reportes-notas/curso/:id/ranking`

**Parámetros:**

- `anio` (opcional): Año académico
- `top` (opcional): Cantidad de alumnos (default: 10)

**Ejemplo:**

```bash
# Obtener IDs de cursos
curl -s "http://localhost:3000/cursos/all" \
  -H "Authorization: Bearer TOKEN" | jq '.[] | {id: .id_curso, nombre}'

# Top 10 del curso
curl -s "http://localhost:3000/reportes-notas/curso/1/ranking?anio=2025&top=10" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
[
  {
    "id": 1,
    "alumnoId": 5,
    "promedioGeneral": 9.5,
    "aprobadoTodasAsignaturas": true,
    "asignaturasReprobadas": 0,
    "alumno": {
      "id_alumno": 5,
      "nombre": "Ana",
      "apellido": "López"
    }
  }
]
```

---

### 7. Distribución de Notas por Asignatura

**Endpoint:** `GET /reportes-notas/asignatura/:id/distribucion`

**Parámetros:**

- `anio` (opcional): Año académico

**Ejemplo:**

```bash
curl -s "http://localhost:3000/reportes-notas/asignatura/4/distribucion?anio=2025" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
{
  "count": 150,
  "min": 7.0,
  "max": 10.0,
  "mean": 8.45,
  "median": 8.5,
  "stddev": 0.85
}
```

---

### 8. Boleta de Notas por Alumno

**Endpoint:** `GET /reportes-notas/boleta/alumno/:id`

**Parámetros:**

- `anio` (opcional): Año académico (default: 2025)

**Ejemplo:**

```bash
curl -s "http://localhost:3000/reportes-notas/boleta/alumno/1?anio=2025" \
  -H "Authorization: Bearer TOKEN" | jq .
```

**Respuesta esperada:**

```json
{
  "anio": "2025",
  "finalesAsignatura": [
    {
      "id": 1,
      "alumnoId": 1,
      "asignaturaId": 4,
      "anioAcademico": "2025",
      "promedioTrimestre1": 8.813,
      "promedioTrimestre2": 8.5,
      "promedioTrimestre3": 9.0,
      "promedioFinal": 8.771,
      "aprobado": true,
      "requiereRecuperacion": false,
      "asignatura": {
        "id_asignatura": 4,
        "nombre": "Ciencias Naturales"
      }
    }
  ],
  "finalAlumno": {
    "promedioGeneral": 8.771,
    "aprobadoTodasAsignaturas": true,
    "asignaturasReprobadas": 0,
    "estadoFinal": "APROBADO"
  },
  "conductasResumen": {
    "total": 2,
    "detalles": [
      {
        "id_conducta": 1,
        "fecha": "2025-03-15T00:00:00.000Z",
        "observacion": "Incidente registrado en 15/3/2025",
        "infraccion": {
          "categoria": "MENOS_GRAVE",
          "articulo": "MG-001",
          "descripcion": "Presentación personal indecorosa",
          "puntos": 1
        }
      }
    ]
  },
  "asistencia": {
    "total": 30,
    "presentes": 27,
    "porcentaje": 90.0
  }
}
```

---

## 🧪 Script de Pruebas Completo

Crea un archivo `test-reportes-notas.http` para probar todos los endpoints:

```http
### Variables
@baseUrl = http://localhost:3000
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
@alumnoId = 1
@cursoId = 1
@asignaturaId = 4
@evaluacionId = 123

### 1. Evaluaciones por asignatura (BÁSICA - Trimestre 1)
GET {{baseUrl}}/reportes-notas/evaluaciones?id_asignatura={{asignaturaId}}&anio=2025&trimestre=1
Authorization: Bearer {{token}}

### 2. Evaluaciones por asignatura (BACHILLERATO - Periodo 1)
GET {{baseUrl}}/reportes-notas/evaluaciones?id_asignatura=1&anio=2025&periodo=1
Authorization: Bearer {{token}}

### 3. Alumnos con calificaciones
GET {{baseUrl}}/reportes-notas/evaluacion/{{evaluacionId}}/alumnos-calificaciones
Authorization: Bearer {{token}}

### 4. Alumnos pendientes
GET {{baseUrl}}/reportes-notas/evaluacion/{{evaluacionId}}/pendientes
Authorization: Bearer {{token}}

### 5. Notas históricas
GET {{baseUrl}}/reportes-notas/alumno/{{alumnoId}}/notas?anio=2025
Authorization: Bearer {{token}}

### 6. Promedios del alumno
GET {{baseUrl}}/reportes-notas/promedios/alumno/{{alumnoId}}?anio=2025
Authorization: Bearer {{token}}

### 7. Ranking del curso
GET {{baseUrl}}/reportes-notas/curso/{{cursoId}}/ranking?anio=2025&top=10
Authorization: Bearer {{token}}

### 8. Distribución de notas
GET {{baseUrl}}/reportes-notas/asignatura/{{asignaturaId}}/distribucion?anio=2025
Authorization: Bearer {{token}}

### 9. Boleta del alumno
GET {{baseUrl}}/reportes-notas/boleta/alumno/{{alumnoId}}?anio=2025
Authorization: Bearer {{token}}
```

---

## 📊 Casos de Uso

### Para Padres de Familia

- **Boleta completa**: `/reportes-notas/boleta/alumno/:id`
- Ver promedios finales, asistencias y conducta

### Para Orientadores

- **Alumnos pendientes**: `/reportes-notas/evaluacion/:id/pendientes`
- Saber quién falta por calificar
- **Distribución**: `/reportes-notas/asignatura/:id/distribucion`
- Ver cómo le va al grupo en general

### Para Administración

- **Ranking**: `/reportes-notas/curso/:id/ranking`
- Identificar alumnos destacados
- **Evaluaciones**: `/reportes-notas/evaluaciones`
- Verificar que todas las evaluaciones estén creadas

---

## ⚠️ Notas Importantes

1. **Trimestres vs Periodos:**
   - BÁSICA (Primaria/Secundaria): usa `trimestre` (1-3)
   - BACHILLERATO: usa `periodo` (1-4)

2. **Promedios:**
   - Deben calcularse primero usando: `POST /promedios/recalcular/:id`
   - Si están vacíos, ejecuta el recálculo

3. **Datos de Prueba:**
   - Ejecuta `generar-datos-prueba-reportes.ts` para tener datos completos
   - Genera notas aleatorias entre 7.0 y 10.0

4. **Autenticación:**
   - Todos los endpoints requieren token JWT
   - Usa `POST /auth/login` para obtenerlo

---

## 🐛 Troubleshooting

### Problema: Respuestas vacías

**Solución:** Ejecutar el script de datos de prueba

```bash
npx ts-node scripts/generar-datos-prueba-reportes.ts
```

### Problema: Promedios null

**Solución:** Calcular promedios

```bash
curl -X POST "http://localhost:3000/promedios/recalcular/{alumnoId}?anioAcademico=2025" \
  -H "Authorization: Bearer TOKEN"
```

### Problema: No hay evaluaciones

**Solución:** Verificar que los tipos de evaluación estén configurados

```bash
curl "http://localhost:3000/tipos-evaluacion" \
  -H "Authorization: Bearer TOKEN"
```

---

## 📈 Próximos Pasos

- [ ] Implementar exportación a CSV (`?format=csv`)
- [ ] Implementar exportación a PDF para boletas
- [ ] Agregar filtros por fecha
- [ ] Agregar comparativas entre periodos/trimestres
- [ ] Agregar gráficas de rendimiento
