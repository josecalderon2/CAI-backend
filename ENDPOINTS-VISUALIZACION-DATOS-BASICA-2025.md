# 📊 ENDPOINTS PARA VISUALIZACIÓN DE DATOS - BÁSICA 2025

**Fecha:** 9 de noviembre de 2025  
**Sistema:** BÁSICA 2025 con promedios calculados

---

## 🎯 ENDPOINTS DISPONIBLES PARA EL FRONTEND

### **1️⃣ Obtener Formato de Evaluación (Estructura de Componentes)**

```http
GET /sistema-evaluacion/formato-evaluacion/asignatura/:id
```

**Descripción:** Devuelve la estructura completa de componentes del sistema BÁSICA 2025.

**Ejemplo:**

```bash
curl http://localhost:3000/sistema-evaluacion/formato-evaluacion/asignatura/1
```

**Respuesta:**

```json
{
  "nivel": "BASICA",
  "asignatura": {
    "id": 1,
    "nombre": "Matemática",
    "curso": "5to Grado",
    "grado": "Quinto"
  },
  "componentes": [
    {
      "nombre": "Tareas (Mensual)",
      "porcentaje": 5,
      "tipo": "ACTIVIDAD",
      "periodo": "MENSUAL",
      "permite_multiples": true,
      "descripcion": "Asignaciones regulares..."
    },
    {
      "nombre": "Revisión de libros y cuadernos (Mensual)",
      "porcentaje": 15,
      "tipo": "ACTIVIDAD",
      "periodo": "MENSUAL",
      "permite_multiples": false
    },
    {
      "nombre": "Laboratorio escrito (Mensual)",
      "porcentaje": 15,
      "tipo": "ACTIVIDAD",
      "periodo": "MENSUAL",
      "permite_multiples": true
    },
    {
      "nombre": "Actividad Integradora (Trimestral)",
      "porcentaje": 25,
      "tipo": "ACTIVIDAD",
      "periodo": "TRIMESTRAL",
      "permite_multiples": false
    },
    {
      "nombre": "Autoevaluación (Trimestral)",
      "porcentaje": 10,
      "tipo": "ACTIVIDAD",
      "periodo": "TRIMESTRAL",
      "permite_multiples": false
    },
    {
      "nombre": "Examen (Trimestral)",
      "porcentaje": 30,
      "tipo": "EXAMEN",
      "periodo": "TRIMESTRAL",
      "permite_multiples": false
    }
  ],
  "calculo": {
    "formula": "MENSUAL (35%) + TRIMESTRAL (65%)",
    "subtotales": [
      {
        "categoria": "MENSUAL",
        "porcentaje": 35,
        "componentes": ["Tareas", "Revisión", "Laboratorio"]
      },
      {
        "categoria": "TRIMESTRAL",
        "porcentaje": 65,
        "componentes": ["Actividad Integradora", "Autoevaluación", "Examen"]
      }
    ]
  }
}
```

**Uso en el frontend:**

```typescript
// Al cargar el formulario
const response = await fetch(
  '/sistema-evaluacion/formato-evaluacion/asignatura/1',
);
const formatoData = await response.json();

// Validar que es BÁSICA 2025
if (formatoData.nivel === 'BASICA' && formatoData.componentes) {
  // ✅ Renderizar formulario con los 6 componentes
  formatoData.componentes.forEach((componente) => {
    if (componente.permite_multiples) {
      // Crear campo para agregar múltiples entradas
    } else {
      // Crear campo de entrada única
    }
  });
}
```

---

### **2️⃣ Consultar Notas Simplificadas (Listar Todas las Notas)**

```http
GET /sistema-evaluacion/notas/simplificadas?alumno_id={id}&asignatura_id={id}&mes={mes}&anio={anio}
```

**Descripción:** Obtiene TODAS las notas registradas con filtros opcionales.

**Parámetros:**

- `alumno_id` (opcional): ID del alumno
- `asignatura_id` (opcional): ID de la asignatura
- `mes` (opcional): Mes numérico (1-12)
- `trimestre` (opcional): Número de trimestre (1-3)
- `anio` (opcional): Año (2025)

**Ejemplo:**

```bash
# Todas las notas de un alumno en una asignatura en noviembre
curl "http://localhost:3000/sistema-evaluacion/notas/simplificadas?alumno_id=1&asignatura_id=1&mes=11&anio=2025"
```

