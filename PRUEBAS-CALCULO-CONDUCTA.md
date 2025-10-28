# 🧪 Pruebas Manuales - Cálculo de Conducta

## Objetivo

Verificar que el endpoint `/resumen/trimestral` calcula correctamente la puntuación de conducta según la fórmula establecida.

## Fórmula a Validar

```
PUNTUACIÓN = 10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
```

## 📋 Casos de Prueba

### Caso 1: Alumno con Conducta Perfecta

**Entrada:**

- SP: 0
- Menos Graves: 0
- Graves: 0
- Muy Graves: 0

**Resultado Esperado:** `10.0`

**Cálculo:**

```
10 - (0 × 0.2) - (0 × 1) - (0 × 2) - (0 × 3) = 10.0 ✅
```

---

### Caso 2: Jose Mauricio (del CSV Trimestral.csv - T1)

**Entrada:**

- P: 3 (no afecta)
- SP: 0
- Menos Graves: 3
- Graves: 1
- Muy Graves: 0

**Resultado Esperado:** `5.0`

**Cálculo:**

```
10 - (0 × 0.2) - (3 × 1) - (1 × 2) - (0 × 3)
= 10 - 0 - 3 - 2 - 0
= 5.0 ✅
```

---

### Caso 3: Keyri Yaritza (del CSV Trimestral.csv - T2)

**Entrada:**

- P: 5 (no afecta)
- SP: 2
- Menos Graves: 1
- Graves: 1
- Muy Graves: 0

**Resultado Esperado:** `6.6`

**Cálculo:**

```
10 - (2 × 0.2) - (1 × 1) - (1 × 2) - (0 × 3)
= 10 - 0.4 - 1 - 2 - 0
= 6.6 ✅
```

---

### Caso 4: Hugo Alberto (del CSV Trimestral.csv - T3)

**Entrada:**

- P: 0
- SP: 4
- Menos Graves: 2
- Graves: 0
- Muy Graves: 0

**Resultado Esperado:** `7.2`

**Cálculo:**

```
10 - (4 × 0.2) - (2 × 1) - (0 × 2) - (0 × 3)
= 10 - 0.8 - 2 - 0 - 0
= 7.2 ✅
```

---

### Caso 5: Alumno con Puntuación Mínima

**Entrada:**

- SP: 10
- Menos Graves: 5
- Graves: 3
- Muy Graves: 2

**Resultado Esperado:** `0.0` (no negativo)

**Cálculo:**

```
10 - (10 × 0.2) - (5 × 1) - (3 × 2) - (2 × 3)
= 10 - 2 - 5 - 6 - 6
= -9.0 → 0.0 ✅ (se ajusta a 0)
```

---

### Caso 6: Infracciones Múltiples Muy Graves

**Entrada:**

- SP: 0
- Menos Graves: 0
- Graves: 0
- Muy Graves: 3

**Resultado Esperado:** `1.0`

**Cálculo:**

```
10 - (0 × 0.2) - (0 × 1) - (0 × 2) - (3 × 3)
= 10 - 0 - 0 - 0 - 9
= 1.0 ✅
```

---

### Caso 7: Conteos Decimales (Caso Especial del Alumno 17)

**Entrada:**

- SP: 0
- Menos Graves: 0
- Graves: 0.3 (decimal)
- Muy Graves: 0

**Resultado Esperado:** `9.4`

**Cálculo:**

```
10 - (0 × 0.2) - (0 × 1) - (0.3 × 2) - (0 × 3)
= 10 - 0 - 0 - 0.6 - 0
= 9.4 ✅
```

---

## 🔧 Instrucciones para Prueba Manual

### 1. Preparar Datos de Prueba

Ejecutar en la base de datos:

```sql
-- Verificar catálogo de infracciones
SELECT * FROM "InfraccionCatalogo" WHERE activo = true;

-- Ver alumnos de un curso
SELECT a.id_alumno, a.nombre, a.apellido
FROM "Alumno" a
JOIN "AlumnoCurso" ac ON a.id_alumno = ac."alumnoId"
WHERE ac."cursoId" = 1 AND ac.estado = 'ACTIVO';

-- Ver asistencias de un trimestre
SELECT
  id_alumno,
  estado,
  COUNT(*) as total
FROM "Asistencia"
WHERE trimestre = 1
  AND anio_academico = '2025'
GROUP BY id_alumno, estado;

-- Ver infracciones de un trimestre
SELECT
  c.id_alumno,
  ic.categoria,
  COUNT(*) as total
FROM "Conducta" c
JOIN "InfraccionCatalogo" ic ON c.id_infraccion_catalogo = ic.id_infraccion
WHERE c.trimestre = 1
  AND c.anio_academico = '2025'
GROUP BY c.id_alumno, ic.categoria;
```

