# ✅ Sistema de Cálculo de Notas Mensuales - Documentación Actualizada

## 📐 Fórmula de Cálculo Oficial

El sistema utiliza la siguiente fórmula para calcular las notas mensuales:

### Componentes del Cálculo

1. **Promedio Puro de Actividades**
   - Fórmula: `Suma de todas las actividades / Cantidad de actividades`
   - Solo se cuentan las actividades con valor (no `null` o `undefined`)
   - Redondeo: 3 decimales

2. **Promedio Actividades 70%**
   - Fórmula: `Promedio Puro × 0.70`
   - Redondeo: 3 decimales

3. **Promedio Examen 30%**
   - Fórmula: `Nota del Examen Mensual × 0.30`
   - Redondeo: 3 decimales

4. **Nota Mensual Final**
   - Fórmula: `Promedio Actividades 70% + Promedio Examen 30%`
   - Redondeo: 3 decimales

---

## 📊 Ejemplo Completo de Cálculo

### Datos de Entrada:
```json
{
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 8.0,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.0,
  "laboratorio_escrito": 8.0,
  "examen_mensual": 9.0
}
```

### Cálculos Paso a Paso:

#### 1. Promedio Puro de Actividades
```
Actividades: 8.0, 9.0, 7.0, 8.0
Suma: 8.0 + 9.0 + 7.0 + 8.0 = 32.0
Cantidad: 4
Promedio Puro = 32.0 / 4 = 8.000
```
✅ **Promedio Puro Actividades = 8.000**

#### 2. Promedio Actividades 70%
```
Promedio Actividades 70% = 8.000 × 0.70 = 5.600
```
✅ **Promedio Actividades 70% = 5.600**

#### 3. Promedio Examen 30%
```
Promedio Examen 30% = 9.0 × 0.30 = 2.700
```
✅ **Promedio Examen 30% = 2.700**

#### 4. Nota Mensual Final
```
Nota Mensual = 5.600 + 2.700 = 8.300
```
✅ **Nota Mensual = 8.300**

### Respuesta del API:
```json
{
  "id": 1,
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 8.0,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.0,
  "laboratorio_escrito": 8.0,
  "examen_mensual": 9.0,
  "promedio_puro_actividades": 8.000,
  "promedio_70_actividades": 5.600,
  "promedio_30_examen": 2.700,
  "promedio": 8.300,
  "fecha_creacion": "2025-03-15T10:30:00.000Z",
  "fecha_actualizacion": "2025-03-15T10:30:00.000Z"
}
```

---

## 🔢 Casos Especiales

### Caso 1: Solo algunas actividades ingresadas
```json
{
  "tarea_1": 8.0,
  "examen_mensual": 9.0
  // Otras actividades no ingresadas
}
```

**Cálculo:**
- Promedio Puro = 8.0 / 1 = 8.000 (solo cuenta tarea_1)
- Promedio 70% = 8.000 × 0.70 = 5.600
- Promedio Examen 30% = 9.0 × 0.30 = 2.700
- **Nota Mensual = 8.300**

### Caso 2: Sin examen mensual
```json
{
  "tarea_1": 8.0,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.0,
  "laboratorio_escrito": 8.0
  // Sin examen_mensual
}
```

**Cálculo:**
- Promedio Puro = (8.0 + 9.0 + 7.0 + 8.0) / 4 = 8.000
- Promedio 70% = 8.000 × 0.70 = 5.600
- Promedio Examen 30% = 0.0 × 0.30 = 0.000
- **Nota Mensual = 5.600**

---

## 📝 Campos de Respuesta

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `promedio_puro_actividades` | `number` | Promedio simple de actividades | 8.000 |
| `promedio_70_actividades` | `number` | 70% del promedio de actividades | 5.600 |
| `promedio_30_examen` | `number` | 30% del examen mensual | 2.700 |
| `promedio` | `number` | Nota mensual final | 8.300 |

---

## ⚙️ Implementación Técnica

### Redondeo
Todos los valores se redondean a **3 decimales** usando:
```typescript
Math.round(valor * 1000) / 1000
```

### Manejo de Valores Nulos
- Las actividades con valor `null` o `undefined` no se cuentan en el promedio
- Si no hay actividades, el promedio puro es 0
- El examen mensual por defecto es 0 si no se proporciona

### Validaciones
- Todas las notas deben estar entre 0 y 10
- Las actividades son opcionales
- El sistema calcula automáticamente todos los componentes

---

## 🧪 Pruebas de Validación

### Test 1: Notas completas
```json
Input: { tarea_1: 8, revision: 9, tarea_2: 7, lab: 8, examen: 9 }
Expected:
  - promedio_puro: 8.000
  - promedio_70: 5.600
  - promedio_30: 2.700
  - nota_mensual: 8.300
```

### Test 2: Solo examen
```json
Input: { examen_mensual: 10 }
Expected:
  - promedio_puro: 0.000
  - promedio_70: 0.000
  - promedio_30: 3.000
  - nota_mensual: 3.000
```

### Test 3: Sin examen
```json
Input: { tarea_1: 10, revision: 10 }
Expected:
  - promedio_puro: 10.000
  - promedio_70: 7.000
  - promedio_30: 0.000
  - nota_mensual: 7.000
```

---

## 📌 Diferencias con el Sistema Anterior

### Antes (Incorrecto):
- Promedio simple de todas las notas (incluyendo examen)
- Redondeo a 2 decimales
- No distinguía actividades vs examen

### Ahora (Correcto):
✅ Promedio puro solo de actividades
✅ 70% actividades + 30% examen
✅ Redondeo a 3 decimales
✅ Cálculo según sistema oficial

---

## 🚀 Uso en Frontend

### Crear Nota Mensual
```typescript
const response = await fetch('/notas-mensuales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_alumno: 1,
    id_asignatura: 1,
    mes: 3,
    anio: 2025,
    tarea_1: 8.0,
    revision_libros_cuadernos: 9.0,
    tarea_2: 7.0,
    laboratorio_escrito: 8.0,
    examen_mensual: 9.0
  })
});

const data = await response.json();
console.log('Promedio Puro:', data.promedio_puro_actividades);  // 8.000
console.log('Promedio 70%:', data.promedio_70_actividades);     // 5.600
console.log('Promedio 30%:', data.promedio_30_examen);          // 2.700
console.log('Nota Final:', data.promedio);                      // 8.300
```

---

## ⚠️ Nota Importante sobre Actualización

En la versión actual simplificada, el método `PATCH` **solo puede actualizar el examen mensual**. 

Para actualizar actividades individuales, se debe:
1. Usar el módulo `sistema-evaluacion` que maneja la tabla `ActividadEvaluacion`
2. O crear una nueva nota mensual con los valores actualizados

**Razón:** Las actividades individuales no se almacenan en la tabla en esta versión simplificada.

---

## 📞 Soporte

Para dudas sobre el cálculo o implementación:
1. Revisar esta documentación
2. Consultar el código en `notas-mensuales.service.ts` métodos:
   - `calcularPromedioPuroActividades()`
   - `calcularNotaMensual()`
3. Contactar al equipo de desarrollo
