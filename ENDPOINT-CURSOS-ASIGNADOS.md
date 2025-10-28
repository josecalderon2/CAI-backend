# 🎯 Endpoint de Cursos Asignados - Implementado

## ✅ Estado: COMPLETADO

**Fecha de implementación:** 27 de octubre de 2025  
**Archivos modificados:**

- ✅ `src/cursos/cursos.controller.ts`
- ✅ `src/cursos/cursos.service.ts`

---

## 📋 Cambios Implementados

### 1. Controller (`cursos.controller.ts`)

**Nuevo endpoint agregado:**

```typescript
@Get('asignados/:orientadorId')
@Roles('Orientador', 'Admin', 'P.A')
```

**Ubicación:** Entre el endpoint `stats()` y `findOne(:id)`

**Características:**

- ✅ Autenticación requerida (JWT)
- ✅ Autorización por roles: `Orientador`, `Admin`, `P.A`
- ✅ Documentación Swagger integrada
- ✅ Validación de parámetros con `ParseIntPipe`

---

### 2. Service (`cursos.service.ts`)

**Nuevo método agregado:**

```typescript
async findCursosAsignadosDocente(orientadorId: number)
```

**Lógica implementada:**

El método busca cursos activos donde el orientador cumple **al menos una** de estas condiciones:

1. **Es orientador titular del curso**

   ```typescript
   {
     id_orientador: orientadorId;
   }
   ```

2. **Está en el historial vigente**

   ```typescript
   {
     historialCurso: {
       some: {
         id_orientador: orientadorId,
         OR: [
           { fecha_fin: null },
           { fecha_fin: { gt: new Date() } }
         ]
       }
     }
   }
   ```

3. **Tiene asignaturas asignadas**
   ```typescript
   {
     asignaturas: {
       some: {
         orientadores: {
           some: {
             id_orientador: orientadorId,
             activo: true
           }
         }
       }
     }
   }
   ```

**Datos retornados:**

- Información del curso (id, nombre, sección, aula, etc.)
- Grado académico
- Lista de asignaturas
- Información del orientador titular

---

## 🧪 Pruebas

### 1. Verificar que el servidor esté corriendo

```bash
cd /Users/rodolforivas/Documents/GitHub/CAI-backend
npm run start:dev
```

**Salida esperada:**

```
[Nest] 12345  - 27/10/2025, 10:30:00   LOG [NestApplication] Nest application successfully started
```

---

### 2. Probar el endpoint con curl

#### Opción A: Con token de Orientador

```bash
# Obtener token primero
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"orientador@example.com","password":"tu_password"}' \
  | jq -r '.access_token')

# Probar el endpoint
curl -X GET \
  "http://localhost:3000/cursos/asignados/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq
```

#### Opción B: Directamente con Postman/Insomnia

**Request:**

- **Método:** `GET`
- **URL:** `http://localhost:3000/cursos/asignados/1`
- **Headers:**
  - `Authorization: Bearer <TU_TOKEN_JWT>`
  - `Content-Type: application/json`

---

### 3. Respuesta Esperada

```json
[
  {
    "id_curso": 1,
    "nombre": "Quinto Grado",
    "seccion": "A",
    "descripcion": null,
    "id_grado_academico": 1,
    "id_orientador": 1,
    "cupo": 30,
    "aula": "Aula 101",
    "anio_academico": "2025",
    "activo": true,
    "gradoAcademico": {
      "id_grado_academico": 1,
      "nombre": "Primaria"
    },
    "asignaturas": [
      {
        "id_asignatura": 1,
        "nombre": "Matemática I"
      },
      {
        "id_asignatura": 2,
        "nombre": "Lenguaje y Literatura"
      },
      {
        "id_asignatura": 3,
        "nombre": "Ciencias Naturales"
      }
    ],
    "orientador": {
      "id_orientador": 1,
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
]
```

---

### 4. Casos de Prueba

#### Caso 1: Orientador sin cursos asignados

```bash
curl "http://localhost:3000/cursos/asignados/999" \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** `[]` (array vacío)

#### Caso 2: Orientador con múltiples cursos

```bash
curl "http://localhost:3000/cursos/asignados/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** Array con todos los cursos del orientador

#### Caso 3: Sin token (error de autenticación)

```bash
curl "http://localhost:3000/cursos/asignados/1"
```

**Esperado:** `401 Unauthorized`

#### Caso 4: ID inválido

```bash
curl "http://localhost:3000/cursos/asignados/abc" \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado:** `400 Bad Request` (ParseIntPipe validation)

---

## 🔍 Verificación en Base de Datos

### Query para verificar cursos de un orientador:

```sql
-- Ver cursos donde es orientador titular
SELECT
  c.id_curso,
  c.nombre,
  c.seccion,
  c.id_orientador,
  o.nombre || ' ' || o.apellido as orientador
FROM "Curso" c
LEFT JOIN "Orientador" o ON c.id_orientador = o.id_orientador
WHERE c.id_orientador = 1 AND c.activo = true;

-- Ver cursos en historial vigente
SELECT
  hc.id_curso,
  c.nombre,
  hc.id_orientador,
  hc.fecha_asignacion,
  hc.fecha_fin
FROM "Historial_curso_orientador" hc
JOIN "Curso" c ON hc.id_curso = c.id_curso
WHERE hc.id_orientador = 1
  AND (hc.fecha_fin IS NULL OR hc.fecha_fin > NOW());

