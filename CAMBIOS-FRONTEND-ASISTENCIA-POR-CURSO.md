# 🔄 Cambios en Frontend - Asistencia por Curso

## 📅 Fecha: 31 de Octubre de 2025

---

## 🎯 Resumen de Cambios

El backend ahora registra asistencia **POR CURSO** en lugar de por asignatura. Esto significa:

- ✅ **Antes**: Un alumno tenía múltiples registros de asistencia por día (uno por cada asignatura)
- ✅ **Ahora**: Un alumno tiene UN SOLO registro de asistencia por día (por curso)

---

## 📝 Cambios Realizados en Frontend

### 1. **asistenciaService.ts** - Interfaces Actualizadas

#### ✅ `CreateAsistenciaDto` - id_asignatura ahora opcional

```typescript
export interface CreateAsistenciaDto {
  id_alumno: number;
  id_asignatura?: number; // ✅ OPCIONAL - Ya no es necesario
  id_orientador: number;
  fecha: string;
  estado: EstadoAsistencia;
  anio_academico: string;
  trimestre: number;
  observacion?: string | null;
}
```

#### ✅ `AsistenciaConRelaciones` - asignatura ahora opcional

```typescript
export interface AsistenciaConRelaciones extends AsistenciaResponse {
  alumno: {
    nombre: string;
    apellido: string;
  };
  asignatura?: {
    // ✅ OPCIONAL
    nombre: string;
  } | null;
  orientador: {
    nombre: string;
    apellido: string;
  };
}
```

#### ✅ `HistorialAsistenciaResponse` - id_asignatura ahora opcional

```typescript
export interface HistorialAsistenciaResponse {
  id_historial: number;
  id_asistencia: number | null;
  id_alumno: number;
  id_asignatura?: number | null; // ✅ OPCIONAL
  fecha: string;
  accion: AccionAsistencia;
  // ... resto de campos
}
```

---

### 2. **AsistenciaModuleNew.tsx** - Lógica de Guardado Actualizada

#### ✅ Remover validación de asignatura

**ANTES:**

```typescript
if (!cursoActual?.asignatura?.id_asignatura) {
  toast.error('El curso seleccionado no tiene asignatura asignada');
  return;
}
```

**AHORA:**

```typescript
// ✅ Ya no validamos asignatura
if (!cursoActual) {
  toast.error('El curso seleccionado no es válido');
  return;
}
```

#### ✅ No enviar id_asignatura al backend

**ANTES:**

```typescript
const registrosNuevos = Object.entries(asistenciaActual)
  .filter(([alumnoId]) => !asistenciasGuardadas[alumnoId])
  .map(([alumnoId, datos]) => ({
    id_alumno: parseInt(alumnoId),
    id_asignatura: cursoActual.asignatura!.id_asignatura, // ❌ YA NO
    id_orientador: parseInt(user.id),
    fecha: fechaSeleccionada,
    estado: datos.estado,
    // ...
  }));
```

**AHORA:**

```typescript
const registrosNuevos = Object.entries(asistenciaActual)
  .filter(([alumnoId]) => !asistenciasGuardadas[alumnoId])
  .map(([alumnoId, datos]) => ({
    id_alumno: parseInt(alumnoId),
    // ✅ id_asignatura se omite completamente
    id_orientador: parseInt(user.id),
    fecha: fechaSeleccionada,
    estado: datos.estado,
    // ...
  }));
```

---

## 🔍 Cambios en la UI (Opcionales pero Recomendados)

### 1. **Actualizar Mensajes al Usuario**

```typescript
// En lugar de:
'Asistencia registrada para Matemáticas';

// Ahora:
'Asistencia registrada para el curso';
```

### 2. **Actualizar Visualización de Tablas**

Si muestras el nombre de la asignatura en alguna tabla, asegúrate de manejar el caso cuando sea `null`:

```typescript
// Ejemplo:
<TableCell>
  {asistencia.asignatura?.nombre || 'Asistencia por curso'}
</TableCell>
```

### 3. **Actualizar Tooltips/Ayudas**

```typescript
// Antiguo tooltip:
'Registra la asistencia por asignatura';

// Nuevo tooltip:
'Registra la asistencia diaria del curso (una vez por día)';
```

---

## ⚠️ Consideraciones Importantes

### 1. **Única Restricción: Alumno + Fecha**

Ahora el backend garantiza que:

