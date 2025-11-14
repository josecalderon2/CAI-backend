# 📄 ESTRUCTURA DE REPORTE DETALLADO PARA PADRES

## 🎯 Endpoint

```
GET /reportes-notas/boleta/alumno/:id/detalle
```

### Parámetros

| Parámetro   | Tipo   | Requerido | Descripción                                |
| ----------- | ------ | --------- | ------------------------------------------ |
| `id`        | number | ✅ Sí     | ID del alumno                              |
| `anio`      | string | ❌ No     | Año académico (default: 2025)              |
| `trimestre` | number | ❌ No\*   | Trimestre (1-3) - **Solo para BÁSICA**     |
| `periodo`   | number | ❌ No\*   | Periodo (1-4) - **Solo para BACHILLERATO** |

> **Nota:** Debes enviar `trimestre` O `periodo`, no ambos. Depende del nivel del alumno.

### ⚡ Cálculo Automático de Promedios

**El endpoint calcula los promedios en tiempo real** basándose en las evaluaciones y sus porcentajes. No requiere que los promedios estén precalculados en la base de datos.

**Fórmula utilizada:**

```
Promedio Asignatura = Σ(nota × porcentaje) / Σ(porcentajes)
Promedio General = Σ(promedios asignaturas) / cantidad asignaturas
```

Solo se incluyen evaluaciones que tengan nota registrada.

---

## 📊 Estructura de Respuesta JSON

```typescript
{
  // 👤 INFORMACIÓN DEL ALUMNO
  alumno: {
    id_alumno: number;           // ID único del alumno
    nombre: string;               // Nombre del alumno
    apellido: string;             // Apellido del alumno
    codigo: string;               // Código/carnet del alumno
  };

  // 🎓 INFORMACIÓN DEL CURSO
  curso: {
    id_curso: number;             // ID del curso
    nombre: string;               // Ej: "1° Básico A", "1° Bachillerato Técnico"
    nivel: string;                // "PRIMARIA" | "SECUNDARIA" | "BACHILLERATO"
    es_bachillerato: boolean;     // true si es bachillerato, false si es básica
  };

  // 📅 PERIODO ACADÉMICO
  periodo_academico: {
    anio: string;                 // Ej: "2025"
    trimestre: number | null;     // 1, 2, 3 (null si es bachillerato)
    periodo: number | null;       // 1, 2, 3, 4 (null si es básica)
    nombre: string;               // Ej: "Trimestre 1" o "Periodo 2"
  };

  // 📚 ASIGNATURAS CON TODAS SUS EVALUACIONES
  asignaturas: [
    {
      id_asignatura: number;      // ID de la asignatura
      nombre: string;             // Ej: "Matemáticas", "Ciencias Naturales"
      orientador: string | null;  // "Juan Pérez" (nombre completo del orientador)

      // 📝 TODAS LAS EVALUACIONES DEL TRIMESTRE/PERIODO
      evaluaciones: [
        {
          id_evaluacion: number;        // ID de la evaluación
          nombre: string;               // Ej: "TAREA - Mes 1 (T1)"
          tipo: string;                 // "TAREA" | "LABORATORIO" | "EXAMEN" | etc.
          porcentaje: number;           // Porcentaje de esta evaluación (ej: 15)
          trimestre: number | null;     // 1, 2, 3 (si es básica)
          periodo: number | null;       // 1, 2, 3, 4 (si es bachillerato)
          mes: number | null;           // 1-9 (si es evaluación mensual)
          nota: number | null;          // 0.0 - 10.0 (null si no tiene nota)
          fecha_registro: Date | null;  // Fecha cuando se registró la nota
        }
      ];

      // 📊 PROMEDIO DE LA ASIGNATURA EN ESTE PERIODO/TRIMESTRE
      promedio_periodo: number | null;  // Promedio calculado (0.0 - 10.0)
    }
  ];

  // 🎯 PROMEDIO GENERAL DEL PERIODO/TRIMESTRE
  promedio_general_periodo: number | null;  // Promedio de todas las asignaturas

  // ⚠️ CONDUCTAS REGISTRADAS EN EL PERIODO
  conductas: {
    total: number;                      // Cantidad total de infracciones
    puntos_acumulados: number;          // Suma de puntos de todas las infracciones
    detalles: [
      {
        id_conducta: number;            // ID de la conducta
        fecha: Date;                    // Fecha de la infracción
        observacion: string;            // Descripción de lo ocurrido
        orientador: string | null;      // "Juan Pérez" (quien registró)
        infraccion: {
          categoria: string;            // "MUY_GRAVE" | "GRAVE" | "MENOS_GRAVE"
          articulo: string;             // Ej: "MG-001"
          descripcion: string;          // Descripción de la infracción
          puntos: number;               // Puntos asignados (1-5)
        }
      }
    ]
  };

  // 📅 ASISTENCIA (TODO EL AÑO, NO FILTRADA POR PERIODO)
  asistencia: {
    total_registros: number;            // Total de días registrados
    presentes: number;                  // Días presente (P)
    ausentes: number;                   // Días ausente (A)
    tardanzas: number;                  // Días con tardanza (T)
    porcentaje_asistencia: number | null;  // % de asistencia (0-100)
  };
}
```

