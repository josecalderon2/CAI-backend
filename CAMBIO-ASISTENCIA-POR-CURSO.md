# 🎯 Cambio: Asistencia por Curso (en lugar de por Asignatura)

## 📋 Resumen Ejecutivo

Se modificó exitosamente el sistema de asistencia del backend CAI para cambiar de **asistencia por asignatura** a **asistencia por curso**.

### Cambio Principal:

- **ANTES**: Un alumno podía tener múltiples registros de asistencia por día (uno por cada asignatura)
- **AHORA**: Un alumno tiene UN SOLO registro de asistencia por día (por curso completo)

---

## 🔧 Archivos Modificados

### 1. **prisma/schema.prisma**

**Cambios en el modelo `Asistencia`:**

```prisma
model Asistencia {
  id_asignatura  Int?     // ✅ AHORA ES OPCIONAL (antes era requerido)
  asignatura     Asignatura? @relation(...) // ✅ Relación opcional

  // ✅ CAMBIO EN CONSTRAINT ÚNICA
  @@unique([id_alumno, fecha])  // Antes: [id_alumno, id_asignatura, fecha]
  @@index([id_asignatura])      // Nuevo índice para consultas opcionales
}
```

**Cambios en el modelo `AsistenciaHistorial`:**

```prisma
model AsistenciaHistorial {
  id_asignatura  Int?  // ✅ AHORA ES OPCIONAL

  @@index([id_alumno, fecha])  // Antes: [id_alumno, id_asignatura, fecha]
}
```

**Migración aplicada:** `20251031161357_asistencia_por_curso`

---

### 2. **src/asistencias/dto/create-asistencia.dto.ts**

```typescript
export class CreateAsistenciaDto {
  @IsInt()
  @IsPositive()
  @IsOptional() // ✅ NUEVO: Ahora es opcional
  id_asignatura?: number; // ✅ Cambió de 'number' a 'number?'

  // ... resto de campos sin cambios
}
```

---

### 3. **src/asistencias/asistencia.service.ts**

#### Método `createBulk()` - Actualizado

```typescript
async createBulk(dto: BulkAsistenciaDto) {
  const upsertOperations = registros.map((registro) => {
    // ✅ NUEVA CLAVE ÚNICA: solo alumno + fecha
    const where = {
      id_alumno_fecha: {  // Antes: id_alumno_id_asignatura_fecha
        id_alumno: registro.id_alumno,
        fecha: registro.fecha,
      },
    };

    // ✅ id_asignatura ahora es condicional
    const createData: any = {
      id_alumno: registro.id_alumno,
      fecha: registro.fecha,
      estado: registro.estado,
      observacion: registro.observacion,
      id_orientador: registro.id_orientador,
    };

    // Solo agregar si viene en el request
    if (registro.id_asignatura !== undefined) {
      createData.id_asignatura = registro.id_asignatura;
    }

    return this.prisma.asistencia.upsert({
      where,
      update: updateData,
      create: createData,
    });
  });

  return this.prisma.$transaction(upsertOperations);
}
```

#### Método `create()` - Actualizado

```typescript
async create(dto: CreateAsistenciaDto) {
  const data: any = {
    id_alumno: dto.id_alumno,
    fecha: dto.fecha,
    estado: dto.estado,
    observacion: dto.observacion,
    id_orientador: dto.id_orientador,
  };

  // ✅ Solo agregar id_asignatura si viene en el request
  if (dto.id_asignatura !== undefined) {
    data.id_asignatura = dto.id_asignatura;
  }

  return this.prisma.asistencia.create({ data });
}
```

**Nota:** Los demás métodos (`findAll`, `findOne`, `findByStudent`, `update`, etc.) siguen funcionando correctamente ya que solo leen datos y soportan el campo opcional.

---

### 4. **prisma/seed/seeds/10-asistencias-conductas-t3.seed.ts**

**ANTES (asistencia por asignatura):**

```typescript
for (const asignatura of asignaturasC1) {
  // ❌ Loop por asignatura
  for (const alumno of alumnosC1) {
    // Crear asistencia con id_asignatura
  }
}
```

**AHORA (asistencia por curso):**

```typescript
// ✅ YA NO hay loop por asignatura
for (const alumno of alumnosC1) {
  const existe = await prisma.asistencia.findUnique({
    where: {
      id_alumno_fecha: {
        // ✅ Nueva clave única
        id_alumno: alumno.id_alumno,
        fecha: fecha,
      },
    },
  });

  if (!existe) {
    await prisma.asistencia.create({
      data: {
        id_alumno: alumno.id_alumno,
        // ✅ Ya NO se envía id_asignatura
        id_orientador: orientador.id_orientador,
        fecha: fecha,
        estado: estado,
        observacion: observacion,
        anio_academico: anio,
        trimestre: trimestre,
      },
    });
  }
}
```

---

## 🎯 Impacto en la Lógica de Negocio