### 2. Llamar al Endpoint

```bash
# Usando curl
curl -X GET "http://localhost:3000/resumen/trimestral?cursoId=1&trimestre=1&anio=2025"

# O usando Postman/Insomnia
GET http://localhost:3000/resumen/trimestral?cursoId=1&trimestre=1&anio=2025
```

### 3. Validar Respuesta

La respuesta debe incluir para cada alumno:

```json
{
  "id_alumno": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "total_justificadas": 3, // Ausencias con permiso (no afectan)
  "total_injustificadas": 2, // SP (afectan -0.2 c/u)
  "infracciones": [
    {
      "categoria": "MENOS_GRAVE",
      "articulo": "5.1.3",
      "descripcion": "...",
      "conteo": 2
    }
  ],
  "total_menos_graves": 2, // Resumen
  "total_graves": 0,
  "total_muy_graves": 0,
  "puntuacion_conducta": 7.6 // ⭐ CAMPO CALCULADO
}
```

### 4. Verificar Cálculo Manual

Para cada alumno en la respuesta:

1. Anotar valores de `total_injustificadas`, `total_menos_graves`, `total_graves`, `total_muy_graves`
2. Aplicar fórmula: `10 - (SP × 0.2) - (MG × 1) - (G × 2) - (MG × 3)`
3. Comparar con el campo `puntuacion_conducta`
4. ✅ Deben coincidir (con margen de ±0.1 por redondeo)

---

## 🐛 Casos Extremos a Verificar

### ⚠️ Comportamiento con Datos Vacíos

- ¿Qué pasa si un alumno no tiene infracciones? → Debe devolver `10.0`
- ¿Qué pasa si un alumno no tiene asistencias? → Debe devolver `10.0`
- ¿Qué pasa si el curso está vacío? → Debe devolver `[]`

### ⚠️ Validación de Límites

- Puntuación mínima: `0.0` (nunca negativa)
- Puntuación máxima: `10.0`
- Redondeo: 1 decimal (ej. `7.6`, no `7.6000000`)

### ⚠️ Tipos de Ausencias

- **E (Excusado)**: Debe contar como `total_justificadas`, NO afecta puntuación
- **SP (Sin Permiso)**: Debe contar como `total_injustificadas`, afecta -0.2 c/u
- **P (Presente)**: No debe aparecer en conteos
- **A (Atraso)**: No debe afectar la puntuación de conducta

---

## 📊 Registro de Pruebas

| Caso | Alumno | SP  | MG  | G   | MG  | Esperado | Obtenido | Estado |
| ---- | ------ | --- | --- | --- | --- | -------- | -------- | ------ |
| 1    | -      | 0   | 0   | 0   | 0   | 10.0     | ?        | ⏳     |
| 2    | Jose M | 0   | 3   | 1   | 0   | 5.0      | ?        | ⏳     |
| 3    | Keyri  | 2   | 1   | 1   | 0   | 6.6      | ?        | ⏳     |
| 4    | Hugo   | 4   | 2   | 0   | 0   | 7.2      | ?        | ⏳     |
| 5    | -      | 10  | 5   | 3   | 2   | 0.0      | ?        | ⏳     |
| 6    | -      | 0   | 0   | 0   | 3   | 1.0      | ?        | ⏳     |
| 7    | -      | 0   | 0   | 0.3 | 0   | 9.4      | ?        | ⏳     |

**Estados:** ⏳ Pendiente | ✅ Aprobado | ❌ Fallido

---

## 📝 Notas de Implementación

- El cálculo se ejecuta en el backend en `resumen.service.ts`
- Los datos se obtienen directamente de las tablas `Asistencia` y `Conducta`
- El catálogo de infracciones debe estar correctamente configurado con las categorías
- Las ausencias "Con Permiso" (E) NO afectan la puntuación de conducta

---

**Creado:** 27 de octubre de 2025  
**Autor:** Sistema de Gestión Escolar CAI  
**Versión:** 1.0.0