---

## 📋 EJEMPLO DE RESPUESTA COMPLETA

### Para BÁSICA (Primaria/Secundaria) - Trimestre 1

```json
{
  "alumno": {
    "id_alumno": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "codigo": "ALU2025001"
  },
  "curso": {
    "id_curso": 1,
    "nombre": "1° Básico A",
    "nivel": "PRIMARIA",
    "es_bachillerato": false
  },
  "periodo_academico": {
    "anio": "2025",
    "trimestre": 1,
    "periodo": null,
    "nombre": "Trimestre 1"
  },
  "asignaturas": [
    {
      "id_asignatura": 4,
      "nombre": "Ciencias Naturales",
      "orientador": "María López",
      "evaluaciones": [
        {
          "id_evaluacion": 123,
          "nombre": "TAREA - Mes 1 (T1)",
          "tipo": "TAREA",
          "porcentaje": 15,
          "trimestre": 1,
          "periodo": null,
          "mes": 1,
          "nota": 8.5,
          "fecha_registro": "2025-02-15T10:30:00.000Z"
        },
        {
          "id_evaluacion": 124,
          "nombre": "LABORATORIO - Mes 1 (T1)",
          "tipo": "LABORATORIO",
          "porcentaje": 20,
          "trimestre": 1,
          "periodo": null,
          "mes": 1,
          "nota": 9.0,
          "fecha_registro": "2025-02-20T14:00:00.000Z"
        },
        {
          "id_evaluacion": 125,
          "nombre": "REVISION CUADERNO - Mes 1 (T1)",
          "tipo": "REVISION_CUADERNO",
          "porcentaje": 10,
          "trimestre": 1,
          "periodo": null,
          "mes": 1,
          "nota": 10.0,
          "fecha_registro": "2025-02-25T09:00:00.000Z"
        },
        {
          "id_evaluacion": 126,
          "nombre": "TAREA - Mes 2 (T1)",
          "tipo": "TAREA",
          "porcentaje": 15,
          "trimestre": 1,
          "periodo": null,
          "mes": 2,
          "nota": 7.5,
          "fecha_registro": "2025-03-10T11:00:00.000Z"
        },
        {
          "id_evaluacion": 130,
          "nombre": "ACTIVIDAD INTEGRADORA (T1)",
          "tipo": "ACTIVIDAD_INTEGRADORA",
          "porcentaje": 25,
          "trimestre": 1,
          "periodo": null,
          "mes": null,
          "nota": 9.5,
          "fecha_registro": "2025-04-01T10:00:00.000Z"
        },
        {
          "id_evaluacion": 131,
          "nombre": "EXAMEN TRIMESTRAL (T1)",
          "tipo": "EXAMEN",
          "porcentaje": 30,
          "trimestre": 1,
          "periodo": null,
          "mes": null,
          "nota": 8.0,
          "fecha_registro": "2025-04-05T08:00:00.000Z"
        }
      ],
      "promedio_periodo": 8.63
    },
    {
      "id_asignatura": 5,
      "nombre": "Matemáticas",
      "orientador": "Carlos Rodríguez",
      "evaluaciones": [
        {
          "id_evaluacion": 140,
          "nombre": "TAREA - Mes 1 (T1)",
          "tipo": "TAREA",
          "porcentaje": 15,
          "trimestre": 1,
          "periodo": null,
          "mes": 1,
          "nota": 9.0,
          "fecha_registro": "2025-02-16T10:30:00.000Z"
        },
        {
          "id_evaluacion": 141,
          "nombre": "EXAMEN TRIMESTRAL (T1)",
          "tipo": "EXAMEN",
          "porcentaje": 30,
          "trimestre": 1,
          "periodo": null,
          "mes": null,
          "nota": null,
          "fecha_registro": null
        }
      ],
      "promedio_periodo": 8.85
    }
  ],
  "promedio_general_periodo": 8.74,
  "conductas": {
    "total": 2,
    "puntos_acumulados": 3,
    "detalles": [
      {
        "id_conducta": 5,
        "fecha": "2025-03-15T00:00:00.000Z",
        "observacion": "Llegó tarde 3 veces en la semana",
        "orientador": "María López",
        "infraccion": {
          "categoria": "MENOS_GRAVE",
          "articulo": "MG-005",
          "descripcion": "Impuntualidad reiterada",
          "puntos": 1
        }
      },
      {
        "id_conducta": 8,
        "fecha": "2025-03-20T00:00:00.000Z",
        "observacion": "No entregó tarea de matemáticas",
        "orientador": "Carlos Rodríguez",
        "infraccion": {
          "categoria": "MENOS_GRAVE",
          "articulo": "MG-010",
          "descripcion": "Incumplimiento de tareas",
          "puntos": 2
        }
      }
    ]
  },
  "asistencia": {
    "total_registros": 45,
    "presentes": 40,
    "ausentes": 3,
    "tardanzas": 2,
    "porcentaje_asistencia": 88.89
  }
}
```

