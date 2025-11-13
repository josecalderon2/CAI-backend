# 📅 EXPLICACIÓN DE PERIODOS Y TRIMESTRES - SISTEMAS DE EVALUACIÓN

## 🎯 DIFERENCIAS FUNDAMENTALES

### SISTEMA DE TRIMESTRES (BÁSICA: Primaria y Secundaria)

- **3 TRIMESTRES** al año
- Cada trimestre tiene **3 MESES**
- **12 EVALUACIONES** por trimestre

### SISTEMA DE PERIODOS (BACHILLERATO)

- **4 PERIODOS** al año
- Cada periodo dura aproximadamente **2-3 meses**
- **6 EVALUACIONES** por periodo

---

## 📚 BÁSICA (Primaria y Secundaria) - TRIMESTRES

### Estructura del Año Escolar

**TRIMESTRE 1:**

- Febrero (mes 2)
- Marzo (mes 3)
- Abril (mes 4)

**TRIMESTRE 2:**

- Mayo (mes 5)
- Junio (mes 6)
- Julio (mes 7)

**TRIMESTRE 3:**

- Agosto (mes 8)
- Septiembre (mes 9)
- Octubre (mes 10)

### Tipos de Evaluaciones en BÁSICA

#### EVALUACIONES MENSUALES (se repiten cada mes)

1. **Tarea** - 5% del trimestre
   - 1 por mes = 3 tareas por trimestre
   - Si hay 3 tareas: 5% ÷ 3 = 1.67% cada una

2. **Revisión de Cuaderno** - 15% del trimestre
   - 1 por mes = 3 revisiones por trimestre
   - Si hay 3 revisiones: 15% ÷ 3 = 5% cada una

3. **Laboratorio** - 15% del trimestre
   - 1 por mes = 3 laboratorios por trimestre
   - Si hay 3 laboratorios: 15% ÷ 3 = 5% cada una

#### EVALUACIONES TRIMESTRALES (solo 1 por trimestre)

4. **Actividad Integradora** - 25% del trimestre
   - Solo 1 por trimestre = 25% completo

5. **Autoevaluación** - 10% del trimestre
   - Solo 1 por trimestre = 10% completo

6. **Examen Trimestral** - 30% del trimestre
   - Solo 1 por trimestre = 30% completo

### Campos en la Base de Datos para BÁSICA

```
Evaluación de BÁSICA tiene:
- trimestre: 1, 2 o 3 (OBLIGATORIO)
- mes: 2-10 (OPCIONAL, solo para evaluaciones mensuales)
- periodo: null (NO SE USA en básica)

Ejemplos:
- Tarea de Febrero: trimestre=1, mes=2
- Examen Trimestral 1: trimestre=1, mes=null
```

### Cálculo de Promedio en BÁSICA

**Por Trimestre:**

```
Promedio Trimestre =
  (Promedio Tareas × 0.05) +
  (Promedio Revisiones × 0.15) +
  (Promedio Laboratorios × 0.15) +
  (Actividad Integradora × 0.25) +
  (Autoevaluación × 0.10) +
  (Examen Trimestral × 0.30)
```

**Promedio Final del Año:**

```
Promedio Final = (Trimestre1 + Trimestre2 + Trimestre3) ÷ 3
```

---

## 🎓 BACHILLERATO - PERIODOS

### Estructura del Año Escolar

**PERIODO 1:**

- Aproximadamente Enero-Marzo

**PERIODO 2:**

- Aproximadamente Marzo-Mayo

**PERIODO 3:**

- Aproximadamente Mayo-Julio

**PERIODO 4:**

- Aproximadamente Agosto-Octubre

### Tipos de Evaluaciones en BACHILLERATO

**TODAS las evaluaciones son UNA SOLA por periodo:**

1. **Tarea** - 5% del periodo
   - Solo 1 por periodo = 5% completo

2. **Laboratorio** - 10% del periodo
   - Solo 1 por periodo = 10% completo

3. **Actividad Integradora** - 25% del periodo
   - Solo 1 por periodo = 25% completo

4. **Coevaluación** - 5% del periodo
   - Solo 1 por periodo = 5% completo

