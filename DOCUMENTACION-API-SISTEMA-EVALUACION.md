# 📚 Documentación API - Sistema de Evaluación Dual (Básica + Bachillerato)

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Niveles Educativos](#niveles-educativos)
4. [Endpoints Principales](#endpoints-principales)
5. [Tipos de Respuesta](#tipos-de-respuesta)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Casos de Uso Comunes](#casos-de-uso-comunes)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🎯 Introducción

El sistema de evaluación soporta dos niveles educativos diferentes con sus propias reglas de cálculo:

### BÁSICA (1º - 9º grado)

- **3 trimestres** por año académico
- **Fórmula**: (Actividades × 70%) + (Examen Mensual × 30%)
- **Ponderación mensual variable**: Febrero 28%, Marzo 27%, Abril 45% (por trimestre)

### BACHILLERATO (1º - 2º año)

- **4 periodos** por año académico
- **Fórmula**: 6 componentes evaluativos
  - Actividades Integradoras: 25%
  - Tareas: 5%
  - Coevaluación: 5%
  - Laboratorios: 10%
  - Examen Parcial: 25%
  - Examen del Periodo: 30%
- **Ponderación equitativa**: 25% cada periodo

---

## 🏗️ Arquitectura del Sistema

El sistema utiliza **Strategy Pattern** para adaptarse automáticamente al nivel educativo:

```
┌─────────────────┐
│   Asignatura    │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Curso  │
    └────┬───┘
         │
         ▼
┌─────────────────┐
│ Grado Académico │──► nivel_educativo: BASICA | BACHILLERATO
└─────────────────┘
```

**El backend detecta automáticamente el nivel educativo** al recibir el `id_asignatura`, por lo que el frontend **NO necesita enviar el nivel explícitamente**.

---

## 📊 Niveles Educativos

### BASICA

```json
{
  "nivel": "BASICA",
  "numeroPeriodos": 3,
  "componentesEvaluacion": [
    {
      "nombre": "Actividades de Aprendizaje",
      "porcentaje": 0.7,
      "descripcion": "Promedio de todas las actividades registradas"
    },
    {
      "nombre": "Examen Mensual",
      "porcentaje": 0.3,
      "descripcion": "Examen único del mes"
    }
  ],
  "tiposActividad": [
    { "id": 1, "nombre": "Tarea" },
    { "id": 2, "nombre": "Revisión de libros y cuadernos" },
    { "id": 3, "nombre": "Laboratorio escrito" },
    { "id": 4, "nombre": "Investigación" }
  ]
}
```

### BACHILLERATO

```json
{
  "nivel": "BACHILLERATO",
  "numeroPeriodos": 4,
  "componentesEvaluacion": [
    {
      "nombre": "Actividades Integradoras",
      "porcentaje": 0.25,
      "categorias": ["ACTIVIDAD_INTEGRADORA"]
    },
    {
      "nombre": "Tarea",
      "porcentaje": 0.05,
      "categorias": ["TAREA"]
    },
    {
      "nombre": "Coevaluación",
      "porcentaje": 0.05,
      "categorias": ["COEVALUACION"]
    },
    {
      "nombre": "Laboratorio/Práctico",
      "porcentaje": 0.1,
      "categorias": ["LABORATORIO"]
    },
    {
      "nombre": "Examen Parcial",
      "porcentaje": 0.25
    },
    {
      "nombre": "Examen del Periodo",
      "porcentaje": 0.3
    }
  ],
  "tiposActividad": [
    {
      "id": 5,
      "nombre": "Actividad Integradora",
      "categoria": "ACTIVIDAD_INTEGRADORA"
    },
    {
      "id": 6,
      "nombre": "Proyecto Integrador",
      "categoria": "ACTIVIDAD_INTEGRADORA"
    },
    { "id": 7, "nombre": "Tarea Bachillerato", "categoria": "TAREA" },
    { "id": 8, "nombre": "Tarea de Investigación", "categoria": "TAREA" },
    { "id": 9, "nombre": "Coevaluación", "categoria": "COEVALUACION" },
    { "id": 10, "nombre": "Autoevaluación", "categoria": "COEVALUACION" },
    {
      "id": 11,
      "nombre": "Evaluación entre pares",
      "categoria": "COEVALUACION"
    },
    {
      "id": 12,
      "nombre": "Laboratorio Bachillerato",
      "categoria": "LABORATORIO"
    },
    { "id": 13, "nombre": "Práctica de Campo", "categoria": "LABORATORIO" },
    { "id": 14, "nombre": "Experimento", "categoria": "LABORATORIO" },
    { "id": 15, "nombre": "Demostración Práctica", "categoria": "LABORATORIO" }
  ]
}
```

---

## 🔌 Endpoints Principales

### 1. Obtener Configuración de Evaluación

**GET** `/sistema-evaluacion/configuracion-evaluacion/:id_asignatura`

Retorna la configuración completa del sistema de evaluación para una asignatura específica.

**Parámetros:**

- `id_asignatura` (number) - ID de la asignatura

**Respuesta:**

```typescript
{
  nivel: 'BASICA' | 'BACHILLERATO';
  numeroPeriodos: number;
  componentesEvaluacion: Array<{
    nombre: string;
    porcentaje: number;
    categorias?: string[];
    descripcion?: string;
  }>;
  tiposActividad: Array<{
    id: number;
    nombre: string;
    categoria?: string;
  }>;
}
```

**Ejemplo de uso:**

```javascript
// Obtener configuración antes de mostrar formulario de registro
const response = await fetch('/sistema-evaluacion/configuracion-evaluacion/6');
const config = await response.json();

if (config.nivel === 'BACHILLERATO') {
  // Mostrar campos adicionales: examen_parcial, categorías de actividades
  mostrarCampoExamenParcial();
  cargarActividadesPorCategoria(config.tiposActividad);
} else {
  // Básica: formulario simple
  mostrarFormularioBasico(config.tiposActividad);
}
```

---

### 2. Registrar Nota Mensual/Periodo

**POST** `/sistema-evaluacion/nota-mensual`

Registra las actividades y exámenes de un alumno en una asignatura para un mes/periodo específico.

**Body:**

```typescript
{
  id_alumno: number;
  id_asignatura: number;
  mes: string; // BÁSICA: "Febrero"-"Octubre" | BACHILLERATO: "Periodo 1"-"Periodo 4"
  trimestre: number; // BÁSICA: 1-3 | BACHILLERATO: 1-4
  anio_academico: string; // "2025"
  actividades: Array<{
    id_tipo_actividad: number;
    numero_actividad?: number | null;
    nota: number; // 0-10
  }>;
  examen_mensual: number; // 0-10
  examen_parcial?: number; // 0-10 (solo Bachillerato)
}
```

**Respuesta:**

```typescript
{
  id_alumno: number;
  id_asignatura: number;
  mes: string;
  trimestre: number;
  anio_academico: string;
  actividades: Array<{
    id_tipo_actividad: number;
    tipo_actividad_nombre: string;
    numero_actividad: number | null;
    nombre_completo: string;
    nota: number;
  }>;
  examen_mensual: number;
  examen_parcial?: number; // Solo si aplica
  promedio_puro_actividades: number;
  promedio_70_actividades: number; // Aporte de actividades
  promedio_30_examen: number; // Aporte de examen
  nota_mensual: number; // Nota final del periodo
  porcentaje_aporte_trimestre: number; // Decimal 0.25, 0.28, etc.
  aporte_al_trimestre: number; // nota_mensual × porcentaje_aporte
  fecha_registro: string; // ISO date
}
```

**Ejemplos:**

#### Básica (Febrero, Trimestre 1)

```javascript
const notaBasica = await fetch('/sistema-evaluacion/nota-mensual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_alumno: 1,
    id_asignatura: 2, // Asignatura de Básica
    mes: 'Febrero',
    trimestre: 1,
    anio_academico: '2025',
    actividades: [
      { id_tipo_actividad: 1, numero_actividad: 1, nota: 8.5 }, // Tarea 1
      { id_tipo_actividad: 2, numero_actividad: 1, nota: 9.0 }, // Revisión
    ],
    examen_mensual: 8.8,
    // NO incluir examen_parcial
  }),
}).then((r) => r.json());

// Respuesta:
// {
//   nota_mensual: 8.765,
//   aporte_al_trimestre: 2.45,  // 8.765 × 0.28
//   porcentaje_aporte_trimestre: 0.28
// }
```

#### Bachillerato (Periodo 1)

```javascript
const notaBachillerato = await fetch('/sistema-evaluacion/nota-mensual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_alumno: 2,
    id_asignatura: 6, // Asignatura de Bachillerato
    mes: 'Periodo 1',
    trimestre: 1,
    anio_academico: '2025',
    actividades: [
      { id_tipo_actividad: 5, numero_actividad: 1, nota: 8.5 }, // Act. Integradora
      { id_tipo_actividad: 7, numero_actividad: 1, nota: 9.0 }, // Tarea
      { id_tipo_actividad: 9, numero_actividad: 1, nota: 8.0 }, // Coevaluación
      { id_tipo_actividad: 12, numero_actividad: 1, nota: 8.7 }, // Laboratorio
    ],
    examen_mensual: 8.8, // Examen del periodo (30%)
    examen_parcial: 9.0, // ⚠️ OBLIGATORIO para Bachillerato (25%)
  }),
}).then((r) => r.json());

// Respuesta:
// {
//   nota_mensual: 8.735,
//   aporte_al_trimestre: 2.18,  // 8.735 × 0.25
//   porcentaje_aporte_trimestre: 0.25
// }
```

**⚠️ Validaciones importantes:**

- **BÁSICA**: Debe incluir al menos 1 actividad + 1 examen mensual
- **BACHILLERATO**: Debe incluir:
  - Al menos 1 actividad de cada categoría (4 categorías diferentes)
  - examen_mensual (obligatorio)
  - examen_parcial (obligatorio)

---

### 3. Consolidado Mensual del Alumno (Boleta)

**GET** `/sistema-evaluacion/consolidado-mensual-alumno/:id_alumno`

**🎯 Endpoint adaptativo**: Retorna formato diferente según el nivel educativo de cada asignatura.

**Query Parameters:**

- `mes` (string) - Nombre del mes o periodo
- `trimestre` (number) - Número del trimestre/periodo
- `anio_academico` (string) - Año académico

**Respuesta:**

```typescript
{
  alumno: {
    id: number;
    nombre_completo: string;
    curso: string;
  }
  periodo: {
    mes: string;
    trimestre: number;
    anio_academico: string;
    porcentaje_aporte: number; // Decimal 0.25, 0.28, etc.
  }
  resumen: {
    total_asignaturas: number;
    asignaturas_evaluadas: number;
    promedio_general: number;
  }
  asignaturas: Array<AsignaturaBasica | AsignaturaBachillerato>;
}
```

#### Formato Asignatura BÁSICA

```typescript
{
  id_asignatura: number;
  nombre: string;
  nivel: 'BASICA';
  nota_mensual: number;
  aporte_al_trimestre: number;
  tiene_nota: boolean;

  // Desglose simple
  actividades: Array<{
    tipo: string;
    numero: number | null;
    nota: number;
  }>;
  examen_mensual: number;
  promedio_actividades: number;
  calculo: {
    promedio_70_actividades: number;
    promedio_30_examen: number;
  }
}
```

#### Formato Asignatura BACHILLERATO

```typescript
{
  id_asignatura: number;
  nombre: string;
  nivel: "BACHILLERATO";
  nota_mensual: number;
  aporte_al_periodo: number;
  tiene_nota: boolean;

  // Desglose por componentes
  componentes: {
    actividades_integradoras: {
      actividades: Array<{tipo: string; numero: number | null; nota: number}>;
      promedio: number;
      peso: 0.25;
      aporte: number; // promedio × peso
    };
    tareas: {
      actividades: Array<...>;
      promedio: number;
      peso: 0.05;
      aporte: number;
    };
    coevaluaciones: {
      actividades: Array<...>;
      promedio: number;
      peso: 0.05;
      aporte: number;
    };
    laboratorios: {
      actividades: Array<...>;
      promedio: number;
      peso: 0.1;
      aporte: number;
    };
    examen_parcial: {
      nota: number;
      peso: 0.25;
      aporte: number;
    };
    examen_periodo: {
      nota: number;
      peso: 0.3;
      aporte: number;
    };
  };
}
```

**Ejemplo de uso:**

```javascript
const consolidado = await fetch(
  '/sistema-evaluacion/consolidado-mensual-alumno/2?mes=Periodo 1&trimestre=1&anio_academico=2025',
).then((r) => r.json());

// Renderizar según nivel
consolidado.asignaturas.forEach((asignatura) => {
  if (asignatura.nivel === 'BASICA') {
    renderBoletaBasica(asignatura);
  } else if (asignatura.nivel === 'BACHILLERATO') {
    renderBoletaBachillerato(asignatura);
  }
});
```

---

### 4. Reporte Trimestral de una Asignatura

**GET** `/sistema-evaluacion/reporte-trimestral-alumno/:id_alumno/:id_asignatura`

Muestra el desglose completo de un trimestre/periodo con todas las notas mensuales.

**Query Parameters:**

- `trimestre` (number)
- `anio_academico` (string)

**Respuesta:**

```typescript
{
  alumno: {
    id: number;
    nombre_completo: string;
  }
  asignatura: {
    id: number;
    nombre: string;
    nivel: 'BASICA' | 'BACHILLERATO';
  }
  trimestre: number;
  anio_academico: string;

  meses: Array<{
    mes: string;
    nota_mensual: number;
    porcentaje_aporte: number;
    aporte: number;
    tiene_nota: boolean;
  }>;

  nota_trimestral: number;
  estado: 'APROBADO' | 'REPROBADO' | 'PENDIENTE';
}
```

---

### 5. Calcular Nota Trimestral/Anual

**POST** `/sistema-evaluacion/nota-trimestral`

Calcula y registra la nota final de un trimestre/periodo.

**Body:**

```typescript
{
  id_alumno: number;
  id_asignatura: number;
  trimestre: number; // 1-3 para Básica, 1-4 para Bachillerato
  anio_academico: string;
}
```

**Respuesta:**

```typescript
{
  id_alumno: number;
  id_asignatura: number;
  trimestre: number;
  anio_academico: string;
  nota_trimestral: number; // Suma de aportes mensuales
  estado: 'APROBADO' | 'REPROBADO';
  meses_evaluados: Array<{
    mes: string;
    nota: number;
    aporte: number;
  }>;
}
```

---

## 💡 Casos de Uso Comunes

### Caso 1: Formulario de Registro Adaptativo

```javascript
// 1. Obtener configuración al cargar el formulario
async function inicializarFormulario(idAsignatura) {
  const config = await fetch(
    `/sistema-evaluacion/configuracion-evaluacion/${idAsignatura}`,
  ).then((r) => r.json());

  // 2. Adaptar UI según nivel
  if (config.nivel === 'BACHILLERATO') {
    // Mostrar selector de categorías
    const categorias = {
      ACTIVIDAD_INTEGRADORA: config.tiposActividad.filter(
        (t) => t.categoria === 'ACTIVIDAD_INTEGRADORA',
      ),
      TAREA: config.tiposActividad.filter((t) => t.categoria === 'TAREA'),
      COEVALUACION: config.tiposActividad.filter(
        (t) => t.categoria === 'COEVALUACION',
      ),
      LABORATORIO: config.tiposActividad.filter(
        (t) => t.categoria === 'LABORATORIO',
      ),
    };

    renderCategoriasActividades(categorias);
    mostrarCampoExamenParcial(); // Campo adicional

    // Validación: al menos 1 actividad por categoría
    validarMinimoUnaActividadPorCategoria();
  } else {
    // Básica: lista simple de actividades
    renderListaActividades(config.tiposActividad);
    ocultarCampoExamenParcial();
  }
}
```

### Caso 2: Renderizar Boleta

```javascript
function renderBoleta(asignatura) {
  if (asignatura.nivel === 'BASICA') {
    return `
      <div class="boleta-basica">
        <h3>${asignatura.nombre}</h3>
        <p>Nota: ${asignatura.nota_mensual}</p>
        
        <h4>Actividades (70%)</h4>
        <ul>
          ${asignatura.actividades
            .map(
              (act) => `
            <li>${act.tipo} ${act.numero ? act.numero : ''}: ${act.nota}</li>
          `,
            )
            .join('')}
        </ul>
        <p>Promedio: ${asignatura.promedio_actividades}</p>
        
        <h4>Examen Mensual (30%)</h4>
        <p>${asignatura.examen_mensual}</p>
        
        <div class="calculo">
          <p>70% Actividades: ${asignatura.calculo.promedio_70_actividades}</p>
          <p>30% Examen: ${asignatura.calculo.promedio_30_examen}</p>
          <p><strong>Total: ${asignatura.nota_mensual}</strong></p>
        </div>
      </div>
    `;
  } else if (asignatura.nivel === 'BACHILLERATO') {
    return `
      <div class="boleta-bachillerato">
        <h3>${asignatura.nombre}</h3>
        <p>Nota: ${asignatura.nota_mensual}</p>
        
        ${Object.entries(asignatura.componentes)
          .map(
            ([key, comp]) => `
          <div class="componente">
            <h4>${formatNombreComponente(key)} (${comp.peso * 100}%)</h4>
            ${
              comp.actividades
                ? `
              <ul>
                ${comp.actividades
                  .map(
                    (act) => `
                  <li>${act.tipo} ${act.numero || ''}: ${act.nota}</li>
                `,
                  )
                  .join('')}
              </ul>
              <p>Promedio: ${comp.promedio}</p>
            `
                : `
              <p>Nota: ${comp.nota}</p>
            `
            }
            <p><strong>Aporte: ${comp.aporte}</strong></p>
          </div>
        `,
          )
          .join('')}
        
        <div class="total">
          <p><strong>Nota del Periodo: ${asignatura.nota_mensual}</strong></p>
        </div>
      </div>
    `;
  }
}

function formatNombreComponente(key) {
  const nombres = {
    actividades_integradoras: 'Actividades Integradoras',
    tareas: 'Tareas',
    coevaluaciones: 'Coevaluación',
    laboratorios: 'Laboratorios',
    examen_parcial: 'Examen Parcial',
    examen_periodo: 'Examen del Periodo',
  };
  return nombres[key] || key;
}
```

### Caso 3: Validación Pre-Submit

```javascript
async function validarFormularioNota(data) {
  // 1. Obtener configuración
  const config = await fetch(
    `/sistema-evaluacion/configuracion-evaluacion/${data.id_asignatura}`,
  ).then((r) => r.json());

  const errores = [];

  if (config.nivel === 'BACHILLERATO') {
    // Validar examen parcial
    if (!data.examen_parcial) {
      errores.push('El examen parcial es obligatorio para Bachillerato');
    }

    // Validar al menos 1 actividad por categoría
    const categorias = new Set();
    data.actividades.forEach((act) => {
      const tipo = config.tiposActividad.find(
        (t) => t.id === act.id_tipo_actividad,
      );
      if (tipo) categorias.add(tipo.categoria);
    });

    const categoriasRequeridas = [
      'ACTIVIDAD_INTEGRADORA',
      'TAREA',
      'COEVALUACION',
      'LABORATORIO',
    ];
    categoriasRequeridas.forEach((cat) => {
      if (!categorias.has(cat)) {
        errores.push(`Falta registrar actividad de tipo: ${cat}`);
      }
    });
  }

  // Validar rango de notas
  if (data.examen_mensual < 0 || data.examen_mensual > 10) {
    errores.push('La nota del examen debe estar entre 0 y 10');
  }

  return errores;
}
```

---

## ⚠️ Manejo de Errores

### Errores de Validación (400)

```json
{
  "message": [
    "El examen parcial es obligatorio para Bachillerato",
    "Debe registrar actividades de las 4 categorías requeridas"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Errores de Negocio

**Actividades inválidas:**

```json
{
  "message": "Actividades inválidas: Debe registrar al menos 1 actividad de cada categoría: ACTIVIDAD_INTEGRADORA, TAREA, COEVALUACION, LABORATORIO",
  "statusCode": 400
}
```

**Exámenes faltantes:**

```json
{
  "message": "Exámenes inválidos: Debe registrar el examen parcial",
  "statusCode": 400
}
```

### Errores Not Found (404)

```json
{
  "message": "El alumno no tiene una inscripción activa para el año 2025",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 📝 Notas Importantes

### 1. Detección Automática del Nivel

- ✅ El backend detecta automáticamente el nivel educativo
- ❌ NO enviar campo `nivel` en las peticiones
- ✅ Solo enviar `id_asignatura`

### 2. Formato de Meses

- **BÁSICA**: "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre"
- **BACHILLERATO**: "Periodo 1", "Periodo 2", "Periodo 3", "Periodo 4"

### 3. Periodos vs Trimestres

- **BÁSICA**: 3 trimestres (campo `trimestre`: 1-3)
- **BACHILLERATO**: 4 periodos (campo `trimestre`: 1-4) - Sí, el campo se llama `trimestre` pero en Bachillerato representa periodos

### 4. Porcentajes

- Todos los porcentajes se retornan como **decimales** (0.25 = 25%, 0.30 = 30%)
- Para mostrar en UI: `(porcentaje * 100).toFixed(0) + '%'`

### 5. Actividades en Bachillerato

- Las actividades DEBEN tener `categoria_bachillerato` asociada
- Usar solo IDs de tipos de actividad 5-15 (Bachillerato)
- Cada categoría debe tener al menos 1 actividad registrada

### 6. Un Alumno = Un Curso Activo

- Un alumno solo debe tener 1 curso ACTIVO por año académico
- Si aparecen múltiples cursos, el sistema toma el primero encontrado

---

## 🔗 URLs de Ejemplo

### Base URL

```
http://localhost:3000/sistema-evaluacion
```

### Ejemplos completos

1. **Configuración de Básica**:

   ```
   GET /configuracion-evaluacion/2
   ```

2. **Configuración de Bachillerato**:

   ```
   GET /configuracion-evaluacion/6
   ```

3. **Registrar nota Básica**:

   ```
   POST /nota-mensual
   Body: {id_alumno: 1, id_asignatura: 2, mes: "Febrero", ...}
   ```

4. **Registrar nota Bachillerato**:

   ```
   POST /nota-mensual
   Body: {id_alumno: 2, id_asignatura: 6, mes: "Periodo 1", examen_parcial: 9.0, ...}
   ```

5. **Consolidado mensual**:

   ```
   GET /consolidado-mensual-alumno/1?mes=Febrero&trimestre=1&anio_academico=2025
   ```

6. **Reporte trimestral**:
   ```
   GET /reporte-trimestral-alumno/1/2?trimestre=1&anio_academico=2025
   ```

---

## 📞 Soporte

Para dudas o problemas con la integración, contactar al equipo de backend.

**Última actualización**: Noviembre 2025
**Versión**: 2.0 (Sistema Dual)
