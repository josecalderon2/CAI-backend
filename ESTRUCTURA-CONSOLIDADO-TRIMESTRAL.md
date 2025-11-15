# Estructura del Consolidado Trimestral con Detalle

## Endpoint: Consolidado por Curso (CON DETALLE DE ALUMNOS)

**Ruta:** `GET /asistencia/resumen/trimestral-consolidado`

**Query Parameters:**

- `cursoId` (requerido): ID del curso
- `anio` (opcional): Año académico (YYYY). Default: año actual

**Roles permitidos:** `Orientador`, `Admin`, `P.A`

### Estructura de Respuesta

```typescript
{
  cursoId: number;
  anio: string;
  trimestres: Array<{
    trimestre: 1 | 2 | 3;
    P: number; // Total de Presentes en el curso
    E: number; // Total de Excusados en el curso
    SP: number; // Total de Sin Permiso en el curso
    A: number; // Total de Ausentes en el curso
    total_registros: number;
    porcentaje_asistencia: number; // (P + E) / total_registros * 100
    alumnos: Array<{
      // 🆕 DETALLE POR ALUMNO
      id_alumno: number;
      nombre: string;
      apellido: string;
      P: number; // Presentes del alumno en este trimestre
      E: number; // Excusados del alumno en este trimestre
      SP: number; // Sin Permiso del alumno en este trimestre
      A: number; // Ausentes del alumno en este trimestre
      total_registros: number;
      porcentaje_asistencia: number;
    }>;
  }>;
  totales: {
    P: number;
    E: number;
    SP: number;
    A: number;
    total_registros: number;
    porcentaje_asistencia: number;
  }
}
```

### Ejemplo de Respuesta

```json
{
  "cursoId": 12,
  "anio": "2025",
  "trimestres": [
    {
      "trimestre": 1,
      "P": 240,
      "E": 15,
      "SP": 8,
      "A": 5,
      "total_registros": 268,
      "porcentaje_asistencia": 95.15,
      "alumnos": [
        {
          "id_alumno": 101,
          "nombre": "Ana",
          "apellido": "Pérez",
          "P": 38,
          "E": 2,
          "SP": 1,
          "A": 1,
          "total_registros": 42,
          "porcentaje_asistencia": 95.24
        },
        {
          "id_alumno": 102,
          "nombre": "Carlos",
          "apellido": "Ramírez",
          "P": 40,
          "E": 1,
          "SP": 0,
          "A": 1,
          "total_registros": 42,
          "porcentaje_asistencia": 97.62
        },
        {
          "id_alumno": 103,
          "nombre": "María",
          "apellido": "González",
          "P": 39,
          "E": 2,
          "SP": 1,
          "A": 0,
          "total_registros": 42,
          "porcentaje_asistencia": 97.62
        }
        // ... más alumnos
      ]
    },
    {
      "trimestre": 2,
      "P": 235,
      "E": 18,
      "SP": 10,
      "A": 5,
      "total_registros": 268,
      "porcentaje_asistencia": 94.4,
      "alumnos": [
        {
          "id_alumno": 101,
          "nombre": "Ana",
          "apellido": "Pérez",
          "P": 37,
          "E": 3,
          "SP": 2,
          "A": 0,
          "total_registros": 42,
          "porcentaje_asistencia": 95.24
        }
        // ... más alumnos
      ]
    },
    {
      "trimestre": 3,
      "P": 238,
      "E": 16,
      "SP": 9,
      "A": 5,
      "total_registros": 268,
      "porcentaje_asistencia": 94.78,
      "alumnos": [
        {
          "id_alumno": 101,
          "nombre": "Ana",
          "apellido": "Pérez",
          "P": 39,
          "E": 1,
          "SP": 1,
          "A": 1,
          "total_registros": 42,
          "porcentaje_asistencia": 95.24
        }
        // ... más alumnos
      ]
    }
  ],
  "totales": {
    "P": 713,
    "E": 49,
    "SP": 27,
    "A": 15,
    "total_registros": 804,
    "porcentaje_asistencia": 94.78
  }
}
```

---

## Endpoint: Consolidado por Alumno (Asistencia + Conducta)

**Ruta:** `GET /asistencia/resumen/trimestral-consolidado/alumno`

**Query Parameters:**

- `cursoId` (requerido): ID del curso
- `alumnoId` (requerido): ID del alumno
- `anio` (opcional): Año académico (YYYY). Default: año actual

**Roles permitidos:** `Orientador`, `Admin`, `P.A`

