# Guía: Soft Delete de Infracciones del Catálogo

## ✅ Estado Actual: Ya Implementado en Backend

El sistema de soft delete para infracciones del catálogo **ya está completamente implementado** y funciona correctamente.

## 🔧 Cómo Funciona

### 1. **Borrado Suave (Soft Delete)**

Cuando un administrador "elimina" una infracción del catálogo:

```typescript
DELETE /conducta/catalogo/:id
```

**Lo que sucede en el backend:**

- ❌ NO se elimina físicamente el registro
- ✅ Se marca como `activo: false`
- ✅ Los registros históricos de alumnos se mantienen intactos

```typescript
// Código actual en conductaAsistencia.service.ts
async removeCatalogo(id_infraccion: number) {
  await this.findOneCatalogo(id_infraccion);
  return this.prisma.infraccionCatalogo.update({
    where: { id_infraccion },
    data: { activo: false },  // Solo marca como inactivo
  });
}
```

### 2. **Listado de Catálogo (Solo Activos)**

```typescript
GET / conducta / catalogo;
```

**Retorna solo infracciones activas:**

```typescript
async findAllCatalogo() {
  return this.prisma.infraccionCatalogo.findMany({
    where: { activo: true },  // Solo infracciones activas
    orderBy: [{ categoria: 'asc' }, { articulo: 'asc' }],
  });
}
```

### 3. **Registros Históricos Se Mantienen**

Los registros de conducta de alumnos mantienen toda la información:

```typescript
GET /conducta/alumno/:id_alumno
// O
GET /conducta/alumnos-con-infracciones
```

**Incluyen infracciones inactivas en el historial:**

```typescript
async findByStudent(id_alumno: number) {
  return this.prisma.conducta.findMany({
    where: { id_alumno },
    include: {
      infraccion: true,  // ✅ Incluye la infracción aunque esté inactiva
      orientador: { select: { nombre: true, apellido: true } },
      asignatura: { select: { nombre: true } },
    },
    orderBy: { fecha: 'desc' },
  });
}
```

## 📋 Estructura de Datos

### Tabla InfraccionCatalogo

```prisma
model InfraccionCatalogo {
  id_infraccion Int                 @id
  categoria     CategoriaInfraccion // MENOS_GRAVE, GRAVE, MUY_GRAVE
  articulo      String              @unique
  descripcion   String
  puntos        Float
  activo        Boolean             @default(true) // ✅ Campo clave
  instancias    Conducta[]          // Relación a registros de alumnos
}
```

### Tabla Conducta (Registros de Alumnos)

```prisma
model Conducta {
  id_conducta            Int      @id
  id_alumno              Int
  fecha                  DateTime
  id_infraccion_catalogo Int      // ✅ Mantiene la relación
  id_orientador          Int?
  id_asignatura          Int?
  observacion            String?
  anio_academico         String?
  trimestre              Int?

  infraccion             InfraccionCatalogo @relation(...)
}
```

## 🎨 Implementación en Frontend

### Escenario 1: Formulario de Nueva Infracción

**Endpoint:** `GET /conducta/catalogo`

```javascript
// Solo muestra infracciones activas para seleccionar
async function cargarInfraccionesDisponibles() {
  const response = await fetch('/conducta/catalogo', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const infracciones = await response.json();

  // infracciones solo contiene aquellas con activo: true
  const select = document.getElementById('infraccion-select');
  infracciones.forEach((inf) => {
    const option = document.createElement('option');
    option.value = inf.id_infraccion;
    option.textContent = `${inf.articulo} - ${inf.descripcion}`;
    select.appendChild(option);
  });
}
```

### Escenario 2: Historial de Alumno

**Endpoint:** `GET /conducta/alumno/:id_alumno`

