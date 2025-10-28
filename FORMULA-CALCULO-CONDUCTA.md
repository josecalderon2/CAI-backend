# 📐 Fórmula de Cálculo de Conducta

## Resumen Ejecutivo

El sistema calcula automáticamente la puntuación de conducta trimestral para cada estudiante basándose en ausencias injustificadas e infracciones al reglamento.

## 🎯 Puntuación Base

Cada estudiante comienza el trimestre con una **puntuación de 10 puntos**.

## 📉 Descuentos Aplicados

### 1. Ausencias Sin Permiso (SP)

- **Descuento:** -0.2 puntos por cada ausencia
- Las ausencias **Con Permiso (P/E)** NO afectan la puntuación

### 2. Infracciones al Reglamento

Las infracciones se clasifican en tres categorías según gravedad:

| Categoría       | Descuento por Infracción | Ejemplo                       |
| --------------- | ------------------------ | ----------------------------- |
| **Menos Grave** | -1 punto                 | Uso indebido del uniforme     |
| **Grave**       | -2 puntos                | Falta de respeto a compañeros |
| **Muy Grave**   | -3 puntos                | Acoso o violencia física      |

## 📊 Fórmula Completa

```
PUNTUACIÓN CONDUCTA = 10 - (Total SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
```

### Restricciones:

- La puntuación **mínima** es **0** (no puede ser negativa)
- La puntuación **máxima** es **10**
- Se redondea a **1 decimal**

## 📝 Ejemplos Prácticos

### Ejemplo 1: Tobar Montejo, Jose Mauricio (Trimestre 1)

```
Datos:
- Ausencias Justificadas (P): 3
- Ausencias Sin Permiso (SP): 0
- Infracciones Menos Graves: 3
- Infracciones Graves: 1
- Infracciones Muy Graves: 0

Cálculo:
10 - (0 × 0.2) - (3 × 1) - (1 × 2) - (0 × 3)
= 10 - 0 - 3 - 2 - 0
= 5.0 ✅
```

### Ejemplo 2: Flores Henríquez, Keyri Yaritza (Trimestre 2)

```
Datos:
- Ausencias Justificadas (P): 5
- Ausencias Sin Permiso (SP): 2
- Infracciones Menos Graves: 1
- Infracciones Graves: 1
- Infracciones Muy Graves: 0

Cálculo:
10 - (2 × 0.2) - (1 × 1) - (1 × 2) - (0 × 3)
= 10 - 0.4 - 1 - 2 - 0
= 6.6 ✅
```

### Ejemplo 3: Segura Ramírez, Hugo Alberto (Trimestre 3)

```
Datos:
- Ausencias Justificadas (P): 0
- Ausencias Sin Permiso (SP): 4
- Infracciones Menos Graves: 2
- Infracciones Graves: 0
- Infracciones Muy Graves: 0

Cálculo:
10 - (4 × 0.2) - (2 × 1) - (0 × 2) - (0 × 3)
= 10 - 0.8 - 2 - 0 - 0
= 7.2 ✅
```

### Ejemplo 4: Caso con conteos decimales

```
Datos:
- Ausencias Sin Permiso (SP): 1
- Infracciones Graves: 0.5 (caso especial)
- Otras infracciones: 0

Cálculo:
10 - (1 × 0.2) - (0 × 1) - (0.5 × 2) - (0 × 3)
= 10 - 0.2 - 0 - 1.0 - 0
= 8.8 ✅

Nota: Los conteos decimales pueden ocurrir en casos excepcionales
donde una infracción se comparte entre múltiples estudiantes o
se aplica parcialmente según criterio del orientador.
```

## 🔍 Validación de la Lógica

### Estados de Asistencia

- ✅ **P (Presente)**: No afecta conducta
- ✅ **E (Excusado)**: Cuenta como justificada, NO afecta conducta
- ❌ **SP (Sin Permiso)**: Descuenta 0.2 puntos
- ⚠️ **A (Atraso)**: NO afecta conducta (solo se reporta)

### Columna "Artículo"

Esta columna es **referencial** y indica qué regla del manual de convivencia se infringió. No se usa en el cálculo numérico, pero es importante para la trazabilidad y justificación de las infracciones.

## 🛠️ Implementación Técnica

El cálculo se realiza en:

- **Archivo:** `src/asistencias/resumen/resumen.service.ts`
- **Método:** `getResumenTrimestral()`
- **Endpoint:** `GET /resumen/trimestral?cursoId=X&trimestre=Y&anio=Z`

### Respuesta del API:

```json
{
  "id_alumno": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "total_justificadas": 3,
  "total_injustificadas": 2,
  "infracciones": [
    {
      "categoria": "MENOS_GRAVE",
      "articulo": "5.1.3 literal b",
      "descripcion": "Uso indebido del uniforme",
      "conteo": 2
    }
  ],
  "total_menos_graves": 2,
  "total_graves": 0,
  "total_muy_graves": 0,
  "puntuacion_conducta": 7.6
}
```

## 📚 Referencias

- Manual de Convivencia Escolar
- Reglamento Interno del Centro Educativo
- Schema de Base de Datos: `prisma/schema.prisma` (modelos `Conducta`, `InfraccionCatalogo`, `Asistencia`)

## 🔄 Actualización

**Última modificación:** 27 de octubre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Implementado y Documentado