5. **Examen Parcial** - 25% del periodo
   - Solo 1 por periodo = 25% completo

6. **Examen de Periodo** - 30% del periodo
   - Solo 1 por periodo = 30% completo

### Campos en la Base de Datos para BACHILLERATO

```
Evaluación de BACHILLERATO tiene:
- periodo: 1, 2, 3 o 4 (OBLIGATORIO)
- trimestre: null (NO SE USA en bachillerato)
- mes: null (NO SE USA en bachillerato)

Ejemplo:
- Tarea Periodo 1: periodo=1, trimestre=null, mes=null
```

### Cálculo de Promedio en BACHILLERATO

**Por Periodo:**

```
Promedio Periodo =
  (Tarea × 0.05) +
  (Laboratorio × 0.10) +
  (Actividad Integradora × 0.25) +
  (Coevaluación × 0.05) +
  (Examen Parcial × 0.25) +
  (Examen de Periodo × 0.30)
```

**Promedio Final del Año:**

```
Promedio Final = (Periodo1 + Periodo2 + Periodo3 + Periodo4) ÷ 4
```

---

## 🔑 PUNTOS CLAVE PARA EL FRONTEND

### 1. Detectar el Grado Académico

**PRIMERO:** El frontend debe detectar a qué grado académico pertenece la asignatura:

- Si es **Primaria** o **Secundaria** → Usar sistema de TRIMESTRES
- Si es **Bachillerato** → Usar sistema de PERIODOS

### 2. Mostrar Campos Correctos al Crear Evaluación

**Para BÁSICA (Primaria/Secundaria):**

- Mostrar selector de **Trimestre** (1, 2, 3)
- Si el tipo es Tarea/Revisión/Laboratorio: Mostrar también selector de **Mes**
- Si el tipo es Actividad Integradora/Autoevaluación/Examen: NO mostrar mes

**Para BACHILLERATO:**

- Mostrar SOLO selector de **Periodo** (1, 2, 3, 4)
- NO mostrar trimestre ni mes

### 3. Validaciones que el Backend Ya Hace

**BÁSICA:**

- ✅ No permite crear 2 Actividades Integradoras en el mismo trimestre
- ✅ No permite crear 2 Autoevaluaciones en el mismo trimestre
- ✅ No permite crear 2 Exámenes Trimestrales en el mismo trimestre
- ✅ SÍ permite múltiples Tareas/Revisiones/Laboratorios en el mismo mes

**BACHILLERATO:**

- ✅ No permite crear 2 evaluaciones del mismo tipo en el mismo periodo
- ✅ Solo 1 de cada tipo por periodo (total 6 por periodo)

### 4. Cómo Mostrar Evaluaciones en el Frontend

**Para BÁSICA, agrupar por:**

```
Asignatura
  └─ Trimestre 1
      ├─ Febrero
      │   ├─ Tarea
      │   ├─ Revisión
      │   └─ Laboratorio
      ├─ Marzo
      │   ├─ Tarea
      │   ├─ Revisión
      │   └─ Laboratorio
      ├─ Abril
      │   ├─ Tarea
      │   ├─ Revisión
      │   └─ Laboratorio
      └─ Trimestrales
          ├─ Actividad Integradora
          ├─ Autoevaluación
          └─ Examen Trimestral
```

**Para BACHILLERATO, agrupar por:**

```
Asignatura
  └─ Periodo 1
      ├─ Tarea
      ├─ Laboratorio
      ├─ Actividad Integradora
      ├─ Coevaluación
      ├─ Examen Parcial
      └─ Examen de Periodo
```

### 5. Cómo Calcular Porcentajes Divididos

**Caso BÁSICA - Evaluaciones Mensuales:**

Si hay 3 tareas en el trimestre:

```
Porcentaje total de Tareas: 5%
Número de tareas: 3
Porcentaje de cada tarea: 5% ÷ 3 = 1.67%
```

Si hay 2 tareas en el trimestre:

```
Porcentaje total de Tareas: 5%
Número de tareas: 2
Porcentaje de cada tarea: 5% ÷ 2 = 2.5%
```

**Caso BACHILLERATO:**
No hay división porque solo hay 1 de cada tipo por periodo.

