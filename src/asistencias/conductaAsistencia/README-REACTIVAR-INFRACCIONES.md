# Funcionalidad: Mostrar y Reactivar Infracciones Desactivadas

## 🎯 Funcionalidad Completa Implementada

### Backend - Endpoints Disponibles:

1. **GET `/conducta/catalogo`** - Infracciones activas (por defecto)
2. **GET `/conducta/catalogo/all`** - TODAS las infracciones (activas + inactivas) ⭐ NUEVO
3. **DELETE `/conducta/catalogo/:id`** - Desactivar infracción (soft delete)
4. **PATCH `/conducta/catalogo/:id/restore`** - Reactivar infracción ⭐ NUEVO

---

## 📝 Implementación Frontend

### 1. Actualizar `asistenciaService.ts`

Agregar los nuevos métodos al servicio:

```typescript
// Servicio de conducta - ACTUALIZADO
export const conductaService = {
  // ... métodos existentes ...

  getAllCatalogo: async (): Promise<InfraccionCatalogoResponse[]> => {
    const response =
      await api.get<InfraccionCatalogoResponse[]>('/conducta/catalogo');
    return response.data;
  },

  // 🆕 NUEVO: Obtener TODAS las infracciones (activas + inactivas)
  getAllCatalogoIncludingInactive: async (): Promise<
    InfraccionCatalogoResponse[]
  > => {
    const response = await api.get<InfraccionCatalogoResponse[]>(
      '/conducta/catalogo/all',
    );
    return response.data;
  },

  // ... otros métodos ...

  deleteCatalogo: async (id: string): Promise<InfraccionCatalogoResponse> => {
    const response = await api.delete<InfraccionCatalogoResponse>(
      `/conducta/catalogo/${id}`,
    );
    return response.data;
  },

  // 🆕 NUEVO: Reactivar infracción desactivada
  restoreCatalogo: async (id: string): Promise<InfraccionCatalogoResponse> => {
    const response = await api.patch<InfraccionCatalogoResponse>(
      `/conducta/catalogo/${id}/restore`,
    );
    return response.data;
  },

  // ... resto del código ...
};
```

---

### 2. Actualizar `ConductaModule.tsx`

#### A. Modificar la función `cargarCatalogoInfracciones`:

```typescript
const cargarCatalogoInfracciones = async () => {
  setIsLoading(true);
  try {
    // ✅ Usar endpoint correcto según el toggle
    const catalogo = mostrarDesactivadas
      ? await conductaService.getAllCatalogoIncludingInactive() // TODAS
      : await conductaService.getAllCatalogo(); // Solo activas

    setCatalogoInfracciones(catalogo);
  } catch (e) {
    toast.error('Error al cargar el catálogo de infracciones');
  } finally {
    setIsLoading(false);
  }
};
```

#### B. Agregar useEffect para recargar al cambiar el toggle:

```typescript
// Agregar después de los otros useEffect:
useEffect(() => {
  // Recargar catálogo cuando cambie el toggle de mostrar desactivadas
  cargarCatalogoInfracciones();
}, [mostrarDesactivadas]);
```

#### C. Agregar función para reactivar infracciones:

```typescript
const handleReactivarInfraccion = async (id: string) => {
  setIsLoading(true);
  try {
    await conductaService.restoreCatalogo(id);
    toast.success(
      '✅ Infracción reactivada correctamente. Ya está disponible para usar.',
      { duration: 5000 },
    );
    await cargarCatalogoInfracciones();
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message || 'Error al reactivar la infracción.';
    toast.error(errorMsg);
  } finally {
    setIsLoading(false);
  }
};
```

#### D. Actualizar el JSX de la lista de infracciones:

```tsx
<div className="space-y-4">
  {infraccionesConBusqueda.map((infraccion) => (
    <div
      key={infraccion.id_infraccion}
      className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
        infraccion.activo === false
          ? 'bg-gray-50 border-gray-300 opacity-75'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Badge de categoría */}
            <Badge className={`${getBadgeColor(infraccion.categoria)} border`}>
              {getCategoriaIcon(infraccion.categoria)}
              <span className="ml-1">
                {getCategoriaLabel(infraccion.categoria)}
              </span>
            </Badge>

            {/* Badge de estado inactivo */}
            {infraccion.activo === false && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-600 border-gray-300"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Desactivada
              </Badge>
            )}

            {/* Artículo */}
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900">
                {infraccion.articulo}
              </span>
            </div>

            {/* Puntos */}
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-200">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs font-semibold">
                {infraccion.puntos}{' '}
                {infraccion.puntos === 1 ? 'punto' : 'puntos'}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-sm text-gray-600 leading-relaxed pl-1">
            {infraccion.descripcion}
          </p>
        </div>

        {/* Botones de acción */}
        {!readOnly && (
          <div className="flex gap-2">
            {infraccion.activo === false ? (
              // Botón de reactivar para infracciones desactivadas
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleReactivarInfraccion(infraccion.id_infraccion)
                }
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reactivar
              </Button>
            ) : (
              // Botones normales para infracciones activas
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAbrirEditarInfraccion(infraccion)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInfraccionEliminar(infraccion.id_infraccion);
                    setModalEliminar(true);
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  ))}
</div>
```

#### E. Agregar imports necesarios:

```typescript
import {
  // ... otros imports existentes ...
  RotateCcw,
  EyeOff,
} from 'lucide-react';
```

---

## 🎨 Flujo de Usuario

### Escenario 1: Desactivar Infracción

