# 📋 SISTEMA DE VALIDACIÓN DE EVALUACIONES

## 🎯 Resumen del Sistema

El sistema valida automáticamente la creación de evaluaciones según el grado académico y asegura que se cumplan las reglas de negocio del colegio.

---

## 📚 REGLAS PARA BÁSICA (Primaria y Secundaria)

### Tipos de Evaluación - 6 tipos (100%)

1. **Tarea** - 5%
2. **Revisión de Cuaderno** - 15%
3. **Laboratorio** - 15%
4. **Actividad Integradora** - 25%
5. **Autoevaluación** - 10%
6. **Examen Trimestral** - 30%

### Reglas de Cantidad

#### ✅ Tipos con Múltiples Evaluaciones por Mes

- **Tarea**, **Revisión de Cuaderno**, **Laboratorio**
- **Mínimo**: 1 por mes (3 por trimestre)
- **Máximo**: Sin límite (a criterio del orientador)
- **División de Porcentaje**: Si hay más de 1 evaluación del mismo tipo en un mes, el porcentaje se divide entre todas.

**Ejemplo con Tareas (5% total):**

- 1 tarea en el mes = 5% cada una
- 2 tareas en el mes = 2.5% cada una
- 3 tareas en el mes = 1.67% cada una

#### ⚠️ Tipos con UNA SOLA Evaluación por Trimestre

- **Actividad Integradora**, **Autoevaluación**, **Examen Trimestral**
- **Cantidad**: Exactamente 1 por trimestre
- **No se permiten duplicados** en el mismo trimestre

### Campos Obligatorios

- `trimestre` (1, 2 o 3) - Para tipos únicos por trimestre
- `mes` (1-12) - Para tipos múltiples por mes

---

## 🎓 REGLAS PARA BACHILLERATO

### Tipos de Evaluación - 6 tipos (100%)

1. **Tarea** - 5%
2. **Laboratorio** - 10%
3. **Actividad Integradora** - 25%
4. **Coevaluación** - 5%
5. **Examen Parcial** - 25%
6. **Examen de Periodo** - 30%

### Reglas de Cantidad

#### ⚠️ TODOS los Tipos: UNA SOLA Evaluación por Periodo

- **Todos los 6 tipos** permiten solo 1 evaluación por periodo
- **4 periodos al año**
- **No se permiten duplicados** del mismo tipo en el mismo periodo

### Campos Obligatorios

- `periodo` (1, 2, 3 o 4) - Obligatorio para todos

---

## 🔒 VALIDACIONES IMPLEMENTADAS

### 1. Validación de Grado Académico

```
❌ Error si intentas usar un tipo de evaluación de BACHILLERATO en PRIMARIA
✅ Solo puedes usar tipos de evaluación del grado académico correcto
```

### 2. Validación de Duplicados

**Para BÁSICA:**

```javascript
// ❌ RECHAZADO
{
  tipo: "Examen Trimestral",
  trimestre: 1,
  // Ya existe uno en el trimestre 1
}

// ✅ ACEPTADO
{
  tipo: "Tarea",
  mes: 1,
  // Pueden haber múltiples tareas en el mes 1
}
```

**Para BACHILLERATO:**

```javascript
// ❌ RECHAZADO
{
  tipo: "Examen de Periodo",
  periodo: 1,
  // Ya existe uno en el periodo 1
}

// ✅ ACEPTADO
{
  tipo: "Examen de Periodo",
  periodo: 2,
  // Diferente periodo, está bien
}
```

### 3. Validación de Campos Requeridos

**Para BÁSICA:**

```javascript
// ❌ FALTA trimestre para tipo único
{
  tipo: "Actividad Integradora",
  // Falta: trimestre
}

// ❌ FALTA mes para tipo múltiple
{
  tipo: "Tarea",
  // Falta: mes o trimestre
}
```

**Para BACHILLERATO:**

```javascript
// ❌ FALTA periodo (siempre obligatorio)
{
  tipo: "Cualquier tipo",
  // Falta: periodo
}
```

---

## 📊 CÁLCULO AUTOMÁTICO DE PORCENTAJES

### Endpoint para calcular porcentajes reales

```
GET /evaluaciones/porcentajes/asignatura/{id_asignatura}
```

### Ejemplo de Respuesta