### Para BACHILLERATO - Periodo 2

```json
{
  "alumno": {
    "id_alumno": 15,
    "nombre": "Ana",
    "apellido": "González",
    "codigo": "BACH2025015"
  },
  "curso": {
    "id_curso": 10,
    "nombre": "1° Bachillerato Técnico",
    "nivel": "BACHILLERATO",
    "es_bachillerato": true
  },
  "periodo_academico": {
    "anio": "2025",
    "trimestre": null,
    "periodo": 2,
    "nombre": "Periodo 2"
  },
  "asignaturas": [
    {
      "id_asignatura": 20,
      "nombre": "Física",
      "orientador": "Roberto Martínez",
      "evaluaciones": [
        {
          "id_evaluacion": 200,
          "nombre": "TAREA (P2)",
          "tipo": "TAREA",
          "porcentaje": 10,
          "trimestre": null,
          "periodo": 2,
          "mes": null,
          "nota": 8.5,
          "fecha_registro": "2025-05-10T10:00:00.000Z"
        },
        {
          "id_evaluacion": 201,
          "nombre": "LABORATORIO (P2)",
          "tipo": "LABORATORIO",
          "porcentaje": 15,
          "trimestre": null,
          "periodo": 2,
          "mes": null,
          "nota": 9.0,
          "fecha_registro": "2025-05-15T14:00:00.000Z"
        },
        {
          "id_evaluacion": 202,
          "nombre": "ACTIVIDAD INTEGRADORA (P2)",
          "tipo": "ACTIVIDAD_INTEGRADORA",
          "porcentaje": 20,
          "trimestre": null,
          "periodo": 2,
          "mes": null,
          "nota": 8.0,
          "fecha_registro": "2025-05-20T11:00:00.000Z"
        },
        {
          "id_evaluacion": 203,
          "nombre": "COEVALUACION (P2)",
          "tipo": "COEVALUACION",
          "porcentaje": 5,
          "trimestre": null,
          "periodo": 2,
          "mes": null,
          "nota": 9.5,
          "fecha_registro": "2025-05-22T09:00:00.000Z"
        },
        {
          "id_evaluacion": 204,
          "nombre": "EXAMEN PARCIAL (P2)",
          "tipo": "EXAMEN_PARCIAL",
          "porcentaje": 25,
          "trimestre": null,
          "periodo": 2,
          "mes": null,
          "nota": 7.5,
          "fecha_registro": "2025-05-25T08:00:00.000Z"
        },
        {
          "id_evaluacion": 205,
          "nombre": "EXAMEN DE PERIODO (P2)",
          "tipo": "EXAMEN_PERIODO",
          "porcentaje": 25,
          "trimestre": null,
          "periodo": 2,
          "mes": null,
          "nota": 8.2,
          "fecha_registro": "2025-05-30T08:00:00.000Z"
        }
      ],
      "promedio_periodo": 8.28
    }
  ],
  "promedio_general_periodo": 8.28,
  "conductas": {
    "total": 0,
    "puntos_acumulados": 0,
    "detalles": []
  },
  "asistencia": {
    "total_registros": 50,
    "presentes": 48,
    "ausentes": 1,
    "tardanzas": 1,
    "porcentaje_asistencia": 96.0
  }
}
```