- ✅ Un alumno solo puede tener **UN registro de asistencia por día**
- ✅ No importa cuántas asignaturas tenga ese día
- ✅ La asistencia se toma a nivel de CURSO, no de asignatura

### 2. **Compatibilidad con Datos Antiguos**

Los registros antiguos que tienen `id_asignatura` se mantienen en la base de datos:

- ✅ El backend puede leerlos sin problemas
- ✅ El frontend debe manejar ambos casos (con y sin asignatura)

### 3. **Búsqueda y Filtros**

Los filtros de búsqueda ya funcionan correctamente:

- ✅ `buscarConFiltros({ cursoId, fecha })` - Funciona sin cambios
- ✅ Backend busca por curso automáticamente

---

## 🧪 Testing Recomendado

### 1. **Probar Registro de Asistencia**

```typescript
// Test 1: Registrar asistencia sin id_asignatura
const registro = {
  id_alumno: 1,
  // NO enviar id_asignatura
  id_orientador: 1,
  fecha: '2025-10-31',
  estado: 'P',
};
```

### 2. **Probar Edición de Asistencia**

```typescript
// Test 2: Editar asistencia existente
await asistenciaService.update(asistenciaId, {
  estado: 'E',
  observacion: 'Justificado',
});
```

### 3. **Probar Búsqueda por Curso**

```typescript
// Test 3: Buscar asistencias de un curso
const asistencias = await asistenciaService.buscarConFiltros({
  cursoId: 1,
  fecha: '2025-10-31',
});
```

### 4. **Probar Doble Registro (Debe Fallar)**

```typescript
// Test 4: Intentar registrar dos veces el mismo alumno en el mismo día
// El backend debe actualizar el registro existente (upsert)
```

---

## 📊 Ejemplo de Uso Actualizado

### Registrar Asistencia (Nuevo Formato)

```typescript
const registrarAsistencia = async () => {
  const registros = alumnosDelCurso.map((alumno) => ({
    id_alumno: alumno.id_alumno,
    // ✅ NO incluir id_asignatura
    id_orientador: orientadorId,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'P',
    anio_academico: '2025',
    trimestre: 3,
    observacion: null,
  }));

  await asistenciaService.createBulk({ registros });
};
```

### Mostrar Asistencias (Manejar Asignatura Opcional)

```typescript
const mostrarAsistencia = (asistencia: AsistenciaConRelaciones) => {
  return (
    <div>
      <p>Alumno: {asistencia.alumno.nombre}</p>
      <p>Estado: {asistencia.estado}</p>
      {/* ✅ Manejar asignatura opcional */}
      <p>Asignatura: {asistencia.asignatura?.nombre || 'Por curso'}</p>
    </div>
  );
};
```

---

## ✅ Checklist de Verificación

- [x] **asistenciaService.ts**
  - [x] CreateAsistenciaDto.id_asignatura opcional
  - [x] AsistenciaConRelaciones.asignatura opcional
  - [x] HistorialAsistenciaResponse.id_asignatura opcional

- [x] **AsistenciaModuleNew.tsx**
  - [x] Remover validación de asignatura obligatoria
  - [x] No enviar id_asignatura al backend
  - [x] Actualizar mensajes de error

- [ ] **Testing** (Recomendado)
  - [ ] Probar registro sin asignatura
  - [ ] Probar edición de asistencia
  - [ ] Probar búsqueda por curso
  - [ ] Verificar que no se puedan duplicar registros

- [ ] **UI/UX** (Opcional)
  - [ ] Actualizar tooltips y mensajes
  - [ ] Manejar visualización de asignatura=null
  - [ ] Actualizar documentación de usuario

---

## 🚀 Próximos Pasos

1. ✅ Actualizar interfaces de TypeScript
2. ✅ Modificar lógica de guardado
3. ⏳ Probar en desarrollo
4. ⏳ Verificar que no haya errores de compilación
5. ⏳ Realizar pruebas E2E
6. ⏳ Desplegar a producción

---

## 📞 Soporte

Si encuentras algún problema con estos cambios:

1. Verifica que el backend esté actualizado
2. Revisa la consola del navegador por errores
3. Verifica que los tipos de TypeScript estén correctos
4. Asegúrate de que no estés enviando `id_asignatura` al backend

---

**Fecha de Actualización**: 31 de Octubre de 2025  
**Versión del Backend**: Compatible con asistencia por curso  
**Cambio Principal**: Asistencia ahora es **POR CURSO** no por asignatura