### ✅ Ventajas del Cambio

1. **Simplificación**: Un alumno tiene una sola asistencia por día
2. **Consistencia**: No puede estar "presente en matemáticas pero ausente en español" el mismo día
3. **Performance**: Menos registros en la base de datos
4. **UX Mejorada**: El orientador toma asistencia del curso completo, no por materia

### ⚠️ Consideraciones

1. **Retrocompatibilidad**: El campo `id_asignatura` se mantiene como opcional para:
   - No romper registros antiguos que sí tienen asignatura
   - Permitir consultas históricas
   - Facilitar posibles reportes futuros

2. **Migración de Datos Antiguos**: Los registros antiguos que tienen `id_asignatura` se mantienen intactos

---

## 🔍 Verificación de Cambios

### ✅ Checklist de Validación

- [x] **Schema actualizado** - `id_asignatura` ahora es `Int?`
- [x] **Migración aplicada** - `20251031161357_asistencia_por_curso`
- [x] **Prisma Client regenerado** - v6.17.1
- [x] **DTOs actualizados** - `id_asignatura` es opcional
- [x] **Service actualizado** - Métodos `create` y `createBulk` manejan campo opcional
- [x] **Seed actualizado** - Ya no crea asistencias por asignatura
- [x] **Compilación exitosa** - Sin errores de TypeScript
- [x] **Unique constraint actualizado** - De `[alumno, asignatura, fecha]` a `[alumno, fecha]`

---

## 🚀 Próximos Pasos Recomendados

### 1. **Probar los Endpoints** ✅ PRIORITARIO

Probar crear asistencia sin `id_asignatura`:

```bash
# POST /asistencia/bulk
{
  "registros": [
    {
      "id_alumno": 1,
      "fecha": "2025-10-31T12:00:00Z",
      "estado": "P",
      "id_orientador": 1
      // ✅ Sin id_asignatura
    }
  ]
}
```

### 2. **Actualizar Frontend** ✅ PRIORITARIO

- Remover selector de asignatura del formulario de asistencia
- Actualizar llamadas API para NO enviar `id_asignatura`
- Actualizar UI para mostrar una sola asistencia por día

### 3. **Probar Constraint Única**

Verificar que NO se puede crear dos asistencias el mismo día para el mismo alumno:

```sql
-- Esto debería fallar:
INSERT INTO "Asistencia" (id_alumno, fecha, estado, id_orientador)
VALUES (1, '2025-10-31', 'P', 1);

INSERT INTO "Asistencia" (id_alumno, fecha, estado, id_orientador)
VALUES (1, '2025-10-31', 'A', 1);  -- ❌ ERROR: Duplicate key
```

### 4. **Regenerar Seed Data** (Opcional)

Si quieres datos limpios sin asignaturas:

```bash
npx prisma migrate reset  # ⚠️ Borra todos los datos
npm run seed
```

### 5. **Actualizar Documentación** (Opcional)

- Actualizar ejemplos en `FRONTEND-HISTORIAL-ASISTENCIA.md`
- Actualizar `EJEMPLOS-RESPUESTAS-HISTORIAL.md`
- Actualizar README si menciona asistencias

---

## 📊 Comparación: Antes vs Ahora

### Ejemplo Práctico

**ANTES (asistencia por asignatura):**

| id  | id_alumno | id_asignatura   | fecha      | estado |
| --- | --------- | --------------- | ---------- | ------ |
| 1   | 100       | 1 (Matemáticas) | 2025-10-31 | P      |
| 2   | 100       | 2 (Español)     | 2025-10-31 | P      |
| 3   | 100       | 3 (Ciencias)    | 2025-10-31 | P      |
| 4   | 100       | 4 (Sociales)    | 2025-10-31 | P      |

**AHORA (asistencia por curso):**

| id  | id_alumno | id_asignatura | fecha      | estado |
| --- | --------- | ------------- | ---------- | ------ |
| 1   | 100       | NULL          | 2025-10-31 | P      |

---

## 🛠️ Comandos Ejecutados

```bash
# 1. Modificar schema.prisma (manual)
# 2. Crear y aplicar migración
npx prisma migrate dev --name asistencia_por_curso

# 3. Regenerar Prisma Client
npx prisma generate

# 4. Compilar proyecto
npm run build
```

---

## ✅ Estado Final

**COMPLETADO** ✅

- ✅ Schema modificado y migrado
- ✅ DTOs actualizados
- ✅ Service actualizado
- ✅ Seed actualizado
- ✅ Compilación exitosa (0 errores)
- ⏳ **PENDIENTE**: Probar endpoints
- ⏳ **PENDIENTE**: Actualizar frontend

---

**Fecha de Implementación:** 31 de octubre de 2025  
**Migración:** `20251031161357_asistencia_por_curso`  
**Versión Prisma:** 6.17.1  
**Estado:** ✅ **LISTO PARA PRUEBAS**