**Respuesta:**

```json
[
  {
    "id_nota_mensual": 1,
    "id_alumno": 1,
    "id_asignatura": 1,
    "alumno": {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "asignatura": {
      "nombre": "Matemática"
    },
    "mes_numerico": 11,
    "mes_nombre": "Noviembre",
    "trimestre": 3,
    "anio": 2025,
    "actividades": [
      {
        "id_actividad_evaluacion": 1,
        "id_tipo_actividad": 1,
        "tipo_actividad_nombre": "Tareas (Mensual)",
        "numero_actividad": 1,
        "nota": 8.5,
        "nombre_completo": "Tareas (Mensual) 1"
      },
      {
        "id_actividad_evaluacion": 2,
        "id_tipo_actividad": 1,
        "tipo_actividad_nombre": "Tareas (Mensual)",
        "numero_actividad": 2,
        "nota": 9.0,
        "nombre_completo": "Tareas (Mensual) 2"
      },
      // ... más tareas
      {
        "id_actividad_evaluacion": 8,
        "id_tipo_actividad": 2,
        "tipo_actividad_nombre": "Revisión de libros y cuadernos (Mensual)",
        "numero_actividad": null,
        "nota": 9.0,
        "nombre_completo": "Revisión de libros y cuadernos (Mensual)"
      }
    ],
    "examen_mensual": 0,
    "examen_parcial": null,
    "promedio_puro_actividades": 8.5,
    "promedio_70_actividades": 5.95,
    "promedio_30_examen": 0,
    "nota_mensual": 5.95,
    "porcentaje_aporte": 35,
    "aporte_al_trimestre": 2.08,
    "fecha_registro": "2025-11-09T10:00:00.000Z",
    "actualizado_en": "2025-11-09T10:00:00.000Z"
  }
]
```

**⚠️ IMPORTANTE:** Este endpoint devuelve el formato VIEJO (70% actividades + 30% examen).

**Cómo calcular promedios por componente manualmente:**

```typescript
// Agrupar actividades por tipo
const actividadesPorTipo = {};

notasData.actividades.forEach((act) => {
  if (!actividadesPorTipo[act.tipo_actividad_nombre]) {
    actividadesPorTipo[act.tipo_actividad_nombre] = [];
  }
  actividadesPorTipo[act.tipo_actividad_nombre].push(act.nota);
});

// Calcular promedios
const promedios = {};
for (const [tipo, notas] of Object.entries(actividadesPorTipo)) {
  const suma = notas.reduce((a, b) => a + b, 0);
  promedios[tipo] = suma / notas.length;
}

// Ejemplo de salida:
// {
//   "Tareas (Mensual)": 8.5,
//   "Revisión de libros y cuadernos (Mensual)": 9.0,
//   "Laboratorio escrito (Mensual)": 9.0
// }
```

---

### **3️⃣ Consolidado Mensual del Alumno**

```http
GET /sistema-evaluacion/consolidado-mensual-alumno/:id_alumno?mes={mes}&trimestre={trimestre}&anio_academico={anio}
```

**Descripción:** Devuelve todas las asignaturas del alumno con sus notas mensuales.

**Parámetros:**

- `mes`: Nombre del mes ("Febrero", "Noviembre", etc.)
- `trimestre`: Número de trimestre (1-3)
- `anio_academico`: Año académico ("2025")

**Ejemplo:**

```bash
curl "http://localhost:3000/sistema-evaluacion/consolidado-mensual-alumno/1?mes=Noviembre&trimestre=3&anio_academico=2025"
```

**Respuesta:**

