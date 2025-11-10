# 📋 DATOS DE PRUEBA - FRONTEND BÁSICA 2025

**Fecha:** 9 de noviembre de 2025  
**Sistema:** BÁSICA 2025 (Mensual 35% + Trimestral 65%)

---

## 🎯 ESCENARIO DE PRUEBA COMPLETO

### **Alumno de Prueba:**

- **ID:** 1
- **Nombre:** Juan Pérez
- **Curso:** 5to Grado (Educación Básica)
- **Asignatura:** Matemática (ID: 1) o Lenguaje (ID: 2)

### **Periodo de Evaluación:**

- **Trimestre:** 3
- **Mes:** Noviembre (mes 11)
- **Año:** 2025

---

## 📝 CASO 1: INGRESO DE NOTAS MENSUALES (NOVIEMBRE)

### **Componentes Mensuales (35% del total)**

#### 1️⃣ **TAREAS (5%)** - Permite múltiples

```json
// Escenario: El alumno tiene 5 tareas en noviembre

Tarea 1: 8.5
Tarea 2: 9.0
Tarea 3: 7.5
Tarea 4: 9.5
Tarea 5: 8.0

✅ Promedio esperado: (8.5+9.0+7.5+9.5+8.0)/5 = 8.5
✅ Aporte al total: 8.5 × 5% = 0.425 (0.43 puntos)
```

**Datos para el frontend:**

```javascript
// Llamar el endpoint 5 veces (una por cada tarea)
const tareas = [
  { nota: 8.5, nombre: "Tarea 1" },
  { nota: 9.0, nombre: "Tarea 2" },
  { nota: 7.5, nombre: "Tarea 3" },
  { nota: 9.5, nombre: "Tarea 4" },
  { nota: 8.0, nombre: "Tarea 5" }
];

// Para cada tarea:
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Tareas (Mensual)",
  "nota": 8.5,  // Cambiar por cada nota
  "mes": 11,
  "anio": 2025,
  "periodo": 3
  // ✅ examen_mensual es OPCIONAL (se usa 0 por defecto)
}
```

#### 2️⃣ **REVISIÓN DE LIBROS Y CUADERNOS (15%)** - Una sola

```json
Revisión: 9.0

✅ Aporte al total: 9.0 × 15% = 1.35 (1.35 puntos)
```

**Datos para el frontend:**

```javascript
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Revisión de libros y cuadernos (Mensual)",
  "nota": 9.0,
  "mes": 11,
  "anio": 2025,
  "periodo": 3
}
```

#### 3️⃣ **LABORATORIO ESCRITO (15%)** - Permite múltiples

```json
// Escenario: 2 laboratorios en noviembre

Laboratorio 1: 8.5
Laboratorio 2: 9.5

✅ Promedio esperado: (8.5+9.5)/2 = 9.0
✅ Aporte al total: 9.0 × 15% = 1.35 (1.35 puntos)
```

**Datos para el frontend:**

```javascript
// Laboratorio 1
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Laboratorio escrito (Mensual)",
  "nota": 8.5,
  "mes": 11,
  "anio": 2025,
  "periodo": 3
}

// Laboratorio 2
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Laboratorio escrito (Mensual)",
  "nota": 9.5,
  "mes": 11,
  "anio": 2025,
  "periodo": 3
}
```

### **📊 SUBTOTAL MENSUAL ESPERADO:**

```
Tareas:     0.425
Revisión:   1.35
Laboratorio: 1.35
─────────────────
SUBTOTAL:   3.125 (31.25% de 10)
```

---

## 📝 CASO 2: INGRESO DE NOTAS TRIMESTRALES (TRIMESTRE 3)

### **Componentes Trimestrales (65% del total)**

#### 4️⃣ **ACTIVIDAD INTEGRADORA (25%)** - Una sola

```json
Actividad Integradora: 9.5

✅ Aporte al total: 9.5 × 25% = 2.375 (2.38 puntos)
```

**Datos para el frontend:**

```javascript
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Actividad Integradora (Trimestral)",
  "nota": 9.5,
  "mes": 10,  // Último mes del trimestre (Octubre)
  "anio": 2025,
  "periodo": 3
}
```

#### 5️⃣ **AUTOEVALUACIÓN (10%)** - Una sola

```json
Autoevaluación: 8.0

✅ Aporte al total: 8.0 × 10% = 0.80 (0.80 puntos)
```

**Datos para el frontend:**

```javascript
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Autoevaluación (Trimestral)",
  "nota": 8.0,
  "mes": 10,
  "anio": 2025,
  "periodo": 3
}
```

#### 6️⃣ **EXAMEN (30%)** - Una sola

```json
Examen: 9.0

✅ Aporte al total: 9.0 × 30% = 2.70 (2.70 puntos)
```

