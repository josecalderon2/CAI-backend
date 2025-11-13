# Endpoints de Dashboard Administrativo - Estadísticas

## Descripción General
Se han agregado 3 nuevos endpoints al módulo de estadísticas para alimentar el dashboard administrativo con información clave del sistema.

---

## 1. GET /estadisticas/dashboard/general

### Descripción
Retorna estadísticas generales del sistema incluyendo totales y cambios del mes actual.

### Response
```json
{
  "totalAlumnos": 17,
  "alumnosActivos": 16,
  "cursosActivos": 5,
  "asignaturasTotal": 12,
  "docentesActivos": 8,
  "cambioAlumnos": 3,
  "cambioCursos": 0,
  "cambioAsignaturas": 0,
  "cambioDocentes": 1
}
```

### Lógica Implementada
- **totalAlumnos**: COUNT de tabla `Alumno`
- **alumnosActivos**: COUNT de `Alumno` WHERE `activo=true`
- **cursosActivos**: COUNT de `Curso` WHERE `activo=true`
- **asignaturasTotal**: COUNT de `Asignatura`
- **docentesActivos**: COUNT de `Orientador` WHERE `activo=true`
- **cambioAlumnos**: COUNT de `Alumno` WHERE `fechaMatricula >= inicio del mes actual`
- **cambioCursos**: 0 (no tienen fecha de creación en el schema)
- **cambioAsignaturas**: 0 (no tienen fecha de creación en el schema)
- **cambioDocentes**: COUNT de `Orientador` WHERE `createdAt >= inicio del mes actual`

---

## 2. GET /estadisticas/dashboard/tareas-pendientes

### Descripción
Retorna una lista de tareas pendientes que requieren atención, organizadas por prioridad (alta, media, baja).

### Response
```json
{
  "total": 3,
  "tareas": [
    {
      "id": 2,
      "titulo": "Cursos sin orientador",
      "descripcion": "2 curso(s) activo(s) sin orientador asignado",
      "prioridad": "alta",
      "cantidad": 2,
      "tipo": "cursos"
    },
    {
      "id": 3,
      "titulo": "Alumnos sin curso",
      "descripcion": "5 alumno(s) activo(s) sin curso asignado",
      "prioridad": "alta",
      "cantidad": 5,
      "tipo": "alumnos"
    },
    {
      "id": 1,
      "titulo": "Alumnos inactivos",
      "descripcion": "Hay 1 alumno(s) marcado(s) como inactivo(s)",
      "prioridad": "media",
      "cantidad": 1,
      "tipo": "alumnos"
    },
    {
      "id": 4,
      "titulo": "Docentes inactivos",
      "descripcion": "3 docente(s) marcado(s) como inactivo(s)",
      "prioridad": "baja",
      "cantidad": 3,
      "tipo": "docentes"
    }
  ]
}
```

### Tipos de Tareas Detectadas

#### Prioridad ALTA
1. **Cursos sin orientador**: Cursos activos sin orientador asignado (`id_orientador` es NULL)
2. **Alumnos sin curso**: Alumnos activos sin inscripciones en ningún curso

#### Prioridad MEDIA
3. **Alumnos inactivos**: Alumnos marcados como inactivos

#### Prioridad BAJA
4. **Docentes inactivos**: Orientadores marcados como inactivos

### Casos Especiales
- Si no hay tareas pendientes, retorna:
```json
{
  "mensaje": "No hay tareas pendientes",
  "tareas": []
}
```

---

## 3. GET /estadisticas/dashboard/resumen-mensual

### Descripción
Retorna un resumen de las actividades registradas durante el mes actual.

### Response
```json
{
  "mes": "noviembre 2025",
  "nuevasMatriculas": 3,
  "nuevosDocentes": 1,
  "asistenciasRegistradas": 245,
  "calificacionesRegistradas": 180,
  "alumnosActivos": 17,
  "cursosActivos": 5,
  "resumen": {
    "totalActividades": 429
  }
}
```

### Lógica Implementada
- **mes**: Nombre del mes actual + año (formato: "noviembre 2025")
- **nuevasMatriculas**: COUNT de `Alumno` WHERE `fechaMatricula >= inicio del mes actual`
- **nuevosDocentes**: COUNT de `Orientador` WHERE `createdAt >= inicio del mes actual`
- **asistenciasRegistradas**: COUNT de `Asistencia` WHERE `fecha >= inicio del mes actual`
- **calificacionesRegistradas**: COUNT de `Notas` WHERE `fecha_registro >= inicio del mes actual`
- **alumnosActivos**: COUNT actual de `Alumno` WHERE `activo=true`
- **cursosActivos**: COUNT actual de `Curso` WHERE `activo=true`
- **totalActividades**: Suma de nuevasMatriculas + nuevosDocentes + asistenciasRegistradas + calificacionesRegistradas

---

## Notas Técnicas

### Dependencias
- **PrismaService**: Para acceso a la base de datos
- **NestJS**: Framework utilizado

### Archivos Modificados
1. `src/estadisticas/estadisticas.service.ts`
   - Se agregaron 3 nuevos métodos:
     - `getDashboardGeneral()`
     - `getTareasPendientes()`
     - `getResumenMensual()`

2. `src/estadisticas/estadisticas.controller.ts`
   - Se agregaron 3 nuevos endpoints con decoradores Swagger

### Archivo de Pruebas
- `test-estadisticas-dashboard.http`: Archivo HTTP para testing de los endpoints

---

## Uso en Frontend

### Dashboard General
Usar para mostrar las tarjetas de estadísticas principales con indicadores de cambio mensual.

### Tareas Pendientes
Usar para mostrar alertas o notificaciones de tareas que requieren atención, con código de colores según prioridad:
- **Alta**: Rojo/Naranja
- **Media**: Amarillo
- **Baja**: Azul

### Resumen Mensual
Usar para mostrar gráficos o tablas de actividad del mes actual, útil para reportes mensuales.

---

## Testing

### Prerequisitos
1. Backend en ejecución: `npm run start:dev`
2. Base de datos poblada con datos de ejemplo

### Usando el archivo .http
1. Abrir `test-estadisticas-dashboard.http`
2. Configurar el token de autenticación si es necesario
3. Ejecutar cada request con REST Client de VS Code

### Manualmente con cURL
```bash
# Dashboard General
curl -X GET http://localhost:3000/estadisticas/dashboard/general

# Tareas Pendientes
curl -X GET http://localhost:3000/estadisticas/dashboard/tareas-pendientes

# Resumen Mensual
curl -X GET http://localhost:3000/estadisticas/dashboard/resumen-mensual
```

---

## Próximas Mejoras Sugeridas

1. **Caché**: Implementar caché para estadísticas que no cambian frecuentemente
2. **Filtros por fecha**: Permitir consultar estadísticas de meses anteriores
3. **Exportación**: Agregar endpoints para exportar datos en PDF/Excel
4. **Alertas**: Sistema de notificaciones cuando las tareas pendientes superan un umbral
5. **Gráficos**: Endpoints adicionales para datos históricos que alimenten gráficos de tendencias