```json
{
  "alumno": {
    "id": 1,
    "nombre_completo": "Juan Pérez",
    "curso": "5to Grado"
  },
  "periodo": {
    "mes": "Noviembre",
    "trimestre": 3,
    "anio_academico": "2025",
    "porcentaje_aporte": 0.35
  },
  "resumen": {
    "total_asignaturas": 8,
    "asignaturas_evaluadas": 5,
    "promedio_general": 8.5
  },
  "asignaturas": [
    {
      "id_asignatura": 1,
      "nombre": "Matemática",
      "nivel": "BASICA",
      "nota_mensual": 8.5,
      "aporte_al_trimestre": 2.98,
      "tiene_nota": true,
      "actividades": [
        {
          "tipo": "Tareas (Mensual)",
          "numero": 1,
          "nota": 8.5
        },
        {
          "tipo": "Tareas (Mensual)",
          "numero": 2,
          "nota": 9.0
        }
      ],
      "examen_mensual": 0,
      "promedio_actividades": 8.5,
      "calculo": {
        "promedio_70_actividades": 5.95,
        "promedio_30_examen": 0
      }
    },
    {
      "id_asignatura": 2,
      "nombre": "Lenguaje",
      "nota_mensual": 0,
      "aporte_al_trimestre": 0,
      "tiene_nota": false
    }
  ]
}
```

**⚠️ NOTA:** También usa formato viejo, pero puedes extraer las actividades individuales.

---

## 🔧 ALTERNATIVA: CALCULAR PROMEDIOS EN EL FRONTEND

Dado que los endpoints actuales usan el cálculo viejo (70%/30%), la mejor opción es **calcular los promedios en el frontend** cuando los datos son ingresados.

### **Flujo Recomendado:**

```typescript
// 1. Obtener formato de evaluación
const formato = await fetch(
  '/sistema-evaluacion/formato-evaluacion/asignatura/1',
).then((r) => r.json());

// 2. Cuando el usuario ingresa notas, guardarlas una por una
async function guardarNota(tipo_actividad, nota, mes, anio, periodo) {
  await fetch('/sistema-evaluacion/notas/simplificadas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asignatura_id: 1,
      alumno_id: 1,
      tipo_actividad: tipo_actividad, // "Tareas (Mensual)"
      nota: nota, // 8.5
      mes: mes, // 11
      anio: anio, // 2025
      periodo: periodo, // 3
    }),
  });
}

// 3. Mantener un estado local con todas las notas ingresadas
const notasLocales = {
  'Tareas (Mensual)': [8.5, 9.0, 7.5, 9.5, 8.0],
  'Revisión de libros y cuadernos (Mensual)': [9.0],
  'Laboratorio escrito (Mensual)': [8.5, 9.5],
  'Actividad Integradora (Trimestral)': [9.5],
  'Autoevaluación (Trimestral)': [8.0],
  'Examen (Trimestral)': [9.0],
};

// 4. Calcular promedios en tiempo real
function calcularPromediosYSubtotales(notasLocales, formato) {
  const componentesConPromedios = formato.componentes.map((comp) => {
    const notasDelComponente = notasLocales[comp.nombre] || [];

    // Calcular promedio
    const promedio =
      notasDelComponente.length > 0
        ? notasDelComponente.reduce((a, b) => a + b, 0) /
          notasDelComponente.length
        : 0;

    // Calcular aporte
    const aporte = promedio * (comp.porcentaje / 100);

    return {
      ...comp,
      notas: notasDelComponente,
      cantidad: notasDelComponente.length,
      promedio: Math.round(promedio * 100) / 100,
      aporte: Math.round(aporte * 100) / 100,
    };
  });

  // Calcular subtotales
  const subtotal_mensual = componentesConPromedios
    .filter((c) => c.periodo === 'MENSUAL')
    .reduce((sum, c) => sum + c.aporte, 0);

  const subtotal_trimestral = componentesConPromedios
    .filter((c) => c.periodo === 'TRIMESTRAL')
    .reduce((sum, c) => sum + c.aporte, 0);

  const nota_final = subtotal_mensual + subtotal_trimestral;

  return {
    componentes: componentesConPromedios,
    subtotal_mensual: Math.round(subtotal_mensual * 100) / 100,
    subtotal_trimestral: Math.round(subtotal_trimestral * 100) / 100,
    nota_final: Math.round(nota_final * 100) / 100,
  };
}

// 5. Usar en el render
const calculos = calcularPromediosYSubtotales(notasLocales, formato);

console.log(calculos);
/*
{
  componentes: [
    {
      nombre: "Tareas (Mensual)",
      porcentaje: 5,
      periodo: "MENSUAL",
      notas: [8.5, 9.0, 7.5, 9.5, 8.0],
      cantidad: 5,
      promedio: 8.5,
      aporte: 0.43
    },
    // ... otros componentes
  ],
  subtotal_mensual: 3.13,
  subtotal_trimestral: 5.88,
  nota_final: 9.01
}
*/
```