**Datos para el frontend:**

```javascript
POST /sistema-evaluacion/notas/simplificadas
{
  "asignatura_id": 1,
  "alumno_id": 1,
  "tipo_actividad": "Examen (Trimestral)",
  "nota": 9.0,
  "mes": 10,
  "anio": 2025,
  "periodo": 3
}
```

### **📊 SUBTOTAL TRIMESTRAL ESPERADO:**

```
Act. Integradora: 2.375
Autoevaluación:   0.80
Examen:           2.70
─────────────────────
SUBTOTAL:         5.875 (58.75% de 10)
```

---

## 🎯 RESULTADO FINAL ESPERADO

### **Cálculo Completo:**

```
═══════════════════════════════════════════════════════════
COMPONENTES MENSUALES (35%)
───────────────────────────────────────────────────────────
Tareas (5%):                 8.5 × 5%  = 0.425
Revisión (15%):              9.0 × 15% = 1.35
Laboratorio (15%):           9.0 × 15% = 1.35
                                        ───────
SUBTOTAL MENSUAL:                       3.125 ✅

═══════════════════════════════════════════════════════════
COMPONENTES TRIMESTRALES (65%)
───────────────────────────────────────────────────────────
Actividad Integradora (25%): 9.5 × 25% = 2.375
Autoevaluación (10%):        8.0 × 10% = 0.80
Examen (30%):                9.0 × 30% = 2.70
                                        ───────
SUBTOTAL TRIMESTRAL:                    5.875 ✅

═══════════════════════════════════════════════════════════
NOTA FINAL DEL PERIODO
───────────────────────────────────────────────────────────
Subtotal Mensual    + Subtotal Trimestral = NOTA FINAL
3.125 (31.25%)      + 5.875 (58.75%)      = 9.00 ✅
═══════════════════════════════════════════════════════════
```

### **✅ NOTA FINAL ESPERADA: 9.00 / 10.0**

---

## 🧪 SCRIPTS DE PRUEBA PARA TERMINAL

### **Script 1: Ingresar todas las notas**

```bash
#!/bin/bash
BASE_URL="http://localhost:3000"
ASIGNATURA=1
ALUMNO=1
MES=11
ANIO=2025
PERIODO=3

# Tareas (5 tareas)
curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Tareas (Mensual)",
    "nota": 8.5,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Tareas (Mensual)",
    "nota": 9.0,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Tareas (Mensual)",
    "nota": 7.5,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Tareas (Mensual)",
    "nota": 9.5,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Tareas (Mensual)",
    "nota": 8.0,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

# Revisión
curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Revisión de libros y cuadernos (Mensual)",
    "nota": 9.0,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

# Laboratorios (2 laboratorios)
curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Laboratorio escrito (Mensual)",
    "nota": 8.5,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Laboratorio escrito (Mensual)",
    "nota": 9.5,
    "mes": '$MES',
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

# Actividad Integradora
curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Actividad Integradora (Trimestral)",
    "nota": 9.5,
    "mes": 10,
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

# Autoevaluación
curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Autoevaluación (Trimestral)",
    "nota": 8.0,
    "mes": 10,
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

# Examen
curl -X POST "$BASE_URL/sistema-evaluacion/notas/simplificadas" \
  -H "Content-Type: application/json" \
  -d '{
    "asignatura_id": '$ASIGNATURA',
    "alumno_id": '$ALUMNO',
    "tipo_actividad": "Examen (Trimestral)",
    "nota": 9.0,
    "mes": 10,
    "anio": '$ANIO',
    "periodo": '$PERIODO'
  }'

echo "✅ Todas las notas ingresadas"
```

### **Script 2: Consultar notas ingresadas**

````bash
### **Script 2: Consultar notas ingresadas**
```bash
#!/bin/bash
BASE_URL="http://localhost:3000"
ASIGNATURA=1
ALUMNO=1
MES=11
ANIO=2025

echo "📋 Consultando notas mensuales..."
curl -s "$BASE_URL/sistema-evaluacion/notas/simplificadas?alumno_id=$ALUMNO&asignatura_id=$ASIGNATURA&mes=$MES&anio=$ANIO" | python3 -m json.tool
````

### **Script 3: Ver datos con promedios calculados (Frontend)**

```javascript
// Este script de JavaScript calcula los promedios y subtotales
// a partir de las notas guardadas