### Estructura de Respuesta

```typescript
{
  cursoId: number;
  anio: string;
  alumno: {
    id_alumno: number;
    nombre: string;
    apellido: string;
  }
  asistencia: {
    trimestres: Array<{
      trimestre: 1 | 2 | 3;
      P: number;
      E: number;
      SP: number;
      A: number;
      total_registros: number;
      porcentaje_asistencia: number;
    }>;
    totales: {
      P: number;
      E: number;
      SP: number;
      A: number;
      total_registros: number;
      porcentaje_asistencia: number;
    }
  }
  conducta: {
    trimestres: Array<{
      trimestre: 1 | 2 | 3;
      menos_graves: number;
      graves: number;
      muy_graves: number;
      puntos: number;
      detalles: Array<{
        categoria: string;
        articulo: string;
        descripcion: string;
        conteo: number;
      }>;
    }>;
    totales: {
      menos_graves: number;
      graves: number;
      muy_graves: number;
      puntos: number;
    }
  }
}
```

### Ejemplo de Respuesta

```json
{
  "cursoId": 12,
  "anio": "2025",
  "alumno": {
    "id_alumno": 101,
    "nombre": "Ana",
    "apellido": "Pérez"
  },
  "asistencia": {
    "trimestres": [
      {
        "trimestre": 1,
        "P": 38,
        "E": 2,
        "SP": 1,
        "A": 1,
        "total_registros": 42,
        "porcentaje_asistencia": 95.24
      },
      {
        "trimestre": 2,
        "P": 37,
        "E": 3,
        "SP": 2,
        "A": 0,
        "total_registros": 42,
        "porcentaje_asistencia": 95.24
      },
      {
        "trimestre": 3,
        "P": 39,
        "E": 1,
        "SP": 1,
        "A": 1,
        "total_registros": 42,
        "porcentaje_asistencia": 95.24
      }
    ],
    "totales": {
      "P": 114,
      "E": 6,
      "SP": 4,
      "A": 2,
      "total_registros": 126,
      "porcentaje_asistencia": 95.24
    }
  },
  "conducta": {
    "trimestres": [
      {
        "trimestre": 1,
        "menos_graves": 2,
        "graves": 1,
        "muy_graves": 0,
        "puntos": 5,
        "detalles": [
          {
            "categoria": "MENOS_GRAVE",
            "articulo": "Art. 12",
            "descripcion": "Llega tarde a clase",
            "conteo": 2
          },
          {
            "categoria": "GRAVE",
            "articulo": "Art. 21",
            "descripcion": "Falta de respeto",
            "conteo": 1
          }
        ]
      },
      {
        "trimestre": 2,
        "menos_graves": 1,
        "graves": 0,
        "muy_graves": 0,
        "puntos": 1,
        "detalles": [
          {
            "categoria": "MENOS_GRAVE",
            "articulo": "Art. 12",
            "descripcion": "Llega tarde a clase",
            "conteo": 1
          }
        ]
      },
      {
        "trimestre": 3,
        "menos_graves": 0,
        "graves": 0,
        "muy_graves": 0,
        "puntos": 0,
        "detalles": []
      }
    ],
    "totales": {
      "menos_graves": 3,
      "graves": 1,
      "muy_graves": 0,
      "puntos": 6
    }
  }
}
```

---

## Interfaces TypeScript para Frontend

```typescript
// Consolidado por Curso
export interface ResumenConsolidadoCurso {
  cursoId: number;
  anio: string;
  trimestres: TrimestreConsolidadoCurso[];
  totales: TotalesAsistencia;
}

export interface TrimestreConsolidadoCurso {
  trimestre: 1 | 2 | 3;
  P: number;
  E: number;
  SP: number;
  A: number;
  total_registros: number;
  porcentaje_asistencia: number;
  alumnos: DetalleAlumnoTrimestre[];
}

export interface DetalleAlumnoTrimestre {
  id_alumno: number;
  nombre: string;
  apellido: string;
  P: number;
  E: number;
  SP: number;
  A: number;
  total_registros: number;
  porcentaje_asistencia: number;
}

export interface TotalesAsistencia {
  P: number;
  E: number;
  SP: number;
  A: number;
  total_registros: number;
  porcentaje_asistencia: number;
}

// Consolidado por Alumno
export interface ResumenConsolidadoAlumno {
  cursoId: number;
  anio: string;
  alumno: {
    id_alumno: number;
    nombre: string;
    apellido: string;
  };
  asistencia: {
    trimestres: TrimestreAsistencia[];
    totales: TotalesAsistencia;
  };
  conducta: {
    trimestres: TrimestreConducta[];
    totales: TotalesConducta;
  };
}

export interface TrimestreAsistencia {
  trimestre: 1 | 2 | 3;
  P: number;
  E: number;
  SP: number;
  A: number;
  total_registros: number;
  porcentaje_asistencia: number;
}

export interface TrimestreConducta {
  trimestre: 1 | 2 | 3;
  menos_graves: number;
  graves: number;
  muy_graves: number;
  puntos: number;
  detalles: DetalleInfraccion[];
}

export interface DetalleInfraccion {
  categoria: string;
  articulo: string;
  descripcion: string;
  conteo: number;
}

export interface TotalesConducta {
  menos_graves: number;
  graves: number;
  muy_graves: number;
  puntos: number;
}
```

