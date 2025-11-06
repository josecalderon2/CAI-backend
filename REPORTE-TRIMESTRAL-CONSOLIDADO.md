# 📊 Reporte Trimestral Consolidado

## ✅ Implementación Completada

Se ha creado exitosamente el **Reporte Trimestral Consolidado** que permite generar un reporte completo con todos los trimestres del año académico para cada alumno.

---

## 🎯 Características Principales

### 1. **Datos Completos por Trimestre**

- Muestra los 4 trimestres del año académico
- Cada trimestre incluye:
  - ✅ Ausencias justificadas, injustificadas y atrasos
  - ✅ Infracciones detalladas por categoría
  - ✅ Puntuación de conducta calculada

### 2. **Totales Anuales**

- Suma de todas las asistencias del año
- Suma de todas las infracciones del año
- Puntuación de conducta anual calculada

### 3. **Promedio Trimestral**

- Promedio de las puntuaciones de los trimestres con datos
- Útil para evaluar el rendimiento promedio del estudiante

---

## 🔧 Endpoint Creado

```
GET /resumen/trimestral-consolidado
```

### Parámetros

- `cursoId` (número, requerido) - ID del curso
- `anio` (número, requerido) - Año académico (ej: 2025)

### Ejemplo de Uso

```bash
GET http://localhost:3000/resumen/trimestral-consolidado?cursoId=1&anio=2025
```

---

## 📋 Estructura de la Respuesta

```typescript
[
  {
    id_alumno: 1,
    nombre: 'Juan',
    apellido: 'Pérez',

    // Array con los 4 trimestres
    trimestres: [
      {
        trimestre: 1,
        total_justificadas: 2,
        total_injustificadas: 1,
        total_atrasos: 0,
        infracciones: [
          {
            categoria: 'MENOS_GRAVE',
            articulo: 'Art. 5.1.3',
            descripcion: 'Descripción...',
            conteo: 1,
          },
        ],
        total_menos_graves: 1,
        total_graves: 0,
        total_muy_graves: 0,
        puntuacion_conducta: 8.8,
      },
      // ... trimestres 2, 3, 4
    ],

    // Totales anuales
    total_anual_justificadas: 6,
    total_anual_injustificadas: 4,
    total_anual_atrasos: 2,
    total_anual_menos_graves: 3,
    total_anual_graves: 2,
    total_anual_muy_graves: 0,

    // Puntuaciones
    puntuacion_conducta_anual: 6.2,
    promedio_trimestral: 8.3,
  },
];
```

---

## 🆚 Comparación de Endpoints de Resumen

### 1. `/resumen/trimestral` (Individual)

**Uso:** Ver un trimestre específico

```
GET /resumen/trimestral?cursoId=1&trimestre=3&anio=2025
```

- ✅ Muestra UN solo trimestre
- ✅ Datos detallados de ese trimestre
- ✅ Ideal para reportes periódicos

### 2. `/resumen/anual` (Agregado)

**Uso:** Ver totales del año con desglose compacto

```
GET /resumen/anual?cursoId=1&anio=2025
```

- ✅ Totales anuales agregados
- ✅ Desglose trimestral en formato objeto
- ✅ Más compacto, menos detalle por trimestre

### 3. `/resumen/trimestral-consolidado` (Completo) ⭐ **NUEVO**

**Uso:** Ver todos los trimestres con detalle completo

```
GET /resumen/trimestral-consolidado?cursoId=1&anio=2025
```

- ✅ **Array completo de los 4 trimestres**
- ✅ **Infracciones detalladas por cada trimestre**
- ✅ **Totales anuales + Promedio trimestral**
- ✅ **Ideal para reportes completos del año**
- ✅ **Perfecto para análisis de evolución**
- ✅ **Mejor para exportar/imprimir reportes**

---

## 💡 Casos de Uso

### Reporte Anual para Padres

Usar el endpoint `/resumen/trimestral-consolidado` para generar un reporte completo que muestre:

- La evolución del estudiante trimestre por trimestre
- Qué infracciones cometió en cada periodo
- Cómo mejoró o empeoró su conducta durante el año

### Análisis de Tendencias

El array de trimestres permite:

- Graficar la evolución de la puntuación
- Identificar periodos problemáticos
- Comparar rendimiento entre trimestres

### Exportación a PDF/Excel

La estructura detallada facilita:

- Generar reportes imprimibles
- Exportar a hojas de cálculo
- Crear gráficos de evolución

---

## 🧮 Cálculo de Puntuaciones

### Por Trimestre

Cada trimestre calcula su puntuación individual:

```
10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
```

### Anual

La puntuación anual se calcula sobre los **totales anuales**:

```
10 - (Total SP Anual × 0.2) - (Total Menos Graves × 1) - (Total Graves × 2) - (Total Muy Graves × 3)
```

### Promedio Trimestral

Es el promedio aritmético de las puntuaciones de los trimestres que tienen datos:

```
(Puntuación T1 + Puntuación T2 + Puntuación T3 + Puntuación T4) / Trimestres con datos
```

---

## 📝 Notas Importantes

1. **Trimestres sin datos:** Si un trimestre no tiene registros, aparecerá con valores en 0 y puntuación 10.0

2. **Promedio inteligente:** El promedio trimestral solo considera trimestres con datos, no cuenta trimestres vacíos.

3. **Orden:** Los alumnos se ordenan alfabéticamente por apellido.

4. **Alumnos activos:** Solo incluye alumnos con estado ACTIVO en el curso.

---

## ✨ Archivos Creados

1. ✅ `src/asistencias/resumen/dto/resumen-trimestral-consolidado.dto.ts`
   - DTO de entrada (cursoId, anio)

2. ✅ `src/asistencias/resumen/dto/resumen-trimestral-consolidado-response.dto.ts`
   - DTO de respuesta con estructura completa
   - Incluye clase `DatosTrimestreDto` para cada trimestre

3. ✅ `src/asistencias/resumen/resumen.service.ts`
   - Método `getResumenTrimestralConsolidado()`
   - Lógica de agregación por trimestre
   - Cálculo de totales y promedios

4. ✅ `src/asistencias/resumen/resumen.controller.ts`
   - Endpoint `GET /resumen/trimestral-consolidado`
   - Documentación Swagger completa

5. ✅ `test-trimestral-consolidado.http`
   - Archivo de pruebas con ejemplos
   - Comparación entre endpoints

---

## 🚀 Próximos Pasos

1. **Probar el endpoint** con datos reales del año 2025
2. **Integrar en el frontend** para generar reportes visuales
3. **Agregar exportación** a PDF o Excel si es necesario
4. **Crear visualizaciones** de la evolución trimestral

---

¡El reporte trimestral consolidado está listo para usar! 🎉