async function obtenerDatosConPromedios(alumnoId, asignaturaId, mes, anio) {
  // 1. Obtener formato
  const formatoResp = await fetch(
    `http://localhost:3000/sistema-evaluacion/formato-evaluacion/asignatura/${asignaturaId}`,
  );
  const formato = await formatoResp.json();

  // 2. Obtener notas guardadas
  const notasResp = await fetch(
    `http://localhost:3000/sistema-evaluacion/notas/simplificadas?alumno_id=${alumnoId}&asignatura_id=${asignaturaId}&mes=${mes}&anio=${anio}`,
  );
  const notasData = await notasResp.json();

  // 3. Agrupar notas por componente
  const notasPorComponente = {};

  if (notasData.length > 0) {
    notasData[0].actividades.forEach((act) => {
      const nombre = act.tipo_actividad_nombre;
      if (!notasPorComponente[nombre]) {
        notasPorComponente[nombre] = [];
      }
      notasPorComponente[nombre].push(act.nota);
    });
  }

  // 4. Calcular promedios y aportes
  const componentesConDatos = formato.componentes.map((comp) => {
    const notasDelComponente = notasPorComponente[comp.nombre] || [];

    const promedio =
      notasDelComponente.length > 0
        ? notasDelComponente.reduce((a, b) => a + b, 0) /
          notasDelComponente.length
        : 0;

    const aporte = promedio * (comp.porcentaje / 100);

    return {
      nombre: comp.nombre,
      porcentaje: comp.porcentaje,
      periodo: comp.periodo,
      notas: notasDelComponente,
      cantidad: notasDelComponente.length,
      promedio: Math.round(promedio * 100) / 100,
      aporte: Math.round(aporte * 100) / 100,
    };
  });

  // 5. Calcular subtotales
  const subtotal_mensual = componentesConDatos
    .filter((c) => c.periodo === 'MENSUAL')
    .reduce((sum, c) => sum + c.aporte, 0);

  const subtotal_trimestral = componentesConDatos
    .filter((c) => c.periodo === 'TRIMESTRAL')
    .reduce((sum, c) => sum + c.aporte, 0);

  const nota_final = subtotal_mensual + subtotal_trimestral;

  return {
    componentes: componentesConDatos,
    subtotal_mensual: Math.round(subtotal_mensual * 100) / 100,
    subtotal_trimestral: Math.round(subtotal_trimestral * 100) / 100,
    nota_final: Math.round(nota_final * 100) / 100,
  };
}

// Uso:
const datos = await obtenerDatosConPromedios(1, 1, 11, 2025);
console.log(JSON.stringify(datos, null, 2));

/*
Resultado esperado:
{
  "componentes": [
    {
      "nombre": "Tareas (Mensual)",
      "porcentaje": 5,
      "periodo": "MENSUAL",
      "notas": [8.5, 9.0, 7.5, 9.5, 8.0],
      "cantidad": 5,
      "promedio": 8.5,
      "aporte": 0.43
    },
    {
      "nombre": "Revisión de libros y cuadernos (Mensual)",
      "porcentaje": 15,
      "periodo": "MENSUAL",
      "notas": [9.0],
      "cantidad": 1,
      "promedio": 9.0,
      "aporte": 1.35
    },
    {
      "nombre": "Laboratorio escrito (Mensual)",
      "porcentaje": 15,
      "periodo": "MENSUAL",
      "notas": [8.5, 9.5],
      "cantidad": 2,
      "promedio": 9.0,
      "aporte": 1.35
    },
    {
      "nombre": "Actividad Integradora (Trimestral)",
      "porcentaje": 25,
      "periodo": "TRIMESTRAL",
      "notas": [9.5],
      "cantidad": 1,
      "promedio": 9.5,
      "aporte": 2.38
    },
    {
      "nombre": "Autoevaluación (Trimestral)",
      "porcentaje": 10,
      "periodo": "TRIMESTRAL",
      "notas": [8.0],
      "cantidad": 1,
      "promedio": 8.0,
      "aporte": 0.8
    },
    {
      "nombre": "Examen (Trimestral)",
      "porcentaje": 30,
      "periodo": "TRIMESTRAL",
      "notas": [9.0],
      "cantidad": 1,
      "promedio": 9.0,
      "aporte": 2.7
    }
  ],
  "subtotal_mensual": 3.13,
  "subtotal_trimestral": 5.88,
  "nota_final": 9.01
}
*/
```

````

---

## 📱 DATOS PARA EL FRONTEND (Copiar y Pegar)

### **Para el Formulario de Ingreso:**

**Paso 1: Seleccionar**

- Alumno ID: `1`
- Asignatura ID: `1` (Matemática) o `2` (Lenguaje)
- Mes: `11` (Noviembre)
- Año: `2025`
- Trimestre: `3`

**Paso 2: Sección MENSUALES**

| Componente  | Cantidad | Notas                   | Promedio |
| ----------- | -------- | ----------------------- | -------- |
| Tareas      | 5        | 8.5, 9.0, 7.5, 9.5, 8.0 | 8.5      |
| Revisión    | 1        | 9.0                     | 9.0      |
| Laboratorio | 2        | 8.5, 9.5                | 9.0      |

**Paso 3: Sección TRIMESTRALES**

| Componente            | Nota |
| --------------------- | ---- |
| Actividad Integradora | 9.5  |
| Autoevaluación        | 8.0  |
| Examen                | 9.0  |

---

## 🎯 QUÉ DEBE MOSTRAR EL FRONTEND

### **1. Al cargar el formulario:**

```javascript
// Llamada inicial
GET /sistema-evaluacion/formato-evaluacion/asignatura/1

