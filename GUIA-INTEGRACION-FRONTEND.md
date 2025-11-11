# Guía de Integración Frontend - Sistema de Calificaciones

## Endpoints Disponibles

### 1. Autenticación

```http
POST /auth/login
Content-Type: application/json

{
  "email": "orientador@ejemplo.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "orientador@ejemplo.com",
    "role": "orientador"
  }
}
```

**Nota:** Incluir el token en todas las peticiones subsecuentes:

```
Authorization: Bearer {access_token}
```

---

## 2. Gestión de Notas

### 2.1 Obtener Alumnos de un Curso con sus Notas para una Evaluación

```http
GET /notas/por-evaluacion/:evaluacionId?anioAcademico=2025
Authorization: Bearer {token}

Response:
{
  "evaluacion": {
    "id_evaluacion": 1,
    "nombre": "Tarea - Periodo 1",
    "puntaje_maximo": 10,
    "puntaje_minimo": 0,
    "asignatura": {
      "id_asignatura": 3,
      "nombre": "Matemáticas"
    }
  },
  "alumnos": [
    {
      "id_alumno": 11,
      "nombre": "Carlos",
      "apellido": "Martínez",
      "nota": {
        "id_nota": 100,
        "calificacion": 8.7,
        "fecha_registro": "2025-11-10T10:30:00Z"
      }
    },
    {
      "id_alumno": 12,
      "nombre": "María",
      "apellido": "Rodríguez",
      "nota": null
    }
  ]
}
```

### 2.2 Crear o Actualizar una Nota Individual

```http
POST /notas
Authorization: Bearer {token}
Content-Type: application/json

{
  "id_alumno": 11,
  "id_asignatura": 3,
  "id_evaluacion": 1,
  "calificacion": 8.7,
  "trimestre": null,
  "anioAcademico": "2025"
}

Response:
{
  "id_nota": 100,
  "id_alumno": 11,
  "id_asignatura": 3,
  "id_evaluacion": 1,
  "calificacion": 8.7,
  "fecha_registro": "2025-11-10T10:30:00Z"
}
```

**Nota:** Si la nota ya existe, se actualiza automáticamente.

### 2.3 Guardar Múltiples Notas (Batch)

```http
POST /notas/masivo
Authorization: Bearer {token}
Content-Type: application/json

{
  "id_evaluacion": 1,
  "id_asignatura": 3,
  "anioAcademico": "2025",
  "notas": [
    { "id_alumno": 11, "calificacion": 8.7 },
    { "id_alumno": 12, "calificacion": 9.0 },
    { "id_alumno": 13, "calificacion": 7.5 }
  ]
}

Response:
{
  "success": true,
  "count": 3,
  "notas": [...]
}
```

---

## 3. Gestión de Promedios

### 3.1 Recalcular Promedios de un Alumno

```http
POST /promedios/recalcular/:alumnoId?anioAcademico=2025
Authorization: Bearer {token}

Response:
{
  "message": "Promedios recalculados exitosamente",
  "alumnoId": 11,
  "anioAcademico": "2025"
}
```

**Importante:** Este endpoint se debe llamar después de guardar/actualizar notas.

### 3.2 Obtener Promedios de un Alumno

```http
GET /promedios/alumno/:alumnoId?anioAcademico=2025
Authorization: Bearer {token}

Response:
{
  "alumno": {
    "id_alumno": 11,
    "nombre": "Carlos",
    "apellido": "Martínez"
  },
  "promedioGeneral": {
    "promedioGeneral": 8.28,
    "estadoFinal": "APROBADO",
    "aprobadoTodasAsignaturas": true,
    "asignaturasReprobadas": 0,
    "calificacionesCerradas": false
  },
  "asignaturas": [
    {
      "asignatura": "Matemáticas",
      "promedioFinal": 8.28,
      "aprobado": true,
      "periodos": [
        { "periodo": 1, "promedio": 8.28 },
        { "periodo": 2, "promedio": 8.28 },
        { "periodo": 3, "promedio": 8.28 },
        { "periodo": 4, "promedio": 8.28 }
      ]
    }
  ]
}
```

### 3.3 Verificar si un Alumno Puede ser Promovido