### 6. Endpoints Útiles para el Frontend

**Obtener tipos válidos para una asignatura:**

```
GET /evaluaciones/tipos-evaluacion/asignatura/{id_asignatura}

Respuesta incluye:
- grado académico (para saber si es trimestre o periodo)
- tipos de evaluación permitidos (solo los 6 correctos)
```

**Calcular porcentajes reales:**

```
GET /evaluaciones/porcentajes/asignatura/{id_asignatura}

Respuesta incluye:
- Cómo se divide el porcentaje si hay múltiples del mismo tipo
- Cuántas evaluaciones hay de cada tipo
```

---

## 📊 TABLA COMPARATIVA RÁPIDA

| Aspecto                       | BÁSICA (Primaria/Secundaria)       | BACHILLERATO            |
| ----------------------------- | ---------------------------------- | ----------------------- |
| **División del año**          | 3 Trimestres                       | 4 Periodos              |
| **Campo obligatorio**         | `trimestre` (1-3)                  | `periodo` (1-4)         |
| **Campo opcional**            | `mes` (2-10) para algunas          | Ninguno                 |
| **Evaluaciones por división** | 12                                 | 6                       |
| **Permite múltiples**         | Tarea, Revisión, Laboratorio       | Ninguna                 |
| **Solo 1 por división**       | Act. Integradora, Autoeval, Examen | Todas (las 6)           |
| **Promedio final**            | (T1 + T2 + T3) ÷ 3                 | (P1 + P2 + P3 + P4) ÷ 4 |

---

## 🎨 FLUJO RECOMENDADO EN EL FRONTEND

### Al Crear una Evaluación:

1. **Usuario selecciona Asignatura**
   - Llamar: `GET /evaluaciones/tipos-evaluacion/asignatura/{id}`
   - Detectar si es BÁSICA o BACHILLERATO del response

2. **Mostrar formulario según el grado:**
   - Si es BÁSICA: Mostrar campo "Trimestre" (dropdown: 1, 2, 3)
   - Si es BACHILLERATO: Mostrar campo "Periodo" (dropdown: 1, 2, 3, 4)

3. **Usuario selecciona Tipo de Evaluación**
   - Si es BÁSICA Y el tipo es Tarea/Revisión/Laboratorio:
     - Mostrar campo "Mes" (dropdown: Febrero, Marzo, Abril, etc.)
   - Caso contrario: No mostrar campo mes

4. **Antes de guardar:**
   - Mostrar preview de porcentaje
   - Si es evaluación mensual, indicar que el porcentaje se dividirá

5. **Al guardar:**
   - El backend valida todo automáticamente
   - Si hay error, mostrar el mensaje (es muy descriptivo)

---

## ⚠️ ERRORES COMUNES A MANEJAR

### Error: "Ya existe una evaluación del mismo tipo"

```
Significa: En BACHILLERATO intentaste crear 2 Tareas en el Periodo 1
O en BÁSICA intentaste crear 2 Exámenes Trimestrales en el Trimestre 1

Solución: Cambiar el periodo/trimestre o editar la existente
```

### Error: "Tipo de evaluación no válido para el grado académico"

```
Significa: Intentaste crear un "Examen de Periodo" en una asignatura de Primaria
O un "Examen Trimestral" en Bachillerato

Solución: Usar el endpoint de tipos válidos primero
```

### Error: "Falta el campo trimestre/periodo"

```
Significa: No enviaste el campo obligatorio

Solución: Siempre enviar trimestre (BÁSICA) o periodo (BACHILLERATO)
```

---

## 💡 TIPS IMPORTANTES

1. **NUNCA** mezclar trimestres y periodos en el mismo request
2. **SIEMPRE** consultar los tipos válidos antes de mostrar el formulario
3. **CALCULAR** porcentajes dinámicamente llamando al endpoint
4. **MOSTRAR** mensajes de error del backend (son muy claros)
5. **VALIDAR** en el frontend también para mejor UX, pero el backend es la fuente de verdad
6. **RECORDAR** que el año académico se establece automáticamente (no pedirlo al usuario)

---

Esta explicación cubre todo lo que el frontend necesita saber para manejar correctamente los dos sistemas diferentes.