// Debe mostrar:
✅ Nivel: "BASICA"
✅ 6 Componentes:
   - Tareas (Mensual) - 5% - Permite múltiples ✓
   - Revisión (Mensual) - 15%
   - Laboratorio (Mensual) - 15% - Permite múltiples ✓
   - Actividad Integradora (Trimestral) - 25%
   - Autoevaluación (Trimestral) - 10%
   - Examen (Trimestral) - 30%
````

### **2. Mientras ingresa notas:**

```
Tareas ingresadas: 5
├─ Tarea 1: 8.5 ✓
├─ Tarea 2: 9.0 ✓
├─ Tarea 3: 7.5 ✓
├─ Tarea 4: 9.5 ✓
└─ Tarea 5: 8.0 ✓
Promedio: 8.5
Aporte (5%): 0.425

Revisión: 9.0 ✓
Aporte (15%): 1.35

Laboratorios ingresados: 2
├─ Lab 1: 8.5 ✓
└─ Lab 2: 9.5 ✓
Promedio: 9.0
Aporte (15%): 1.35

──────────────────────
Subtotal Mensual (35%): 3.125
```

### **3. Al finalizar:**

```
════════════════════════════════════════
RESUMEN DE EVALUACIÓN - NOVIEMBRE 2025
════════════════════════════════════════

COMPONENTES MENSUALES (35%)
├─ Tareas (5 registradas)      8.5 → 0.43
├─ Revisión                    9.0 → 1.35
└─ Laboratorio (2 registrados) 9.0 → 1.35
                            SUBTOTAL: 3.13

COMPONENTES TRIMESTRALES (65%)
├─ Actividad Integradora      9.5 → 2.38
├─ Autoevaluación             8.0 → 0.80
└─ Examen                     9.0 → 2.70
                            SUBTOTAL: 5.88

════════════════════════════════════════
NOTA FINAL: 9.00 / 10.0 ✅
════════════════════════════════════════
```

---

## ⚠️ CASOS ESPECIALES A PROBAR

### **Caso A: Solo 1 tarea**

```json
Tarea 1: 9.0
Promedio: 9.0
Aporte: 9.0 × 5% = 0.45
```

### **Caso B: 7 tareas (máximo)**

```json
Tareas: [8.0, 8.5, 9.0, 7.5, 9.5, 8.0, 9.0]
Promedio: (8.0+8.5+9.0+7.5+9.5+8.0+9.0)/7 = 8.5
Aporte: 8.5 × 5% = 0.425
```

### **Caso C: Editar una tarea existente**

```javascript
// Cambiar Tarea 3 de 7.5 a 8.0
PATCH /sistema-evaluacion/notas/simplificadas/:id
{
  "nota": 8.0
}

// Nuevo promedio: (8.5+9.0+8.0+9.5+8.0)/5 = 8.6
// Nuevo aporte: 8.6 × 5% = 0.43
```

---

## 🔍 ENDPOINTS PARA VERIFICAR

1. **Obtener formato:**

   ```
   GET /sistema-evaluacion/formato-evaluacion/asignatura/1
   ```

2. **Consultar notas guardadas:**

   ```
   GET /sistema-evaluacion/notas/simplificadas?alumno_id=1&mes=11&anio=2025
   ```

3. **Ver consolidado mensual:**
   ```
   GET /sistema-evaluacion/consolidado-mensual-alumno/1?mes=11&anio=2025&trimestre=3
   ```

---

## ✅ CHECKLIST DE PRUEBAS

- [ ] Frontend carga sin error "no usa BÁSICA 2025"
- [ ] Se muestran los 6 componentes correctamente
- [ ] Se pueden agregar múltiples tareas
- [ ] Se calcula el promedio de tareas en tiempo real
- [ ] Se pueden agregar múltiples laboratorios
- [ ] Componentes únicos solo permiten 1 entrada
- [ ] Subtotal mensual = 3.125
- [ ] Subtotal trimestral = 5.875
- [ ] Nota final = 9.00
- [ ] Se pueden editar notas guardadas
- [ ] Se pueden eliminar notas antes de guardar

---

**¡Listo para probar! 🚀**