```http
GET /promedios/verificar-aprobacion/:alumnoId?anioAcademico=2025
Authorization: Bearer {token}

Response (Aprobado):
{
  "puedePromover": true,
  "promedioGeneral": 8.28,
  "estadoFinal": "APROBADO",
  "aprobadoTodasAsignaturas": true
}

Response (Reprobado):
{
  "puedePromover": false,
  "motivo": "El alumno no ha aprobado todas las asignaturas",
  "promedioGeneral": 7.5,
  "estadoFinal": "REPROBADO",
  "aprobadoTodasAsignaturas": false,
  "asignaturasReprobadas": [
    {
      "asignatura": "Matemáticas",
      "promedioFinal": 5.5
    }
  ]
}
```

### 3.4 Cerrar Calificaciones

```http
POST /promedios/cerrar/:alumnoId?cursoId=3&anioAcademico=2025
Authorization: Bearer {token}

Response:
{
  "message": "Calificaciones cerradas exitosamente",
  "alumnoId": 11,
  "calificacionesCerradas": true,
  "fechaCierre": "2025-11-10T15:00:00Z"
}
```

**Importante:** Esto debe hacerse antes de permitir la promoción del alumno.

---

## 4. Consultas de Evaluaciones

### 4.1 Obtener Evaluaciones de una Asignatura

```http
GET /evaluaciones/asignatura/:asignaturaId?anioAcademico=2025
Authorization: Bearer {token}

Response:
{
  "asignatura": {
    "id_asignatura": 3,
    "nombre": "Matemáticas"
  },
  "evaluaciones": [
    {
      "id_evaluacion": 1,
      "nombre": "Tarea - Periodo 1",
      "periodo": 1,
      "tipoEvaluacion": {
        "nombre": "Tarea",
        "porcentaje": 5
      }
    },
    ...
  ]
}
```

### 4.2 Obtener Evaluaciones por Periodo

```http
GET /evaluaciones/periodo?asignaturaId=3&periodo=1&anioAcademico=2025
Authorization: Bearer {token}

Response:
{
  "periodo": 1,
  "asignatura": "Matemáticas",
  "evaluaciones": [
    { "id_evaluacion": 1, "nombre": "Tarea - Periodo 1" },
    { "id_evaluacion": 2, "nombre": "Laboratorio - Periodo 1" },
    ...
  ]
}
```

---

## 5. Flujo Completo de Calificación

### Paso 1: Login y Obtener Token

```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'orientador@ejemplo.com',
    password: 'password123',
  }),
});
const { access_token } = await response.json();
```

### Paso 2: Obtener Evaluaciones de la Asignatura

```javascript
const evaluaciones = await fetch(
  '/evaluaciones/asignatura/3?anioAcademico=2025',
  {
    headers: { Authorization: `Bearer ${access_token}` },
  },
);
```

### Paso 3: Seleccionar Evaluación y Obtener Alumnos

```javascript
const datosCalificacion = await fetch(
  '/notas/por-evaluacion/1?anioAcademico=2025',
  {
    headers: { Authorization: `Bearer ${access_token}` },
  },
);
```

### Paso 4: Guardar Notas

```javascript
// Opción A: Una por una
await fetch('/notas', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id_alumno: 11,
    id_asignatura: 3,
    id_evaluacion: 1,
    calificacion: 8.7,
    anioAcademico: '2025',
  }),
});

// Opción B: En lote (Recomendado)
await fetch('/notas/masivo', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id_evaluacion: 1,
    id_asignatura: 3,
    anioAcademico: '2025',
    notas: [
      { id_alumno: 11, calificacion: 8.7 },
      { id_alumno: 12, calificacion: 9.0 },
      { id_alumno: 13, calificacion: 7.5 },
    ],
  }),
});
```

### Paso 5: Recalcular Promedios (si no es automático)

```javascript
await fetch('/promedios/recalcular/11?anioAcademico=2025', {
  method: 'POST',
  headers: { Authorization: `Bearer ${access_token}` },
});
```

### Paso 6: Consultar Promedios

```javascript
const promedios = await fetch('/promedios/alumno/11?anioAcademico=2025', {
  headers: { Authorization: `Bearer ${access_token}` },
});
```

---

## 6. Validaciones del Frontend

