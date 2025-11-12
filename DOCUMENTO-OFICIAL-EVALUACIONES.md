# 📚 SISTEMA DE EVALUACIÓN - DOCUMENTO OFICIAL

## Basado en el documento operativo del colegio

---

## 1️⃣ BÁSICA - Promedio MENSUAL

### 📊 Estructura:

El **MES** se calcula con 3 rubros y se **NORMALIZA a escala de 10**:

| Rubro                        | Peso interno | Descripción                          |
| ---------------------------- | ------------ | ------------------------------------ |
| Tareas                       | 5%           | Promedio de N tareas del mes         |
| Revisión de libros/cuadernos | 15%          | Revisión(es) del mes                 |
| Laboratorio escrito          | 15%          | Pruebas o prácticas escritas del mes |
| **TOTAL**                    | **35%**      | → Se normaliza a 100% (escala 10)    |

### 🧮 Fórmula Oficial:

```
PromMes = ((0.05·TareasMes + 0.15·RevisionMes + 0.15·LabMes) / 0.35) × 10
```

**O simplificado:**

```
PromMes = (0.05·TareasMes + 0.15·RevisionMes + 0.15·LabMes) / 0.35
```

La división entre `0.35` normaliza los porcentajes (5% + 15% + 15% = 35%) a escala de 10.

### ✅ Ejemplo:

```
Tareas del mes: 8.2
Revisión del mes: 8.2
Laboratorio del mes: 8.2

PromMes = (0.05×8.2 + 0.15×8.2 + 0.15×8.2) / 0.35
        = (0.41 + 1.23 + 1.23) / 0.35
        = 2.87 / 0.35
        = 8.2 ✅
```

### 🔴 IMPORTANTE:

- Cada MES es independiente y se normaliza a escala de 10
- El frontend **PUEDE** mostrar cada mes como 100% porque se normaliza
- Si un rubro no se programó → NA (no pondera)
- Si se programó y no se entregó → 0

---

## 2️⃣ BÁSICA - Promedio TRIMESTRAL

### 📊 Estructura:

El **TRIMESTRE** tiene 3 bloques:

| Bloque         | Peso     | Componentes                                        |
| -------------- | -------- | -------------------------------------------------- |
| Bloque Mensual | 35%      | Promedio ponderado de 3 meses                      |
| Actividades    | 35%      | Actividad Integradora (25%) + Autoevaluación (10%) |
| Examen         | 30%      | Examen del trimestre                               |
| **TOTAL**      | **100%** |                                                    |

### 🧮 Fórmula Oficial:

**Paso 1: Calcular promedio de los meses (ponderado)**

| Trimestre | Mes 1   | Mes 2   | Mes 3   |
| --------- | ------- | ------- | ------- |
| T1        | Feb 28% | Mar 27% | Abr 45% |
| T2        | May 28% | Jun 27% | Jul 45% |
| T3        | Ago 28% | Sep 27% | Oct 45% |

```
MesesT1 = 0.28·PromFeb + 0.27·PromMar + 0.45·PromAbr
MesesT2 = 0.28·PromMay + 0.27·PromJun + 0.45·PromJul
MesesT3 = 0.28·PromAgo + 0.27·PromSep + 0.45·PromOct
```

**Paso 2: Calcular bloque de Actividades**

```
Actividades = 0.25·ActInteg + 0.10·Autoeval
```

**Paso 3: Calcular bloque de Examen**

```
Examen = 0.30·ExamenTrimestral
```

**Paso 4: Calcular Trimestre final**

```
Trimestre = 0.35·Meses + 0.35·Actividades + 0.30·Examen
```

### ✅ Ejemplo Completo (Trimestre 1):

**Promedios mensuales:**

- Febrero: 8.2
- Marzo: 8.6
- Abril: 9.0

**Evaluaciones trimestrales:**

- Actividad Integradora: 9.5
- Autoevaluación: 10.0
- Examen Trimestral: 8.0

**Cálculo:**

```
Paso 1 - Meses:
MesesT1 = 0.28×8.2 + 0.27×8.6 + 0.45×9.0
        = 2.296 + 2.322 + 4.05
        = 8.668

Paso 2 - Actividades:
Actividades = 0.25×9.5 + 0.10×10.0
            = 2.375 + 1.0
            = 3.375

Paso 3 - Examen:
Examen = 0.30×8.0
       = 2.4

Paso 4 - Trimestre:
Trimestre = 0.35×8.668 + 0.35×3.375 + 0.30×2.4
          = 3.034 + 1.181 + 0.72
          = 4.935

PERO ESTO DA UN VALOR SOBRE 10, NO ES CORRECTO...
```

### 🔴 ERROR EN EL DOCUMENTO O EN LA INTERPRETACIÓN

Revisando la fórmula del documento oficial, veo que dice:

