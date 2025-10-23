# 📚 Guía de Inscripción de Alumnos a Cursos

## 🎯 Resumen del Problema y Solución

### ❌ Problema Identificado

- Tenías la tabla `AlumnoCurso` pero no había funciones para inscribir alumnos
- No era claro si debías inscribir al crear el alumno o hacerlo por separado

### ✅ Solución Implementada

- **NO se inscribe al alumno automáticamente** al crearlo (buena práctica)
- Se crearon **endpoints separados** para gestionar inscripciones
- La inscripción es un proceso independiente de la creación del alumno

## 📋 Nuevos Endpoints Disponibles

### 1️⃣ Inscribir un Alumno a un Curso

```http
POST /alumnos/:id/inscripciones
```

**Body:**

```json
{
  "cursoId": 1,
  "anioAcademico": "2025",
  "seccionAsignada": "Sección A", // Opcional
  "observaciones": "Alumno regular", // Opcional
  "estado": "ACTIVO" // Opcional, por defecto es ACTIVO
}
```

**Respuesta:**

```json
{
  "id": 1,
  "alumnoId": 5,
  "cursoId": 1,
  "fechaInscripcion": "2025-10-22T18:00:00.000Z",
  "fechaRetiro": null,
  "seccionAsignada": "Sección A",
  "anioAcademico": "2025",
  "estado": "ACTIVO",
  "observaciones": "Alumno regular",
  "alumno": {
    "id_alumno": 5,
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "curso": {
    "id_curso": 1,
    "nombre": "3° Grado",
    "seccion": "A",
    "gradoAcademico": {
      "nombre": "Tercer Grado"
    }
  }
}
```

**Validaciones automáticas:**

- ✅ Verifica que el alumno exista y esté activo
- ✅ Verifica que el curso exista y esté activo
- ✅ Verifica que haya cupos disponibles
- ✅ Verifica que no esté ya inscrito en el mismo curso para el mismo año

---

### 2️⃣ Obtener Inscripciones de un Alumno

```http
GET /alumnos/:id/inscripciones
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "alumnoId": 5,
    "cursoId": 1,
    "fechaInscripcion": "2025-10-22T18:00:00.000Z",
    "fechaRetiro": null,
    "seccionAsignada": "A",
    "anioAcademico": "2025",
    "estado": "ACTIVO",
    "curso": {
      "id_curso": 1,
      "nombre": "3° Grado",
      "seccion": "A",
      "aula": "Aula 5",
      "gradoAcademico": {
        "nombre": "Tercer Grado"
      },
      "orientador": {
        "nombre": "María",
        "apellido": "González"
      }
    }
  }
]
```

---

### 3️⃣ Retirar un Alumno de un Curso

```http
PATCH /alumnos/:id/inscripciones/:inscripcionId/retirar
```

**Respuesta:**

```json
{
  "id": 1,
  "alumnoId": 5,
  "cursoId": 1,
  "fechaInscripcion": "2025-10-22T18:00:00.000Z",
  "fechaRetiro": "2025-10-23T10:00:00.000Z",
  "estado": "INACTIVO",
  "curso": {
    "nombre": "3° Grado"
  }
}
```

---

## 🔄 Flujo Recomendado

### Paso 1: Crear el Alumno

```http
POST /alumnos
```

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "15/05/2010",
  "genero": "Masculino",
  "activo": true,
  "responsables": [
    {
      "responsableId": 1,
      "parentescoId": 1,
      "esPrincipal": true
    }
  ]
}
```

### Paso 2: Inscribir al Alumno en un Curso

```http
POST /alumnos/5/inscripciones
```

```json
{
  "cursoId": 1,
  "anioAcademico": "2025"
}
```

---

## ✅ Ventajas de Esta Arquitectura

1. **Separación de responsabilidades**: Crear alumno ≠ Inscribir alumno
2. **Flexibilidad**: Puedes crear alumnos sin inscribirlos inmediatamente
3. **Validaciones robustas**: Verifica cupos, estado del curso, duplicados
4. **Historial completo**: Mantiene registro de todas las inscripciones
5. **Gestión de estados**: Permite activar/desactivar inscripciones
6. **Trazabilidad**: Registra actividades en el sistema

---

## 🔍 Casos de Uso

### Caso 1: Nuevo Alumno (Inscripción Inmediata)

1. Crear alumno con datos básicos
2. Inscribir en curso del año actual

### Caso 2: Alumno Existente (Nueva Inscripción)

1. El alumno ya existe en el sistema
2. Solo inscribir en un nuevo curso (promoción, cambio de grado)

### Caso 3: Retirar Alumno

1. Marcar inscripción como INACTIVO
2. Liberar cupo en el curso
3. Mantener histórico

---

## 🛠️ Ejemplo Completo con JavaScript/TypeScript

```typescript
// 1. Crear el alumno
const nuevoAlumno = await fetch('/alumnos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Juan',
    apellido: 'Pérez',
    fechaNacimiento: '15/05/2010',
    genero: 'Masculino',
    activo: true,
  }),
});

const alumno = await nuevoAlumno.json();

// 2. Inscribir en curso
const inscripcion = await fetch(`/alumnos/${alumno.id_alumno}/inscripciones`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cursoId: 1,
    anioAcademico: '2025',
    estado: 'ACTIVO',
  }),
});

const resultado = await inscripcion.json();
console.log('Alumno inscrito:', resultado);
```

---

## 📊 Schema de la Base de Datos

Tu schema está **perfectamente diseñado**:

```prisma
model AlumnoCurso {
  id                Int       @id @default(autoincrement())
  alumnoId          Int
  cursoId           Int
  fechaInscripcion  DateTime  @default(now())
  fechaRetiro       DateTime?
  seccionAsignada   String?
  anioAcademico     String
  estado            String    // "ACTIVO", "INACTIVO"
  observaciones     String?

  alumno            Alumno    @relation(...)
  curso             Curso     @relation(...)

  @@unique([alumnoId, cursoId, anioAcademico])
}
```

**Características clave:**

- ✅ Permite múltiples inscripciones por año
- ✅ Previene duplicados con `@@unique`
- ✅ Mantiene histórico con `fechaRetiro`
- ✅ Flexible con `observaciones`

---

## 🚨 Errores Comunes y Soluciones

### Error: "El alumno ya está inscrito"

**Causa:** Intentas inscribir al mismo alumno en el mismo curso para el mismo año  
**Solución:** Verifica las inscripciones existentes primero

### Error: "El curso no tiene cupos disponibles"

**Causa:** El curso alcanzó su capacidad máxima  
**Solución:** Aumenta el cupo del curso o elige otro curso

### Error: "No se puede inscribir un alumno inactivo"

**Causa:** El alumno está marcado como inactivo  
**Solución:** Reactiva el alumno primero con `PATCH /alumnos/:id/restore`

---

## 📝 Notas Finales

- **NO** necesitas modificar el schema de Prisma
- Los endpoints están listos para usar
- La lógica de validación está implementada
- Se registran todas las actividades importantes
- El código sigue las mejores prácticas de NestJS

¡Todo está listo para inscribir alumnos! 🎉
