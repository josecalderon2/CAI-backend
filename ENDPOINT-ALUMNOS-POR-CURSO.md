# ✅ Endpoint de Alumnos por Curso - Implementado

## 🎯 Estado: COMPLETADO

**Fecha:** 28 de octubre de 2025  
**Archivos modificados:**

- ✅ `src/cursos/cursos.controller.ts`
- ✅ `src/cursos/cursos.service.ts`

---

## 📋 Nuevo Endpoint

### URL:

```
GET /cursos/:id/alumnos
```

### Autenticación:

- **Requerida:** Sí (JWT Bearer Token)
- **Roles permitidos:** `Orientador`, `Admin`, `P.A`

### Parámetros:

- **`:id`** (number) - ID del curso

---

## 🔧 Implementación

### Controller

```typescript
@Get(':id/alumnos')
@Roles('Orientador', 'Admin', 'P.A')
async getAlumnosPorCurso(@Param('id', ParseIntPipe) id: number)
```

### Service

```typescript
async getAlumnosPorCurso(cursoId: number) {
  // Verifica existencia del curso
  // Busca en AlumnoCurso con estado ACTIVO
  // Ordena por apellido
  // Retorna datos básicos del alumno
}
```

---

## 📊 Respuesta Ejemplo

### Request:

```bash
GET /cursos/1/alumnos
Authorization: Bearer <token>
```

### Response (200 OK):

```json
[
  {
    "id_alumno": 1,
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  {
    "id_alumno": 2,
    "nombre": "María",
    "apellido": "González"
  }
]
```

### Casos especiales:

#### Curso sin alumnos:

```json
[]
```

#### Curso no existe (404):

```json
{
  "statusCode": 404,
  "message": "Curso no encontrado"
}
```

---

## 🧪 Testing

### Con curl:

```bash
curl -X GET "http://localhost:3000/cursos/1/alumnos" \
  -H "Authorization: Bearer <TOKEN>"
```

### Con Postman:

- **Método:** GET
- **URL:** `http://localhost:3000/cursos/1/alumnos`
- **Headers:**
  - `Authorization: Bearer <TOKEN>`

---

## 🔍 Validación SQL

```sql
-- Verificar alumnos de un curso
SELECT
  a.id_alumno,
  a.nombre,
  a.apellido,
  ac.estado
FROM "AlumnoCurso" ac
JOIN "Alumno" a ON ac."alumnoId" = a.id_alumno
WHERE ac."cursoId" = 1
  AND ac.estado = 'ACTIVO'
ORDER BY a.apellido ASC;
```

---

## ✅ Características

- ✅ Validación de existencia del curso
- ✅ Solo alumnos con estado ACTIVO
- ✅ Ordenados alfabéticamente por apellido
- ✅ Autenticación y autorización
- ✅ Documentación Swagger
- ✅ Sin errores TypeScript
- ✅ Listo para producción

---

## 🚀 Uso en Frontend

```typescript
// Obtener alumnos de un curso
const response = await fetch(`/cursos/${cursoId}/alumnos`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const alumnos = await response.json();

console.log(`✅ ${alumnos.length} alumnos en el curso`);
```

---

**Estado:** ✅ Implementado y funcionando