---

## 🎨 EJEMPLOS DE LLAMADAS

### Básica - Obtener Trimestre 1 de un alumno

```bash
GET http://localhost:3000/reportes-notas/boleta/alumno/1/detalle?anio=2025&trimestre=1
Authorization: Bearer <TOKEN>
```

### Básica - Obtener Trimestre 2

```bash
GET http://localhost:3000/reportes-notas/boleta/alumno/1/detalle?trimestre=2
Authorization: Bearer <TOKEN>
```

### Bachillerato - Obtener Periodo 3

```bash
GET http://localhost:3000/reportes-notas/boleta/alumno/15/detalle?periodo=3
Authorization: Bearer <TOKEN>
```

---

## 🖼️ CÓMO USAR EN EL FRONTEND

### 1️⃣ Detectar el tipo de reporte según el curso

```typescript
// Detectar si es bachillerato o básica
const esBachillerato = responseData.curso.es_bachillerato;

// Mostrar selector correcto
if (esBachillerato) {
  // Mostrar dropdown de periodos (1, 2, 3, 4)
  <Select>
    <Option value={1}>Periodo 1</Option>
    <Option value={2}>Periodo 2</Option>
    <Option value={3}>Periodo 3</Option>
    <Option value={4}>Periodo 4</Option>
  </Select>
} else {
  // Mostrar dropdown de trimestres (1, 2, 3)
  <Select>
    <Option value={1}>Trimestre 1</Option>
    <Option value={2}>Trimestre 2</Option>
    <Option value={3}>Trimestre 3</Option>
  </Select>
}
```

### 2️⃣ Hacer la petición según la selección