---

## 📱 COMPONENTE REACT EJEMPLO

```typescript
import React, { useState, useEffect } from 'react';

function NotasBasica2025({ alumnoId, asignaturaId, mes, anio, periodo }) {
  const [formato, setFormato] = useState(null);
  const [notasLocales, setNotasLocales] = useState({});
  const [calculos, setCalculos] = useState(null);

  // 1. Cargar formato al montar
  useEffect(() => {
    fetch(`/sistema-evaluacion/formato-evaluacion/asignatura/${asignaturaId}`)
      .then(r => r.json())
      .then(data => {
        if (data.nivel === 'BASICA' && data.componentes) {
          setFormato(data);

          // Inicializar notasLocales
          const inicial = {};
          data.componentes.forEach(comp => {
            inicial[comp.nombre] = [];
          });
          setNotasLocales(inicial);
        }
      });
  }, [asignaturaId]);

  // 2. Recalcular cuando cambien las notas
  useEffect(() => {
    if (formato && notasLocales) {
      const nuevosCalculos = calcularPromediosYSubtotales(notasLocales, formato);
      setCalculos(nuevosCalculos);
    }
  }, [notasLocales, formato]);

  // 3. Agregar nota
  async function agregarNota(nombreComponente, nota) {
    // Guardar en backend
    await fetch('/sistema-evaluacion/notas/simplificadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asignatura_id: asignaturaId,
        alumno_id: alumnoId,
        tipo_actividad: nombreComponente,
        nota: nota,
        mes: mes,
        anio: anio,
        periodo: periodo
      })
    });

    // Actualizar estado local
    setNotasLocales(prev => ({
      ...prev,
      [nombreComponente]: [...prev[nombreComponente], nota]
    }));
  }

  // 4. Renderizar
  if (!formato || !calculos) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Evaluación BÁSICA 2025</h2>

      {/* Sección Mensual */}
      <section>
        <h3>Componentes Mensuales (35%)</h3>
        {calculos.componentes
          .filter(c => c.periodo === 'MENSUAL')
          .map(comp => (
            <ComponenteInput
              key={comp.nombre}
              componente={comp}
              onAgregarNota={(nota) => agregarNota(comp.nombre, nota)}
            />
          ))}
        <div>
          <strong>Subtotal Mensual: {calculos.subtotal_mensual}</strong>
        </div>
      </section>

      {/* Sección Trimestral */}
      <section>
        <h3>Componentes Trimestrales (65%)</h3>
        {calculos.componentes
          .filter(c => c.periodo === 'TRIMESTRAL')
          .map(comp => (
            <ComponenteInput
              key={comp.nombre}
              componente={comp}
              onAgregarNota={(nota) => agregarNota(comp.nombre, nota)}
            />
          ))}
        <div>
          <strong>Subtotal Trimestral: {calculos.subtotal_trimestral}</strong>
        </div>
      </section>

      {/* Nota Final */}
      <div style={{ marginTop: '20px', fontSize: '24px' }}>
        <strong>NOTA FINAL: {calculos.nota_final} / 10.0</strong>
      </div>
    </div>
  );
}

function calcularPromediosYSubtotales(notasLocales, formato) {
  // ... (código de arriba)
}
```

---

## ✅ RESUMEN

| Endpoint                                 | Propósito                            | Formato Notas                                        |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `GET /formato-evaluacion/asignatura/:id` | Obtener estructura de componentes    | ✅ BÁSICA 2025                                       |
| `POST /notas/simplificadas`              | Guardar nota individual              | ✅ Compatible                                        |
| `GET /notas/simplificadas`               | Listar todas las notas               | ⚠️ Formato viejo (usar para leer notas individuales) |
| `GET /consolidado-mensual-alumno/:id`    | Ver todas las asignaturas del alumno | ⚠️ Formato viejo                                     |

**Recomendación Final:**

1. Usa `GET /formato-evaluacion/asignatura/:id` para obtener la estructura
2. Usa `POST /notas/simplificadas` para guardar cada nota
3. **Calcula los promedios y subtotales en el frontend** en tiempo real
4. Muestra la nota final calculada al usuario antes de guardar

De esta forma tienes control total sobre los cálculos y la visualización. ✅
