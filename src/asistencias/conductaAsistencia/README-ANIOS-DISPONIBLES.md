# Endpoint: Años Disponibles para Filtros de Conducta

## 📋 Descripción
Nuevo endpoint que devuelve todos los años académicos disponibles en los registros de conducta/infracciones. Este endpoint es útil para llenar filtros dinámicamente en el frontend según los datos existentes en la base de datos.

## 🔗 Endpoint

```
GET /conducta/anios-disponibles
```

### Autenticación
- **Requiere:** JWT Token
- **Roles permitidos:** Admin, P.A

### Query Parameters
Ninguno (este endpoint no recibe parámetros)

## 📤 Respuesta

### Estructura de la Respuesta

```typescript
{
  total_anios: number;
  anios: Array<{
    anio_academico: string;
    trimestres_disponibles: number[];
    total_registros: number;
  }>;
}
```

### Ejemplo de Respuesta

```json
{
  "total_anios": 2,
  "anios": [
    {
      "anio_academico": "2025",
      "trimestres_disponibles": [1, 2, 3],
      "total_registros": 45
    },
    {
      "anio_academico": "2024",
      "trimestres_disponibles": [1, 2, 3, 4],
      "total_registros": 120
    }
  ]
}
```

### Descripción de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total_anios` | number | Total de años académicos con registros |
| `anios` | array | Lista de años académicos disponibles |
| `anios[].anio_academico` | string | Año académico (ej: "2025") |
| `anios[].trimestres_disponibles` | number[] | Array de trimestres que tienen registros (1-4) |
| `anios[].total_registros` | number | Cantidad total de registros de conducta para ese año |

## 🎯 Uso Recomendado

### 1. Llenar Filtros Dinámicamente

```javascript
// Frontend - Obtener años disponibles para filtros
async function cargarFiltrosDisponibles() {
  try {
    const response = await fetch('/conducta/anios-disponibles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    // Llenar select de años
    const selectAnio = document.getElementById('filtro-anio');
    data.anios.forEach(anio => {
      const option = document.createElement('option');
      option.value = anio.anio_academico;
      option.textContent = `${anio.anio_academico} (${anio.total_registros} registros)`;
      selectAnio.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error al cargar filtros:', error);
  }
}
```

### 2. Trimestres Dinámicos por Año

```javascript
// Cuando el usuario selecciona un año, mostrar solo trimestres disponibles
function onAnioChange(anioSeleccionado) {
  // Buscar el año en los datos cargados
  const anioData = datosAnios.anios.find(
    a => a.anio_academico === anioSeleccionado
  );
  
  if (anioData) {
    // Llenar select de trimestres solo con los disponibles
    const selectTrimestre = document.getElementById('filtro-trimestre');
    selectTrimestre.innerHTML = '<option value="">Todos los trimestres</option>';
    
    anioData.trimestres_disponibles.forEach(trimestre => {
      const option = document.createElement('option');
      option.value = trimestre;
      option.textContent = `Trimestre ${trimestre}`;
      selectTrimestre.appendChild(option);
    });
  }
}
```

## 🔄 Flujo de Uso con Otros Endpoints

### Paso 1: Obtener años disponibles
```
GET /conducta/anios-disponibles
```

### Paso 2: Usuario selecciona filtros

El frontend muestra los filtros disponibles basados en los datos del paso 1.

### Paso 3: Consultar alumnos con infracciones
```
GET /conducta/alumnos-con-infracciones?anio_academico=2025&trimestre=1&id_curso=5
```

## 🎨 Características

✅ **Ordenamiento:** Los años se devuelven ordenados de más reciente a más antiguo
✅ **Trimestres ordenados:** Los trimestres dentro de cada año están ordenados (1, 2, 3, 4)
✅ **Estadísticas incluidas:** Muestra el total de registros por año para dar contexto
✅ **Filtrado inteligente:** Solo muestra años y trimestres que realmente tienen datos
✅ **Sin datos vacíos:** Excluye registros sin año académico o trimestre

## 📊 Casos de Uso

### Caso 1: Interfaz de Administrador
El administrador puede ver qué años académicos tienen registros de conducta antes de aplicar filtros.

### Caso 2: Reportes y Estadísticas
Útil para generar reportes históricos mostrando la disponibilidad de datos por período.

### Caso 3: Validación de Filtros
El frontend puede validar que los filtros seleccionados por el usuario sean válidos antes de hacer la consulta.

## ⚠️ Notas Importantes

1. **Autenticación Requerida:** Este endpoint requiere autenticación JWT
2. **Roles:** Solo accesible para Admin y P.A (Personal Administrativo)
3. **Performance:** La consulta usa `groupBy` de Prisma que es eficiente
4. **Datos Reales:** Solo devuelve años/trimestres con datos reales, no valores por defecto

## 🔗 Endpoints Relacionados

- `GET /conducta/alumnos-con-infracciones` - Obtener alumnos con infracciones (usa los filtros)
- `GET /conducta/catalogo` - Obtener catálogo de infracciones
- `GET /conducta/alumno/:id_alumno` - Obtener infracciones de un alumno específico