```
Trimestre = 0.35·Meses + 0.35·Actividades + 0.30·Examen
```

Pero esto daría valores muy bajos. **DEBE SER:**

```
Trimestre = 0.35·Meses + (0.25·ActInteg + 0.10·Autoeval) + 0.30·Examen
```

Es decir:

- Meses aporta: 35% del valor del promedio mensual
- Actividad Integradora aporta: 25% de su nota
- Autoevaluación aporta: 10% de su nota
- Examen aporta: 30% de su nota

### ✅ Ejemplo CORREGIDO:

```
Trimestre = 0.35×8.668 + 0.25×9.5 + 0.10×10.0 + 0.30×8.0
          = 3.034 + 2.375 + 1.0 + 2.4
          = 8.809 ✅
```

Esto tiene más sentido matemáticamente.

---

## 3️⃣ BACHILLERATO - Promedio por PERIODO

### 📊 Estructura:

Bachillerato tiene **4 periodos** por año, cada uno con 6 rubros:

| Rubro                 | Peso     | Descripción                      |
| --------------------- | -------- | -------------------------------- |
| Actividad Integradora | 25%      | Proyecto o actividad del periodo |
| Tareas                | 5%       | Promedio de N tareas             |
| Coevaluación          | 5%       | Evaluación entre pares           |
| Laboratorio           | 10%      | Prácticas de laboratorio         |
| Examen Parcial        | 25%      | Examen a mitad del periodo       |
| Examen del Periodo    | 30%      | Examen final del periodo         |
| **TOTAL**             | **100%** |                                  |

### 🧮 Fórmula Oficial:

```
Periodo = 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParcial + 0.30·ExPeriodo
```

### ✅ Ejemplo:

```
Actividad Integradora: 9.0
Tareas: 8.7
Coevaluación: 8.8
Laboratorio: 8.8
Examen Parcial: 7.5
Examen del Periodo: 8.0

Periodo = 0.25×9.0 + 0.05×8.7 + 0.05×8.8 + 0.10×8.8 + 0.25×7.5 + 0.30×8.0
        = 2.25 + 0.435 + 0.44 + 0.88 + 1.875 + 2.4
        = 8.28 ✅
```

### 🔴 IMPORTANTE:

- Bachillerato NO tiene "meses", solo PERIODOS
- Cada periodo es independiente
- Los 4 periodos se promedian para la nota anual

---

## 4️⃣ DIFERENCIAS CLAVE

| Aspecto           | Mensual (Básica)         | Trimestral (Básica)                    | Periodo (Bachillerato) |
| ----------------- | ------------------------ | -------------------------------------- | ---------------------- |
| **Ventana**       | 1 mes                    | 3 meses                                | 1 periodo              |
| **Normalización** | Sí (35% → 100%)          | No                                     | No                     |
| **Rubros**        | 3 (Tarea, Revisión, Lab) | 3 bloques (Meses, Actividades, Examen) | 6 rubros               |
| **Escala**        | 0-10                     | 0-10                                   | 0-10                   |
| **Campo "mes"**   | Requerido                | Usado para ponderar meses              | No existe              |

---

## 5️⃣ REGLAS OPERATIVAS

### ✅ Generales:

- Todo en escala 0-10
- Redondeo a 2 decimales en cálculos intermedios
- Promediar evidencias por rubro ANTES de aplicar porcentajes
- NA no pondera (si no se programó)
- 0 si se programó y no se entregó

### ✅ Para el Frontend:

- En BÁSICA: Mostrar cada MES como 100% (porque se normaliza)
- En BÁSICA: Mostrar el TRIMESTRE con los 3 bloques (35% + 35% + 30%)
- En BACHILLERATO: Mostrar el PERIODO con 6 rubros (100% total)

### ✅ Para el Backend:

- Calcular promedio mensual normalizando a escala de 10
- Calcular promedio trimestral usando los 3 bloques
- NO normalizar las actividades ni el examen en el trimestre
- Guardar todos los promedios intermedios (mensuales, trimestrales, periodos)

---

## 6️⃣ NOTA ANUAL

### BÁSICA:

```
Nota Anual = (Trimestre1 + Trimestre2 + Trimestre3) / 3
```

### BACHILLERATO:

```
Nota Anual = (Periodo1 + Periodo2 + Periodo3 + Periodo4) / 4
```

---

## 7️⃣ TRANSPARENCIA

El sistema debe mostrar:

- ✅ Desglose por rubro
- ✅ Desglose por mes (BÁSICA)
- ✅ Desglose por trimestre/periodo
- ✅ Nota anual
- ✅ Qué rubros se programaron y cuáles no
- ✅ Qué evaluaciones faltan

---

Esta es la especificación oficial del sistema de evaluación del colegio.
