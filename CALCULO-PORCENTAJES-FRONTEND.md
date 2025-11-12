# 🎯 GUÍA DE CÁLCULO DE EVALUACIONES - FRONTEND

## Basado en el documento oficial del colegio

---

## 🎓 BÁSICA - Sistema de 2 Niveles

### Nivel 1: PROMEDIO MENSUAL (normalizado a escala de 10)

### Nivel 2: PROMEDIO TRIMESTRAL (usa los 3 meses + evaluaciones trimestrales)

---

## 📊 NIVEL 1: PROMEDIO MENSUAL

### ✅ SÍ puedes mostrar cada MES como 100%

Cada mes tiene 3 rubros que suman 35%, pero se **normalizan a escala de 10**:

```
PromMes = (0.05·Tareas + 0.15·Revisión + 0.15·Lab) / 0.35
```

La división entre 0.35 convierte el 35% a escala de 10.

### Ejemplo de cálculo mensual:

```
AGOSTO (normalizado a escala de 10):
  Tareas: 8.2
  Revisión: 8.2
  Laboratorio: 8.2

  Cálculo:
  PromAgosto = (0.05×8.2 + 0.15×8.2 + 0.15×8.2) / 0.35
             = (0.41 + 1.23 + 1.23) / 0.35
             = 2.87 / 0.35
             = 8.2 ✅
```

### 🎨 Cómo mostrar en el Frontend - Nivel Mensual:

**Opción 1: Mostrar porcentajes normalizados (recomendado)**

```
AGOSTO (escala de 10):
  Tareas (14.3%): 8.2
  Revisión (42.9%): 8.2
  Laboratorio (42.9%): 8.2

  Promedio del mes: 8.2
```

Los porcentajes mostrados son: 5/35 = 14.3%, 15/35 = 42.9%

**Opción 2: Mostrar contribución**

```
AGOSTO:
  Tareas: 8.2 → contribuye 0.41
  Revisión: 8.2 → contribuye 1.23
  Laboratorio: 8.2 → contribuye 1.23

  Promedio: 8.2
```

---

## 📊 NIVEL 2: PROMEDIO TRIMESTRAL

### ⚠️ El TRIMESTRE tiene 3 bloques que suman 100%

| Bloque      | Peso     | Componentes                                        |
| ----------- | -------- | -------------------------------------------------- |
| Meses       | 35%      | Promedio ponderado de 3 meses                      |
| Actividades | 35%      | Actividad Integradora (25%) + Autoevaluación (10%) |
| Examen      | 30%      | Examen Trimestral                                  |
| **TOTAL**   | **100%** |                                                    |

### 🧮 Fórmula Trimestral:

**Paso 1: Ponderar los 3 meses**

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

**Paso 2: Calcular el Trimestre**

```
Trimestre = 0.35·Meses + 0.25·ActInteg + 0.10·Autoeval + 0.30·Examen
```

### ✅ Ejemplo Completo - Trimestre 1:

```
PROMEDIOS MENSUALES:
  Febrero: 8.2
  Marzo: 8.6
  Abril: 9.0

EVALUACIONES TRIMESTRALES:
  Actividad Integradora: 9.5
  Autoevaluación: 10.0
  Examen Trimestral: 8.0

CÁLCULO:
  Paso 1 - Meses ponderados:
  Meses = 0.28×8.2 + 0.27×8.6 + 0.45×9.0
        = 2.296 + 2.322 + 4.050
        = 8.668

  Paso 2 - Trimestre:
  Trimestre = 0.35×8.668 + 0.25×9.5 + 0.10×10.0 + 0.30×8.0
            = 3.034 + 2.375 + 1.000 + 2.400
            = 8.809 ✅

VERIFICACIÓN:
  Porcentajes: 35% + 25% + 10% + 30% = 100% ✅
```

### 🎨 Cómo mostrar en el Frontend - Nivel Trimestral:

```
TRIMESTRE 1 (100%):

  Bloque Mensual (35%):
    Febrero (28%): 8.2 → contribuye 2.296
    Marzo (27%): 8.6 → contribuye 2.322
    Abril (45%): 9.0 → contribuye 4.050
    Subtotal: 8.668

  Bloque Actividades (35%):
    Actividad Integradora (25%): 9.5 → contribuye 2.375
    Autoevaluación (10%): 10.0 → contribuye 1.000
    Subtotal: 3.375

  Bloque Examen (30%):
    Examen Trimestral: 8.0 → contribuye 2.400

  PROMEDIO TRIMESTRE: 8.809
```

---

## 🎓 BACHILLERATO - Sistema Simple

### Un solo nivel: PROMEDIO POR PERIODO

Bachillerato tiene 4 periodos por año, cada uno con 6 rubros que suman 100%:

| Rubro                 | Peso     |
| --------------------- | -------- |
| Actividad Integradora | 25%      |
| Tareas                | 5%       |
| Coevaluación          | 5%       |
| Laboratorio           | 10%      |
| Examen Parcial        | 25%      |
| Examen del Periodo    | 30%      |
| **TOTAL**             | **100%** |

### 🧮 Fórmula:

```
Periodo = 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParc + 0.30·ExPer
```

### ✅ Ejemplo:

```
PERIODO 1:
  Actividad Integradora: 9.0 → 2.25
  Tareas: 8.7 → 0.435
  Coevaluación: 8.8 → 0.44
  Laboratorio: 8.8 → 0.88
  Examen Parcial: 7.5 → 1.875
  Examen del Periodo: 8.0 → 2.4

  PROMEDIO: 8.28
```

### 🎨 Cómo mostrar en el Frontend - Bachillerato:

```
PERIODO 1 (100%):
  Actividad Integradora (25%): 9.0
  Tareas (5%): 8.7
  Coevaluación (5%): 8.8
  Laboratorio (10%): 8.8
  Examen Parcial (25%): 7.5
  Examen del Periodo (30%): 8.0

  PROMEDIO: 8.28
```

---

## 🔑 DIFERENCIAS CLAVE - RESUMEN

| Aspecto                     | Mensual (Básica) | Trimestral (Básica) | Periodo (Bachillerato) |
| --------------------------- | ---------------- | ------------------- | ---------------------- |
| **Normalización**           | SÍ (35% → 10)    | NO                  | NO                     |
| **Puede mostrar como 100%** | SÍ               | NO                  | SÍ                     |
| **Estructura**              | 3 rubros         | 3 bloques           | 6 rubros               |
| **Campo "mes"**             | Requerido        | Usado para ponderar | No existe              |

---

## 💡 REGLAS PARA EL FRONTEND

### ✅ BÁSICA - Promedio Mensual:

1. **SÍ** puedes mostrar cada mes como 100% normalizado
2. Los rubros son: Tareas (14.3%), Revisión (42.9%), Laboratorio (42.9%)
3. O mostrar los pesos originales: Tareas (5%), Revisión (15%), Laboratorio (15%)

### ✅ BÁSICA - Promedio Trimestral:

1. **NO** agrupar por mes individual
2. **SÍ** mostrar los 3 bloques: Meses (35%), Actividades (35%), Examen (30%)
3. Dentro del bloque de Meses, mostrar los 3 meses ponderados (28%, 27%, 45%)
4. La suma TOTAL debe ser 100%

### ✅ BACHILLERATO - Promedio Periodo:

1. **SÍ** mostrar como 100%
2. Mostrar los 6 rubros con sus pesos
3. La suma TOTAL debe ser 100%

---

## 🚫 ERRORES COMUNES

### Error 1: En BÁSICA, pensar que cada MES es 35% del trimestre

```
❌ INCORRECTO:
Agosto: 35%
Septiembre: 35%
Octubre: 35%
TOTAL: 105%

✅ CORRECTO:
Bloque Mensual: 35% del trimestre
  - Agosto: 28% del bloque mensual (9.8% del trimestre)
  - Septiembre: 27% del bloque mensual (9.45% del trimestre)
  - Octubre: 45% del bloque mensual (15.75% del trimestre)
```

### Error 2: No normalizar el promedio mensual

```
❌ INCORRECTO:
PromMes = 0.05×8.2 + 0.15×8.2 + 0.15×8.2 = 2.87

✅ CORRECTO:
PromMes = (0.05×8.2 + 0.15×8.2 + 0.15×8.2) / 0.35 = 8.2
```

### Error 3: Confundir el nivel mensual con el nivel trimestral

```
El campo "mes" en las evaluaciones mensuales NO significa que cada mes sea un grupo independiente del trimestre.

Es solo una etiqueta para saber CUÁNDO se hizo la evaluación mensual.

En el nivel TRIMESTRAL, esos meses se ponderan juntos (28%-27%-45%).
```

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿El promedio mensual es 100%?**
R: Se normaliza a escala de 10, lo que equivale a 100%. Los rubros suman 35% pero se dividen entre 0.35.

**P: ¿Los 3 meses del trimestre suman 100%?**
R: NO. Los 3 meses ponderados aportan el 35% del trimestre. El otro 65% viene de Actividades (35%) y Examen (30%).

**P: ¿Qué significa el campo "mes" en las evaluaciones?**
R: En evaluaciones mensuales, indica el mes específico (2-10). En evaluaciones trimestrales, es NULL.

**P: ¿Cómo sé si estoy en nivel mensual o trimestral?**
R: Si la evaluación tiene campo "mes" lleno → nivel mensual. Si tiene "trimestre" pero mes=NULL → nivel trimestral.

**P: ¿El backend hace estos cálculos?**
R: Sí. Usa `POST /promedios/recalcular/{id}` para recalcular todos los promedios.

**P: ¿Puedo confiar en los cálculos del backend?**
R: Sí, el backend implementa exactamente las fórmulas del documento oficial.

---

## 🎯 CHECKLIST FINAL

- [ ] Entender que BÁSICA tiene 2 niveles (mensual + trimestral)
- [ ] Nivel mensual SÍ se normaliza a 100%
- [ ] Nivel trimestral usa 3 bloques que suman 100%
- [ ] BACHILLERATO solo tiene 1 nivel (periodo = 100%)
- [ ] El campo "mes" es solo informativo en el contexto trimestral
- [ ] Los porcentajes deben sumar siempre 100% en cada nivel
- [ ] Usar el endpoint del backend para obtener datos correctos

---

Esta guía refleja exactamente el sistema oficial del colegio según el documento operativo.