---

## Casos de Uso Frontend

### 1. Mostrar tabla consolidada del curso con detalle expandible

```typescript
// Vista de tabla general por trimestre
<TablaTrimestreCurso>
  {data.trimestres.map(trimestre => (
    <FilaTrimestre key={trimestre.trimestre}>
      <td>Trimestre {trimestre.trimestre}</td>
      <td>{trimestre.P}</td>
      <td>{trimestre.E}</td>
      <td>{trimestre.SP}</td>
      <td>{trimestre.A}</td>
      <td>{trimestre.porcentaje_asistencia}%</td>
      <td>
        <ButtonExpand onClick={() => setExpandido(trimestre.trimestre)}>
          Ver Alumnos ({trimestre.alumnos.length})
        </ButtonExpand>
      </td>
    </FilaTrimestre>
  ))}
</TablaTrimestreCurso>

// Vista expandida con detalle de alumnos
{expandido && (
  <TablaAlumnos>
    {data.trimestres
      .find(t => t.trimestre === expandido)
      ?.alumnos.map(alumno => (
        <FilaAlumno key={alumno.id_alumno}>
          <td>{alumno.apellido}, {alumno.nombre}</td>
          <td>{alumno.P}</td>
          <td>{alumno.E}</td>
          <td>{alumno.SP}</td>
          <td>{alumno.A}</td>
          <td>{alumno.porcentaje_asistencia}%</td>
        </FilaAlumno>
      ))
    }
  </TablaAlumnos>
)}
```

### 2. Gráfico de tendencia por trimestre (curso completo)

```typescript
const chartData = data.trimestres.map((t) => ({
  trimestre: `T${t.trimestre}`,
  porcentaje: t.porcentaje_asistencia,
  presentes: t.P,
  ausentes: t.A,
}));
```

### 3. Comparar alumnos en el mismo trimestre

```typescript
const compararAlumnos = (trimestre: number) => {
  const alumnos =
    data.trimestres.find((t) => t.trimestre === trimestre)?.alumnos || [];

  return alumnos
    .sort((a, b) => b.porcentaje_asistencia - a.porcentaje_asistencia)
    .slice(0, 5); // Top 5 con mejor asistencia
};
```

### 4. Vista individual del alumno con conducta

```typescript
// Al hacer clic en un alumno, cargar su detalle completo
const verDetalleAlumno = async (alumnoId: number) => {
  const detalle = await fetch(
    `/asistencia/resumen/trimestral-consolidado/alumno?cursoId=${cursoId}&alumnoId=${alumnoId}&anio=${anio}`,
  );
  // Mostrar asistencia + conducta + infracciones
};
```

---

## Notas Importantes

1. **Performance**: El endpoint por curso trae TODOS los alumnos en TODOS los trimestres en una sola llamada. Esto puede ser pesado para cursos grandes (>50 alumnos). Considera paginación o filtros adicionales si es necesario.

2. **Estados de asistencia**:
   - `P` (Presente): Asistió a clase
   - `E` (Excusado): Falta justificada
   - `SP` (Sin Permiso): Falta injustificada
   - `A` (Ausente): No asistió

3. **Cálculo de porcentaje**: `porcentaje_asistencia = ((P + E) / total_registros) * 100`
   - Se consideran tanto `P` como `E` como asistencia efectiva

4. **Trimestres**: Siempre devuelve los 3 trimestres, incluso si no tienen registros (valores en 0)

5. **Alumnos sin registros**: Si un alumno no tiene ningún registro de asistencia en un trimestre, aparecerá con todos los contadores en 0

6. **Conducta**: Solo disponible en el endpoint por alumno individual, no en el consolidado por curso