```
1. Usuario hace clic en botón "Eliminar" (🗑️)
   ↓
2. Aparece modal de confirmación explicando el soft delete
   ↓
3. Usuario confirma
   ↓
4. Backend marca activo: false
   ↓
5. Toast de éxito: "✅ Infracción eliminada. Registros históricos intactos."
   ↓
6. Si toggle está OFF → La infracción desaparece de la lista
   Si toggle está ON → La infracción se marca como desactivada
```

### Escenario 2: Ver Infracciones Desactivadas

```
1. Usuario activa el toggle "Mostrar Desactivadas"
   ↓
2. Frontend llama a GET /conducta/catalogo/all
   ↓
3. Se cargan TODAS las infracciones (activas + inactivas)
   ↓
4. Las inactivas aparecen con:
   - Fondo gris claro
   - Badge "Desactivada"
   - Botón "Reactivar" en lugar de "Editar/Eliminar"
```

### Escenario 3: Reactivar Infracción

```
1. Usuario hace clic en botón "Reactivar" (🔄)
   ↓
2. Backend marca activo: true
   ↓
3. Toast de éxito: "✅ Infracción reactivada correctamente."
   ↓
4. La infracción vuelve a aparecer como activa
   ↓
5. Vuelve a estar disponible para crear nuevos registros
```

---

## 📊 Ejemplo de Datos

### Respuesta de GET `/conducta/catalogo/all`:

```json
[
  {
    "id_infraccion": "1",
    "categoria": "GRAVE",
    "articulo": "Art. 5.1.3 literal b",
    "descripcion": "Faltar al respeto al docente",
    "puntos": 2,
    "activo": true,
    "creadoEn": "2025-01-15T00:00:00.000Z"
  },
  {
    "id_infraccion": "2",
    "categoria": "MENOS_GRAVE",
    "articulo": "Art. 4.2.1",
    "descripcion": "Llegar tarde sin justificación",
    "puntos": 1,
    "activo": false, // ⚠️ Desactivada
    "creadoEn": "2025-01-10T00:00:00.000Z"
  }
]
```

---

## 🔐 Seguridad y Permisos

### Endpoint: GET `/conducta/catalogo`

- **Público**: Cualquiera puede ver infracciones activas
- **Uso**: Formularios para crear nuevos registros de conducta

### Endpoint: GET `/conducta/catalogo/all`

- **Requiere**: JWT + Rol Admin o P.A
- **Uso**: Vista de administración del catálogo

### Endpoint: DELETE `/conducta/catalogo/:id`

- **Requiere**: JWT + Rol Admin o P.A
- **Acción**: Marca `activo: false` (soft delete)

### Endpoint: PATCH `/conducta/catalogo/:id/restore`

- **Requiere**: JWT + Rol Admin
- **Acción**: Marca `activo: true` (reactivación)
- **Nota**: Solo Admin puede reactivar (más restrictivo que eliminar)

---

## ✅ Lista de Verificación

### Backend (Ya implementado):

- [x] Endpoint GET `/conducta/catalogo` - Solo activas
- [x] Endpoint GET `/conducta/catalogo/all` - Todas
- [x] Endpoint DELETE `/conducta/catalogo/:id` - Desactivar
- [x] Endpoint PATCH `/conducta/catalogo/:id/restore` - Reactivar
- [x] Soft delete preserva datos históricos
- [x] Permisos configurados correctamente

### Frontend (Por implementar):

- [ ] Agregar método `getAllCatalogoIncludingInactive()` en service
- [ ] Agregar método `restoreCatalogo()` en service
- [ ] Modificar `cargarCatalogoInfracciones()` para usar endpoint correcto
- [ ] Agregar useEffect para recargar al cambiar toggle
- [ ] Agregar función `handleReactivarInfraccion()`
- [ ] Actualizar JSX para mostrar infracciones desactivadas
- [ ] Agregar botón "Reactivar" para infracciones desactivadas
- [ ] Agregar estilos diferenciados para infracciones inactivas
- [ ] Agregar imports de iconos (`RotateCcw`, `EyeOff`)

---

## 🚀 Pruebas Recomendadas

1. **Desactivar una infracción**
   - Verificar que desaparece si toggle está OFF
   - Verificar que se marca como desactivada si toggle está ON
   - Verificar que contador "Desactivadas" aumenta

2. **Ver infracciones desactivadas**
   - Activar toggle "Mostrar Desactivadas"
   - Verificar que aparecen con badge "Desactivada"
   - Verificar que tienen botón "Reactivar"
   - Verificar que NO tienen botones "Editar" o "Eliminar"

3. **Reactivar una infracción**
   - Hacer clic en "Reactivar"
   - Verificar toast de éxito
   - Verificar que vuelve a estado activo
   - Verificar que aparece en listado normal
   - Verificar que contador "Desactivadas" disminuye

4. **Crear nuevo registro con infracción reactivada**
   - Verificar que aparece en el select de infracciones
   - Crear un registro nuevo
   - Verificar que se guarda correctamente

---

## 🎯 Resultado Final

Después de implementar todos los cambios, el administrador podrá:

1. ✅ Ver solo infracciones activas (por defecto)
2. ✅ Activar un toggle para ver TODAS las infracciones
3. ✅ Ver infracciones desactivadas con indicador visual
4. ✅ Reactivar infracciones con un clic
5. ✅ Los contadores mostrarán números correctos
6. ✅ Los datos históricos siempre se preservan
7. ✅ La UX es clara y segura

¡Todo listo para una gestión completa del catálogo de infracciones! 🎉