```javascript
// Muestra TODAS las infracciones del alumno, incluso inactivas
async function cargarHistorialAlumno(idAlumno) {
  const response = await fetch(`/conducta/alumno/${idAlumno}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const infracciones = await response.json();

  infracciones.forEach((reg) => {
    const item = document.createElement('div');

    // Verificar si la infracción está inactiva
    const badge = reg.infraccion.activo
      ? ''
      : '<span class="badge badge-warning">⚠️ Infracción Eliminada</span>';

    item.innerHTML = `
      <div class="infraccion-item">
        <strong>${reg.infraccion.articulo}</strong> ${badge}
        <p>${reg.infraccion.descripcion}</p>
        <small>Fecha: ${formatDate(reg.fecha)}</small>
        <small>Puntos: ${reg.infraccion.puntos}</small>
      </div>
    `;

    container.appendChild(item);
  });
}
```

### Escenario 3: Administración del Catálogo

```javascript
// Mostrar con indicador visual de estado
async function cargarCatalogoParaAdmin() {
  // Para ver TODAS las infracciones (activas e inactivas)
  // El backend actual NO tiene este endpoint, solo retorna activas

  // Opción A: Usar el endpoint actual (solo activas)
  const activas = await fetch('/conducta/catalogo');

  // Opción B: Crear nuevo endpoint para admin que retorne todas
  // GET /conducta/catalogo/all (incluir inactivas)
}
```

## 🚨 Consideraciones Importantes

### ✅ LO QUE YA FUNCIONA:

1. **Borrado Suave:** Las infracciones se marcan como inactivas, no se eliminan
2. **Datos Históricos:** Los registros de alumnos mantienen toda la información
3. **Listado Filtrado:** Solo se muestran infracciones activas para crear nuevas
4. **Integridad Referencial:** No se rompen las relaciones en la BD

### ⚠️ LO QUE EL FRONTEND DEBE MANEJAR:

1. **Mostrar Badge en Historial:** Indicar visualmente cuando una infracción está inactiva
2. **No Permitir Editar a Inactivas:** Deshabilitar edición de infracciones marcadas como eliminadas
3. **Estadísticas:** Decidir si incluir o no infracciones inactivas en totales
4. **Filtros:** Permitir al admin ver infracciones inactivas si lo necesita

## 🔄 Flujo Completo: Eliminar Infracción

```
1. Admin elimina infracción "5.1.3 literal b"
   ↓
2. Backend: UPDATE infracciones_catalogo SET activo = false WHERE id = X
   ↓
3. GET /conducta/catalogo → Ya no aparece en la lista
   ↓
4. Nuevos registros: No pueden usar esa infracción
   ↓
5. Registros antiguos: Siguen mostrando toda la información
   ↓
6. Frontend: Muestra badge "⚠️ Infracción Eliminada" en historiales
```

## 📊 Ejemplo de Respuesta con Infracción Inactiva

```json
{
  "id_conducta": 123,
  "id_alumno": 45,
  "fecha": "2025-01-15T00:00:00.000Z",
  "observacion": "Se portó mal en clase de matemáticas",
  "anio_academico": "2025",
  "trimestre": 1,
  "infraccion": {
    "id_infraccion": 10,
    "categoria": "GRAVE",
    "articulo": "5.1.3 literal b",
    "descripcion": "Faltar al respeto al docente",
    "puntos": 2,
    "activo": false // ⚠️ Frontend debe detectar esto
  },
  "orientador": {
    "id_orientador": 5,
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "asignatura": {
    "id_asignatura": 8,
    "nombre": "Matemáticas"
  }
}
```

## 🎯 Recomendaciones para el Frontend

### 1. **Componente de Badge de Estado**

```javascript
function getInfraccionBadge(infraccion) {
  if (!infraccion.activo) {
    return `
      <span class="badge badge-warning" title="Esta infracción ya no está disponible en el catálogo">
        ⚠️ Eliminada del Catálogo
      </span>
    `;
  }
  return '';
}
```

### 2. **Estilos CSS**

```css
.infraccion-item.inactiva {
  opacity: 0.7;
  border-left: 3px solid #ffc107;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}
```

### 3. **Confirmación al Eliminar**

```javascript
async function eliminarInfraccion(idInfraccion) {
  const confirmacion = confirm(
    '¿Está seguro de eliminar esta infracción del catálogo?\n\n' +
      'Nota: Los registros históricos de alumnos se mantendrán intactos, ' +
      'pero esta infracción ya no estará disponible para nuevos registros.',
  );

  if (!confirmacion) return;

  await fetch(`/conducta/catalogo/${idInfraccion}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  alert('Infracción eliminada. Los historiales antiguos se mantienen.');
  cargarCatalogo(); // Recargar lista
}
```

## 🆕 Endpoint Adicional Sugerido (Opcional)

Si el admin necesita ver infracciones inactivas en la administración:

```typescript
// En conductaAsistencia.controller.ts
@Get('catalogo/all')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin')
findAllCatalogoIncludingInactive() {
  return this.conductaService.findAllCatalogoIncludingInactive();
}

// En conductaAsistencia.service.ts
async findAllCatalogoIncludingInactive() {
  return this.prisma.infraccionCatalogo.findMany({
    // Sin filtro de activo, retorna TODAS
    orderBy: [{ activo: 'desc' }, { categoria: 'asc' }, { articulo: 'asc' }],
  });
}
```

## ✅ Conclusión

**El backend ya está correctamente implementado** con soft delete. Solo necesitas que el frontend:

1. ✅ Use `GET /conducta/catalogo` para formularios (solo activas)
2. ✅ Detecte `infraccion.activo === false` en historiales
3. ✅ Muestre badge de advertencia cuando sea inactiva
4. ✅ Mantenga toda la información histórica visible
5. ✅ Confirme al admin que los datos históricos se mantienen

No se requieren cambios en el backend. Todo está funcionando como debe ser. 🎉