```json
{
  "asignatura": { "id_asignatura": 1 },
  "anio_academico": "2025",
  "trimestre": 1,
  "distribucionPorcentajes": [
    {
      "tipo": "Tarea",
      "porcentajeBase": 5,
      "cantidad": 3,
      "porcentajeCadaUna": 1.67,
      "evaluaciones": [
        { "id_evaluacion": 1, "nombre": "Tarea 1" },
        { "id_evaluacion": 2, "nombre": "Tarea 2" },
        { "id_evaluacion": 3, "nombre": "Tarea 3" }
      ]
    },
    {
      "tipo": "Examen Trimestral",
      "porcentajeBase": 30,
      "cantidad": 1,
      "porcentajeCadaUna": 30,
      "evaluaciones": [
        { "id_evaluacion": 10, "nombre": "Examen 1er Trimestre" }
      ]
    }
  ],
  "totalPorcentaje": 100
}
```

---

## 🔌 ENDPOINTS DISPONIBLES

### 1. Obtener tipos válidos para una asignatura

```
GET /evaluaciones/tipos-evaluacion/asignatura/{id_asignatura}
```

Devuelve solo los 6 tipos de evaluación válidos para el grado académico de esa asignatura.

### 2. Calcular porcentajes reales

```
GET /evaluaciones/porcentajes/asignatura/{id_asignatura}
```

Calcula cómo se distribuyen los porcentajes considerando evaluaciones múltiples.

### 3. Crear evaluación (con validaciones)

```
POST /evaluaciones
```

Valida todas las reglas automáticamente antes de crear.

---

## ⚠️ MENSAJES DE ERROR COMUNES

### Error: Ya existe una evaluación del mismo tipo

```json
{
  "statusCode": 403,
  "message": "Ya existe una evaluación de tipo 'Examen Trimestral' para el trimestre 1 en esta asignatura. Solo se permite 1 evaluación de este tipo por trimestre."
}
```

### Error: Tipo de evaluación no corresponde al grado

```json
{
  "statusCode": 403,
  "message": "El tipo de evaluación 'Examen de Periodo' no es válido para el grado académico 'Primaria'. Este tipo de evaluación es para 'Bachillerato'."
}
```

### Error: Falta campo obligatorio

```json
{
  "statusCode": 403,
  "message": "Para BACHILLERATO es obligatorio especificar el periodo (1, 2, 3 o 4)."
}
```

---

## 📝 EJEMPLOS DE USO

### Crear Evaluación en PRIMARIA

**✅ Tarea (múltiples permitidas):**

```json
POST /evaluaciones
{
  "nombre": "Tarea de Matemáticas",
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 17,
  "id_asignatura": 1,
  "mes": 1,
  "trimestre": 1
}
```

**✅ Examen Trimestral (solo 1 por trimestre):**

```json
POST /evaluaciones
{
  "nombre": "Examen 1er Trimestre",
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 9,
  "id_asignatura": 1,
  "trimestre": 1
}
```

### Crear Evaluación en BACHILLERATO

**✅ Cualquier tipo (solo 1 por periodo):**

```json
POST /evaluaciones
{
  "nombre": "Examen de Periodo 1",
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 7,
  "id_asignatura": 13,
  "periodo": 1
}
```

---

## 🎯 FLUJO RECOMENDADO EN EL FRONTEND

1. **Usuario selecciona asignatura**
   - Llamar: `GET /evaluaciones/tipos-evaluacion/asignatura/{id}`
   - Mostrar solo los 6 tipos válidos

2. **Usuario selecciona tipo de evaluación**
   - Si es BÁSICA:
     - Si tipo es Tarea/Revisión/Laboratorio → Pedir mes
     - Si tipo es Actividad/Autoevaluación/Examen → Pedir trimestre
   - Si es BACHILLERATO:
     - Siempre pedir periodo

3. **Antes de guardar**
   - Llamar: `GET /evaluaciones/porcentajes/asignatura/{id}`
   - Mostrar al usuario cuántas evaluaciones ya existen y el porcentaje de cada una

4. **Guardar evaluación**
   - `POST /evaluaciones`
   - El backend valida todo automáticamente

---

## 📌 NOTAS IMPORTANTES

1. **Año Académico**: Se establece automáticamente al año actual (2025)
2. **Porcentajes**: Se calculan dinámicamente, no se guardan en la BD
3. **Validaciones**: Todas ocurren en el backend, el frontend solo necesita seguir el flujo
4. **IDs de Tipos**: Consultar siempre el endpoint de tipos válidos, no asumir IDs fijos