-- Ver cursos con asignaturas asignadas
SELECT DISTINCT
  c.id_curso,
  c.nombre,
  a.nombre as asignatura,
  ao.id_orientador
FROM "Curso" c
JOIN "Asignatura" a ON a.id_curso = c.id_curso
JOIN "AsignaturaOrientador" ao ON ao.id_asignatura = a.id_asignatura
WHERE ao.id_orientador = 1
  AND ao.activo = true
  AND c.activo = true;
```

---

## 📊 Verificación en Frontend

Una vez que el backend esté corriendo, el frontend debería mostrar:

### Consola del navegador:

```
🔍 Buscando cursos para orientador ID: 1
✅ Endpoint /cursos/asignados: 2 cursos encontrados
📊 Resumen: 2 cursos totales
   ✅ Con asignaturas: 2
   ⚠️  Sin asignaturas: 0
✅ 2 curso(s) cargado(s) correctamente
```

### Red (Network tab):

```
Request URL: http://localhost:3000/cursos/asignados/1
Request Method: GET
Status Code: 200 OK
Response: [array con cursos]
```

---

## 🐛 Troubleshooting

### Error: "Cannot GET /cursos/asignados/1"

**Causa:** El servidor no está corriendo o la ruta no está registrada

**Solución:**

1. Verificar que el servidor esté corriendo: `npm run start:dev`
2. Verificar que no haya errores de compilación
3. Revisar que el módulo CursosModule esté importado en AppModule

---

### Error: "Unauthorized" (401)

**Causa:** Token JWT inválido o expirado

**Solución:**

1. Obtener un nuevo token de login
2. Verificar que el header `Authorization` esté presente
3. Formato correcto: `Bearer <token>`

---

### Error: "Forbidden" (403)

**Causa:** El usuario no tiene el rol necesario

**Solución:**

1. Verificar que el usuario tenga rol `Orientador`, `Admin` o `P.A`
2. Revisar la configuración de roles en la base de datos

---

### El endpoint retorna array vacío []

**Causas posibles:**

1. El orientador no tiene cursos asignados
2. Los cursos están inactivos (`activo = false`)
3. Las asignaciones están en tabla `AsignaturaOrientador` con `activo = false`
4. El historial tiene `fecha_fin` antigua

**Solución:**

1. Ejecutar las queries SQL de verificación (arriba)
2. Verificar datos en la base de datos
3. Asignar cursos al orientador si es necesario

---

### Error de TypeScript en compilación

**Causa:** Tipos incompatibles o falta de imports

**Solución:**

1. Verificar que todos los imports estén presentes
2. Ejecutar `npm install` para asegurar dependencias
3. Reiniciar el servidor con `npm run start:dev`

---

## 📚 Documentación Swagger

Una vez que el servidor esté corriendo, acceder a:

```
http://localhost:3000/api
```

Buscar el endpoint:

- **Tag:** Cursos
- **Endpoint:** `GET /cursos/asignados/{orientadorId}`
- **Descripción:** "Obtener cursos asignados a un orientador"

**Probar directamente desde Swagger:**

1. Click en "Try it out"
2. Ingresar `orientadorId` (ej: 1)
3. Click en "Execute"
4. Ver la respuesta

---

## 🎯 Estructura del Código

### Diagrama de flujo:

```
Frontend Request
     ↓
GET /cursos/asignados/:orientadorId
     ↓
[JWT Auth Guard] → Verifica token
     ↓
[Roles Guard] → Verifica rol (Orientador/Admin/P.A)
     ↓
CursosController.findCursosAsignadosDocente()
     ↓
CursosService.findCursosAsignadosDocente()
     ↓
Prisma Query (3 condiciones OR)
     ↓
Database Query Execution
     ↓
Return cursos con includes (grado, asignaturas, orientador)
     ↓
Response JSON
```

---

## ✅ Checklist de Implementación

- [x] 1. Agregar endpoint en `cursos.controller.ts`
- [x] 2. Agregar decoradores de autenticación (`@UseGuards`)
- [x] 3. Agregar decoradores de autorización (`@Roles`)
- [x] 4. Agregar documentación Swagger (`@ApiOperation`, `@ApiOkResponse`)
- [x] 5. Agregar validación de parámetros (`ParseIntPipe`)
- [x] 6. Implementar método en `cursos.service.ts`
- [x] 7. Implementar query con Prisma (3 condiciones OR)
- [x] 8. Agregar includes necesarios (grado, asignaturas, orientador)
- [x] 9. Verificar que no haya errores TypeScript
- [x] 10. Documentar endpoint y casos de uso

---

## 🚀 Listo para Usar

El endpoint está **completamente implementado** y listo para ser usado por el frontend.

**URL del endpoint:**

```
GET /cursos/asignados/:orientadorId
```

**Headers requeridos:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta:** Array de cursos con toda la información necesaria

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisar la sección de Troubleshooting arriba
2. Verificar logs del servidor: `npm run start:dev`
3. Verificar datos en base de datos con las queries SQL
4. Revisar la consola del navegador (para problemas del frontend)

---

**Última actualización:** 27 de octubre de 2025  
**Estado:** ✅ Implementado y Documentado  
**Versión:** 1.0.0