```typescript
const fetchReporteDetallado = async (
  alumnoId: number,
  periodoSeleccionado: number,
) => {
  const esBachillerato = alumno.curso.es_bachillerato;

  const params = new URLSearchParams({
    anio: '2025',
  });

  if (esBachillerato) {
    params.append('periodo', periodoSeleccionado.toString());
  } else {
    params.append('trimestre', periodoSeleccionado.toString());
  }

  const response = await fetch(
    `${API_URL}/reportes-notas/boleta/alumno/${alumnoId}/detalle?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return await response.json();
};
```

### 3️⃣ Mostrar las asignaturas y evaluaciones

```typescript
// Iterar sobre cada asignatura
responseData.asignaturas.map((asignatura) => (
  <div key={asignatura.id_asignatura}>
    <h3>{asignatura.nombre}</h3>
    <p>Orientador: {asignatura.orientador}</p>

    {/* Tabla de evaluaciones */}
    <table>
      <thead>
        <tr>
          <th>Evaluación</th>
          <th>Tipo</th>
          <th>Porcentaje</th>
          <th>Nota</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {asignatura.evaluaciones.map((evaluacion) => (
          <tr key={evaluacion.id_evaluacion}>
            <td>{evaluacion.nombre}</td>
            <td>{evaluacion.tipo}</td>
            <td>{evaluacion.porcentaje}%</td>
            <td>
              {evaluacion.nota !== null
                ? evaluacion.nota.toFixed(2)
                : 'Pendiente'}
            </td>
            <td>
              {evaluacion.fecha_registro
                ? new Date(evaluacion.fecha_registro).toLocaleDateString()
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Promedio de la asignatura */}
    <p>
      <strong>Promedio: </strong>
      {asignatura.promedio_periodo?.toFixed(2) || 'N/A'}
    </p>
  </div>
))
```

### 4️⃣ Mostrar promedio general y resúmenes

```typescript
// Promedio general del periodo
<div className="promedio-general">
  <h2>Promedio General del {responseData.periodo_academico.nombre}</h2>
  <p className="promedio-grande">
    {responseData.promedio_general_periodo?.toFixed(2) || 'N/A'}
  </p>
</div>

// Asistencia
<div className="asistencia">
  <h3>Asistencia</h3>
  <p>Presentes: {responseData.asistencia.presentes}</p>
  <p>Ausentes: {responseData.asistencia.ausentes}</p>
  <p>Tardanzas: {responseData.asistencia.tardanzas}</p>
  <p>Porcentaje: {responseData.asistencia.porcentaje_asistencia}%</p>
</div>

// Conducta
<div className="conducta">
  <h3>Conducta</h3>
  <p>Total de infracciones: {responseData.conductas.total}</p>
  <p>Puntos acumulados: {responseData.conductas.puntos_acumulados}</p>

  {responseData.conductas.detalles.map((conducta) => (
    <div key={conducta.id_conducta} className="infraccion">
      <p><strong>Fecha:</strong> {new Date(conducta.fecha).toLocaleDateString()}</p>
      <p><strong>Categoría:</strong> {conducta.infraccion.categoria}</p>
      <p><strong>Descripción:</strong> {conducta.infraccion.descripcion}</p>
      <p><strong>Puntos:</strong> {conducta.infraccion.puntos}</p>
      <p><strong>Observación:</strong> {conducta.observacion}</p>
    </div>
  ))}
</div>
```

---

## ✅ VALIDACIONES A IMPLEMENTAR EN FRONTEND

1. **Validar nivel del alumno**: No permitir seleccionar trimestre si es bachillerato
2. **Mostrar "Pendiente"**: Cuando `nota` sea `null`
3. **Resaltar notas bajas**: Notas < 6.0 en rojo
4. **Ordenar evaluaciones**: Por fecha o por tipo
5. **Calcular estadísticas**:
   - Total de evaluaciones
   - Evaluaciones pendientes (nota = null)
   - Evaluaciones aprobadas/reprobadas

---

## 🎯 CASOS DE USO

### 👨‍🏫 Para Orientadores

```typescript
// 1. Seleccionar alumno
// 2. Seleccionar periodo/trimestre
// 3. Generar reporte
// 4. Imprimir o exportar PDF para entregar a padres
```

### 👨‍👩‍👧‍👦 Para Padres (en portal web)

```typescript
// 1. Login de padre
// 2. Ver lista de hijos
// 3. Seleccionar hijo
// 4. Ver reporte del trimestre/periodo actual automáticamente
// 5. Poder cambiar a periodos anteriores
```

---

## 📦 TIPOS TYPESCRIPT PARA FRONTEND

```typescript
interface ReporteDetalladoAlumno {
  alumno: {
    id_alumno: number;
    nombre: string;
    apellido: string;
    codigo: string;
  };
  curso: {
    id_curso: number;
    nombre: string;
    nivel: 'PRIMARIA' | 'SECUNDARIA' | 'BACHILLERATO';
    es_bachillerato: boolean;
  };
  periodo_academico: {
    anio: string;
    trimestre: number | null;
    periodo: number | null;
    nombre: string;
  };
  asignaturas: Asignatura[];
  promedio_general_periodo: number | null;
  conductas: {
    total: number;
    puntos_acumulados: number;
    detalles: Conducta[];
  };
  asistencia: {
    total_registros: number;
    presentes: number;
    ausentes: number;
    tardanzas: number;
    porcentaje_asistencia: number | null;
  };
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  orientador: string | null;
  evaluaciones: Evaluacion[];
  promedio_periodo: number | null;
}

interface Evaluacion {
  id_evaluacion: number;
  nombre: string;
  tipo: string;
  porcentaje: number;
  trimestre: number | null;
  periodo: number | null;
  mes: number | null;
  nota: number | null;
  fecha_registro: Date | null;
}

interface Conducta {
  id_conducta: number;
  fecha: Date;
  observacion: string;
  orientador: string | null;
  infraccion: {
    categoria: 'MUY_GRAVE' | 'GRAVE' | 'MENOS_GRAVE';
    articulo: string;
    descripcion: string;
    puntos: number;
  };
}
```

---

## 🚀 PRÓXIMOS PASOS

- [ ] Implementar exportación a PDF del reporte
- [ ] Agregar gráficas de rendimiento por asignatura
- [ ] Comparar promedio del alumno vs promedio del curso
- [ ] Agregar comentarios del orientador por asignatura
- [ ] Permitir firma digital del padre al recibir el reporte