### Validar Calificación

```javascript
function validarCalificacion(calificacion) {
  const nota = parseFloat(calificacion);

  if (isNaN(nota)) {
    return { valid: false, error: 'Debe ser un número' };
  }

  if (nota < 0 || nota > 10) {
    return { valid: false, error: 'Debe estar entre 0 y 10' };
  }

  return { valid: true };
}
```

### Calcular Promedio de Periodo (Bachillerato)

```javascript
function calcularPromedioPeriodo(notas) {
  return (
    0.25 * notas.actividadIntegradora +
    0.05 * notas.tarea +
    0.05 * notas.coevaluacion +
    0.1 * notas.laboratorio +
    0.25 * notas.examenParcial +
    0.3 * notas.examenPeriodo
  ).toFixed(2);
}
```

### Calcular Promedio Trimestral (Básica)

```javascript
function calcularPromedioTrimestral(datos) {
  const promedioMeses =
    0.28 * datos.mes1 + 0.27 * datos.mes2 + 0.45 * datos.mes3;

  const promedioActividades =
    0.25 * datos.actividadIntegradora + 0.1 * datos.autoevaluacion;

  return (
    0.35 * promedioMeses +
    0.35 * promedioActividades +
    0.3 * datos.examenTrimestral
  ).toFixed(2);
}
```

---

## 7. Manejo de Errores

### Errores Comunes

**401 Unauthorized**

- Token expirado o inválido
- Solución: Hacer login nuevamente

**403 Forbidden**

- Usuario no tiene permisos para esa acción
- Verificar rol del usuario

**404 Not Found**

- Evaluación, alumno o asignatura no existe
- Verificar IDs antes de enviar

**400 Bad Request**

- Datos inválidos
- Verificar estructura del JSON y tipos de datos

### Ejemplo de Manejo de Errores

```javascript
try {
  const response = await fetch('/notas', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notaData),
  });

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 401) {
      // Redirigir a login
      redirectToLogin();
    } else if (response.status === 400) {
      // Mostrar mensaje de validación
      showError(error.message);
    } else {
      // Error genérico
      showError('Error al guardar la nota');
    }

    return;
  }

  const data = await response.json();
  showSuccess('Nota guardada correctamente');
} catch (error) {
  showError('Error de conexión');
}
```

---

## 8. Estructura de Datos Recomendada para el Frontend

### Estado de la Aplicación

```javascript
{
  auth: {
    token: "eyJhbGc...",
    user: {
      id: 2,
      nombre: "Juan",
      apellido: "Pérez",
      role: "orientador"
    }
  },
  calificacion: {
    asignaturaSeleccionada: 3,
    evaluacionSeleccionada: 1,
    alumnos: [...],
    notasTemp: {} // Para guardar cambios antes de enviar
  },
  promedios: {
    alumnoId: 11,
    data: {...}
  }
}
```

---

## 9. Notas Importantes

1. **Siempre incluir anioAcademico**: La mayoría de endpoints requieren este parámetro.

2. **Recálculo automático**: Si el backend está configurado para recalcular automáticamente, no es necesario llamar al endpoint de recálculo después de cada nota.

3. **Escala de notas**: Todas las notas están en escala 0-10, no 0-100.

4. **Cierre de calificaciones**: Debe hacerse antes de promover a un alumno.

5. **Validación de promoción**: Siempre verificar con el endpoint de verificación antes de permitir la promoción.

6. **Periodos vs Trimestres**:
   - BÁSICA usa trimestres (3)
   - BACHILLERATO usa periodos (4)

7. **Estado del alumno**: Un alumno puede estar APROBADO con el promedio general pero REPROBADO si tiene una asignatura reprobada.

---

## 10. Testing

### Datos de Prueba Disponibles

**BÁSICA:**

- Alumno ID: 4
- Curso: Quinto Grado
- Asignaturas: Matemática I, Lenguaje y Literatura
- Promedio esperado: 8.813

**BACHILLERATO:**

- Alumno ID: 11 (Carlos Martínez)
- Curso: Primer Año de Bachillerato
- Asignatura: Matemáticas
- Promedio esperado: 8.28

### Comandos para Preparar Datos de Prueba

Ver archivo: GUIA-SCRIPTS.md
