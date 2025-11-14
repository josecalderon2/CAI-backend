# 📋 MAPEO DE DATOS - FRONTEND REPORTES DE NOTAS

## 🎯 Guía Completa para Consumir los Endpoints desde React/TypeScript

---

## 1️⃣ EVALUACIONES POR ASIGNATURA

### Endpoint

```
GET /reportes-notas/evaluaciones?id_asignatura={id}&anio={anio}
```

### TypeScript Interface

```typescript
interface EvaluacionDistribucion {
  tipo: string; // "Tarea", "Revisión de Cuaderno", etc.
  porcentajeBase: number; // 5, 15, 25, 10, 30
  cantidad: number; // Número de evaluaciones de este tipo
  porcentajeCadaUna: number; // porcentajeBase / cantidad
  evaluaciones: Array<{
    id_evaluacion: number;
    nombre: string; // "Tarea - Trimestre 1"
  }>;
}

interface EvaluacionesResponse {
  asignatura: {
    id_asignatura: number;
  };
  anio_academico: string; // "2025"
  distribucionPorcentajes: EvaluacionDistribucion[];
  totalPorcentaje: number; // Siempre debe sumar 100
}
```

### Ejemplo de Respuesta Real

```json
{
  "asignatura": {
    "id_asignatura": 2
  },
  "anio_academico": "2025",
  "distribucionPorcentajes": [
    {
      "tipo": "Tarea",
      "porcentajeBase": 5,
      "cantidad": 3,
      "porcentajeCadaUna": 1.67,
      "evaluaciones": [
        {
          "id_evaluacion": 19,
          "nombre": "Tarea - Trimestre 1"
        },
        {
          "id_evaluacion": 25,
          "nombre": "Tarea - Trimestre 2"
        },
        {
          "id_evaluacion": 31,
          "nombre": "Tarea - Trimestre 3"
        }
      ]
    },
    {
      "tipo": "Examen Trimestral",
      "porcentajeBase": 30,
      "cantidad": 3,
      "porcentajeCadaUna": 10,
      "evaluaciones": [
        {
          "id_evaluacion": 24,
          "nombre": "Examen Trimestral - Trimestre 1"
        },
        {
          "id_evaluacion": 30,
          "nombre": "Examen Trimestral - Trimestre 2"
        },
        {
          "id_evaluacion": 36,
          "nombre": "Examen Trimestral - Trimestre 3"
        }
      ]
    }
  ],
  "totalPorcentaje": 100
}
```

### Cómo Mapear en React

```typescript
const EvaluacionesTable: React.FC = () => {
  const [data, setData] = useState<EvaluacionesResponse | null>(null);

  useEffect(() => {
    fetch('/reportes-notas/evaluaciones?id_asignatura=2&anio=2025', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Año: {data.anio_academico}</h2>
      {data.distribucionPorcentajes.map(grupo => (
        <div key={grupo.tipo}>
          <h3>{grupo.tipo} - {grupo.porcentajeBase}%</h3>
          <p>Total: {grupo.cantidad} evaluaciones</p>
          <p>Cada una vale: {grupo.porcentajeCadaUna.toFixed(2)}%</p>
          <ul>
            {grupo.evaluaciones.map(ev => (
              <li key={ev.id_evaluacion}>{ev.nombre}</li>
            ))}
          </ul>
        </div>
      ))}
      <p><strong>Total: {data.totalPorcentaje}%</strong></p>
    </div>
  );
};
```

---

## 2️⃣ ALUMNOS CON CALIFICACIONES DE UNA EVALUACIÓN

### Endpoint

```
GET /reportes-notas/evaluacion/:id/alumnos-calificaciones
```

### TypeScript Interface

```typescript
interface AlumnoCalificacion {
  id_alumno: number;
  nombre: string;
  apellido: string;
  genero: 'M' | 'F';
  calificacion: number | null; // null = sin nota
  id_nota: number | null;
  tiene_calificacion: boolean;
}

interface AlumnosCalificacionesResponse {
  id_evaluacion: number;
  nombre_evaluacion: string;
  asignatura: {
    id_asignatura: number;
    nombre: string;
  };
  curso: {
    id_curso: number;
    nombre: string;
    seccion: string;
  };
  total_alumnos: number;
  alumnos_calificados: number;
  alumnos: AlumnoCalificacion[]; // Ordenados por apellido
}
```

### Ejemplo de Respuesta Real

```json
{
  "id_evaluacion": 19,
  "nombre_evaluacion": "Tarea - Trimestre 1",
  "asignatura": {
    "id_asignatura": 2,
    "nombre": "Lenguaje y Literatura"
  },
  "curso": {
    "id_curso": 1,
    "nombre": "Quinto Grado",
    "seccion": "A"
  },
  "total_alumnos": 10,
  "alumnos_calificados": 3,
  "alumnos": [
    {
      "id_alumno": 1,
      "nombre": "Alumno1",
      "apellido": "Prueba1",
      "genero": "M",
      "calificacion": 9.38,
      "id_nota": 19,
      "tiene_calificacion": true
    },
    {
      "id_alumno": 7,
      "nombre": "Alumno10",
      "apellido": "Prueba10",
      "genero": "F",
      "calificacion": null,
      "id_nota": null,
      "tiene_calificacion": false
    }
  ]
}
```

### Cómo Mapear en React

```typescript
const AlumnosTable: React.FC<{ evaluacionId: number }> = ({ evaluacionId }) => {
  const [data, setData] = useState<AlumnosCalificacionesResponse | null>(null);

  useEffect(() => {
    fetch(`/reportes-notas/evaluacion/${evaluacionId}/alumnos-calificaciones`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData);
  }, [evaluacionId]);

  if (!data) return <div>Cargando...</div>;

  // Calcular progreso
  const progreso = (data.alumnos_calificados / data.total_alumnos) * 100;

  return (
    <div>
      <h2>{data.nombre_evaluacion}</h2>
      <h3>{data.asignatura.nombre} - {data.curso.nombre} {data.curso.seccion}</h3>

      <div className="progress-bar">
        <div style={{ width: `${progreso}%` }}>
          {data.alumnos_calificados}/{data.total_alumnos} calificados ({progreso.toFixed(0)}%)
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Género</th>
            <th>Calificación</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.alumnos.map(alumno => (
            <tr key={alumno.id_alumno} className={alumno.tiene_calificacion ? '' : 'pendiente'}>
              <td>{alumno.apellido}, {alumno.nombre}</td>
              <td>{alumno.genero}</td>
              <td>
                {alumno.calificacion !== null
                  ? alumno.calificacion.toFixed(2)
                  : '-'}
              </td>
              <td>
                {alumno.tiene_calificacion
                  ? <span className="badge-success">Calificado</span>
                  : <span className="badge-warning">Pendiente</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 3️⃣ HISTORIAL DE NOTAS DEL ALUMNO

### Endpoint

```
GET /reportes-notas/alumno/:id/notas?anio={anio}
```

### TypeScript Interface

```typescript
interface Nota {
  id_nota: number;
  id_asignatura: number;
  trimestre: string; // "1", "2", "3"
  id_evaluacion: number;
  calificacion: number; // 0-10
  fecha_registro: string; // ISO date
  id_alumno: number;
  asignatura: {
    id_asignatura: number;
    nombre: string;
    orden_en_reporte: string; // "01", "02"
    horas_semanas: number;
    id_metodo_evaluacion: number;
    id_tipo_asignatura: number;
    id_sistema_evaluacion: number;
    id_curso: number;
  };
  evaluacion: {
    id_evaluacion: number;
    nombre: string;
    puntaje_maximo: number;
    puntaje_minimo: number;
    id_tipo_evaluacion: number;
    id_asignatura: number;
    id_orientador: number;
    anio_academico: string;
    mes: number | null;
    trimestre: number | null;
    periodo: number | null;
    createdAt: string;
    tipoEvaluacion: {
      id_tipo_evaluacion: number;
      nombre: string; // "Tarea", "Examen Trimestral"
      id_grado_academico: number;
      porcentaje: number;
      activo: boolean;
    };
  };
}

type NotasResponse = Nota[]; // Array de notas
```

### Ejemplo de Respuesta Real

```json
[
  {
    "id_nota": 36,
    "id_asignatura": 2,
    "trimestre": "3",
    "id_evaluacion": 36,
    "calificacion": 8.52,
    "fecha_registro": "2025-11-13T17:33:08.981Z",
    "id_alumno": 1,
    "asignatura": {
      "id_asignatura": 2,
      "nombre": "Lenguaje y Literatura",
      "orden_en_reporte": "02",
      "horas_semanas": 4,
      "id_metodo_evaluacion": 1,
      "id_tipo_asignatura": 1,
      "id_sistema_evaluacion": 1,
      "id_curso": 1
    },
    "evaluacion": {
      "id_evaluacion": 36,
      "nombre": "Examen Trimestral - Trimestre 3",
      "puntaje_maximo": 10,
      "puntaje_minimo": 0,
      "id_tipo_evaluacion": 6,
      "id_asignatura": 2,
      "id_orientador": 1,
      "anio_academico": "2025",
      "mes": null,
      "trimestre": 3,
      "periodo": null,
      "createdAt": "2025-11-13T17:33:08.964Z",
      "tipoEvaluacion": {
        "id_tipo_evaluacion": 6,
        "nombre": "Examen Trimestral",
        "id_grado_academico": 2,
        "porcentaje": 30,
        "activo": true
      }
    }
  }
]
```

### Cómo Mapear en React

```typescript
const NotasHistorial: React.FC<{ alumnoId: number }> = ({ alumnoId }) => {
  const [notas, setNotas] = useState<NotasResponse>([]);

  useEffect(() => {
    fetch(`/reportes-notas/alumno/${alumnoId}/notas?anio=2025`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setNotas);
  }, [alumnoId]);

  // Agrupar por asignatura
  const notasPorAsignatura = notas.reduce((acc, nota) => {
    const asig = nota.asignatura.nombre;
    if (!acc[asig]) acc[asig] = [];
    acc[asig].push(nota);
    return acc;
  }, {} as Record<string, Nota[]>);

  return (
    <div>
      <h2>Historial de Notas</h2>
      <p>Total: {notas.length} notas registradas</p>

      {Object.entries(notasPorAsignatura).map(([asignatura, notasAsig]) => (
        <div key={asignatura} className="asignatura-section">
          <h3>{asignatura} ({notasAsig.length} notas)</h3>
          <table>
            <thead>
              <tr>
                <th>Evaluación</th>
                <th>Tipo</th>
                <th>Trimestre</th>
                <th>Calificación</th>
                <th>% del tipo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {notasAsig.map(nota => (
                <tr key={nota.id_nota}>
                  <td>{nota.evaluacion.nombre}</td>
                  <td>{nota.evaluacion.tipoEvaluacion.nombre}</td>
                  <td>{nota.trimestre}</td>
                  <td className={nota.calificacion >= 6 ? 'aprobado' : 'reprobado'}>
                    {nota.calificacion.toFixed(2)}
                  </td>
                  <td>{nota.evaluacion.tipoEvaluacion.porcentaje}%</td>
                  <td>{new Date(nota.fecha_registro).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
```

---

## 4️⃣ PROMEDIOS DEL ALUMNO

### Endpoint

```
GET /reportes-notas/promedios/alumno/:id?anio={anio}
```

### TypeScript Interface

```typescript
interface PromedioMensual {
  id: number;
  alumnoId: number;
  asignaturaId: number;
  anioAcademico: string;
  mes: number; // 1-12
  trimestre: number; // 1-3
  promedioTareas: number | null;
  promedioRevisiones: number | null;
  promedioLaboratorios: number | null;
  promedioMensual: number;
  actualizadoEn: string;
  asignatura: {
    id_asignatura: number;
    nombre: string;
    orden_en_reporte: string;
    horas_semanas: number;
    id_metodo_evaluacion: number;
    id_tipo_asignatura: number;
    id_sistema_evaluacion: number;
    id_curso: number;
  };
}

interface PromedioTrimestral {
  id: number;
  alumnoId: number;
  asignaturaId: number;
  anioAcademico: string;
  trimestre: number; // 1-3
  promedioMeses: number;
  actividadIntegradora: number;
  autoevaluacion: number;
  promedioActividades: number; // Suma ponderada
  examenTrimestral: number;
  promedioTrimestral: number; // Promedio final
  aprobado: boolean;
  actualizadoEn: string;
  asignatura: {
    id_asignatura: number;
    nombre: string;
    orden_en_reporte: string;
    horas_semanas: number;
    id_metodo_evaluacion: number;
    id_tipo_asignatura: number;
    id_sistema_evaluacion: number;
    id_curso: number;
  };
}

interface PromedioFinalAsignatura {
  id: number;
  alumnoId: number;
  asignaturaId: number;
  anioAcademico: string;
  promedioTrimestre1: number | null;
  promedioTrimestre2: number | null;
  promedioTrimestre3: number | null;
  promedioPeriodo1: number | null; // Para bachillerato
  promedioPeriodo2: number | null;
  promedioPeriodo3: number | null;
  promedioPeriodo4: number | null;
  promedioFinal: number;
  aprobado: boolean;
  requiereRecuperacion: boolean;
  notaRecuperacion: number | null;
  aproboRecuperacion: boolean | null;
  actualizadoEn: string;
  asignatura: {
    id_asignatura: number;
    nombre: string;
    orden_en_reporte: string;
    horas_semanas: number;
    id_metodo_evaluacion: number;
    id_tipo_asignatura: number;
    id_sistema_evaluacion: number;
    id_curso: number;
  };
}

interface PromedioFinalAlumno {
  id: number;
  alumnoId: number;
  cursoId: number;
  anioAcademico: string;
  promedioGeneral: number;
  aprobadoTodasAsignaturas: boolean;
  asignaturasReprobadas: number;
  estadoFinal: 'APROBADO' | 'REPROBADO' | 'RECUPERACION';
  calificacionesCerradas: boolean;
  fechaCierre: string | null;
  actualizadoEn: string;
}

interface PromediosResponse {
  anio: string;
  mensuales: PromedioMensual[];
  trimestrales: PromedioTrimestral[];
  periodos: any[]; // Para bachillerato
  finalesAsignatura: PromedioFinalAsignatura[];
  finalAlumno: PromedioFinalAlumno | null;
}
```

### Ejemplo de Respuesta Real

```json
{
  "anio": "2025",
  "mensuales": [
    {
      "id": 1,
      "alumnoId": 1,
      "asignaturaId": 1,
      "anioAcademico": "2025",
      "mes": 2,
      "trimestre": 1,
      "promedioTareas": null,
      "promedioRevisiones": null,
      "promedioLaboratorios": null,
      "promedioMensual": 0,
      "actualizadoEn": "2025-11-13T17:36:17.331Z",
      "asignatura": {
        "id_asignatura": 1,
        "nombre": "Matemática I"
      }
    }
  ],
  "trimestrales": [
    {
      "id": 1,
      "alumnoId": 1,
      "asignaturaId": 1,
      "anioAcademico": "2025",
      "trimestre": 1,
      "promedioMeses": 0,
      "actividadIntegradora": 8.23,
      "autoevaluacion": 7.54,
      "promedioActividades": 2.81,
      "examenTrimestral": 9.89,
      "promedioTrimestral": 5.78,
      "aprobado": false,
      "actualizadoEn": "2025-11-13T17:36:17.380Z",
      "asignatura": {
        "id_asignatura": 1,
        "nombre": "Matemática I"
      }
    }
  ],
  "periodos": [],
  "finalesAsignatura": [
    {
      "id": 1,
      "alumnoId": 1,
      "asignaturaId": 2,
      "anioAcademico": "2025",
      "promedioTrimestre1": 6.25,
      "promedioTrimestre2": 5.69,
      "promedioTrimestre3": 5.78,
      "promedioPeriodo1": null,
      "promedioPeriodo2": null,
      "promedioPeriodo3": null,
      "promedioPeriodo4": null,
      "promedioFinal": 5.91,
      "aprobado": false,
      "requiereRecuperacion": true,
      "notaRecuperacion": null,
      "aproboRecuperacion": null,
      "actualizadoEn": "2025-11-13T17:36:17.382Z",
      "asignatura": {
        "id_asignatura": 2,
        "nombre": "Lenguaje y Literatura"
      }
    }
  ],
  "finalAlumno": {
    "id": 1,
    "alumnoId": 1,
    "cursoId": 1,
    "anioAcademico": "2025",
    "promedioGeneral": 5.74,
    "aprobadoTodasAsignaturas": false,
    "asignaturasReprobadas": 2,
    "estadoFinal": "REPROBADO",
    "calificacionesCerradas": false,
    "fechaCierre": null,
    "actualizadoEn": "2025-11-13T17:36:17.384Z"
  }
}
```

### Cómo Mapear en React

```typescript
const PromediosAlumno: React.FC<{ alumnoId: number }> = ({ alumnoId }) => {
  const [promedios, setPromedios] = useState<PromediosResponse | null>(null);

  useEffect(() => {
    fetch(`/reportes-notas/promedios/alumno/${alumnoId}?anio=2025`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPromedios);
  }, [alumnoId]);

  if (!promedios) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Promedios - Año {promedios.anio}</h2>

      {/* Resumen General */}
      {promedios.finalAlumno && (
        <div className={`resumen-general ${promedios.finalAlumno.estadoFinal.toLowerCase()}`}>
          <h3>Promedio General: {promedios.finalAlumno.promedioGeneral.toFixed(2)}</h3>
          <p>Estado: <strong>{promedios.finalAlumno.estadoFinal}</strong></p>
          <p>Asignaturas reprobadas: {promedios.finalAlumno.asignaturasReprobadas}</p>
        </div>
      )}

      {/* Promedios por Asignatura */}
      <h3>Promedios Finales por Asignatura</h3>
      <table>
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>T1</th>
            <th>T2</th>
            <th>T3</th>
            <th>Final</th>
            <th>Estado</th>
            <th>Recuperación</th>
          </tr>
        </thead>
        <tbody>
          {promedios.finalesAsignatura.map(asig => (
            <tr key={asig.id} className={asig.aprobado ? 'aprobado' : 'reprobado'}>
              <td>{asig.asignatura.nombre}</td>
              <td>{asig.promedioTrimestre1?.toFixed(2) || '-'}</td>
              <td>{asig.promedioTrimestre2?.toFixed(2) || '-'}</td>
              <td>{asig.promedioTrimestre3?.toFixed(2) || '-'}</td>
              <td><strong>{asig.promedioFinal.toFixed(2)}</strong></td>
              <td>
                {asig.aprobado
                  ? <span className="badge-success">Aprobado</span>
                  : <span className="badge-danger">Reprobado</span>}
              </td>
              <td>
                {asig.requiereRecuperacion && (
                  asig.notaRecuperacion
                    ? `${asig.notaRecuperacion.toFixed(2)} (${asig.aproboRecuperacion ? 'Aprobó' : 'Reprobó'})`
                    : 'Pendiente'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Promedios Trimestrales */}
      <h3>Detalle por Trimestre</h3>
      {[1, 2, 3].map(trimestre => (
        <div key={trimestre} className="trimestre-section">
          <h4>Trimestre {trimestre}</h4>
          <table>
            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Actividad Integradora</th>
                <th>Autoevaluación</th>
                <th>Examen</th>
                <th>Promedio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {promedios.trimestrales
                .filter(t => t.trimestre === trimestre)
                .map(t => (
                  <tr key={t.id} className={t.aprobado ? 'aprobado' : 'reprobado'}>
                    <td>{t.asignatura.nombre}</td>
                    <td>{t.actividadIntegradora.toFixed(2)}</td>
                    <td>{t.autoevaluacion.toFixed(2)}</td>
                    <td>{t.examenTrimestral.toFixed(2)}</td>
                    <td><strong>{t.promedioTrimestral.toFixed(2)}</strong></td>
                    <td>
                      {t.aprobado
                        ? <span className="badge-success">✓</span>
                        : <span className="badge-warning">✗</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
```

---

## 5️⃣ BOLETA COMPLETA DEL ALUMNO

### Endpoint

```
GET /reportes-notas/boleta/alumno/:id?anio={anio}
```

### TypeScript Interface

```typescript
interface Conducta {
  id_conducta: number;
  id_alumno: number;
  fecha: string; // ISO date
  id_infraccion_catalogo: number;
  id_orientador: number;
  id_asignatura: number | null;
  observacion: string;
  anio_academico: string;
  trimestre: number;
  infraccion: {
    id_infraccion: number;
    categoria: 'LEVE' | 'MENOS_GRAVE' | 'GRAVE' | 'MUY_GRAVE';
    articulo: string; // "MG-002"
    descripcion: string;
    puntos: number;
    activo: boolean;
  };
}

interface BoletaResponse {
  anio: string;
  finalesAsignatura: PromedioFinalAsignatura[]; // Mismo tipo que en promedios
  finalAlumno: PromedioFinalAlumno | null; // Mismo tipo que en promedios
  conductasResumen: {
    total: number;
    detalles: Conducta[];
  };
  asistencia: {
    total: number; // Total de registros
    presentes: number; // Registros con estado 'P'
    porcentaje: number | null; // (presentes/total)*100
  };
}
```

### Ejemplo de Respuesta Real

```json
{
  "anio": "2025",
  "finalesAsignatura": [
    {
      "id": 1,
      "alumnoId": 1,
      "asignaturaId": 2,
      "anioAcademico": "2025",
      "promedioTrimestre1": 6.25,
      "promedioTrimestre2": 5.69,
      "promedioTrimestre3": 5.78,
      "promedioPeriodo1": null,
      "promedioPeriodo2": null,
      "promedioPeriodo3": null,
      "promedioPeriodo4": null,
      "promedioFinal": 5.91,
      "aprobado": false,
      "requiereRecuperacion": true,
      "notaRecuperacion": null,
      "aproboRecuperacion": null,
      "actualizadoEn": "2025-11-13T17:36:17.382Z",
      "asignatura": {
        "id_asignatura": 2,
        "nombre": "Lenguaje y Literatura"
      }
    }
  ],
  "finalAlumno": {
    "id": 1,
    "alumnoId": 1,
    "cursoId": 1,
    "anioAcademico": "2025",
    "promedioGeneral": 5.74,
    "aprobadoTodasAsignaturas": false,
    "asignaturasReprobadas": 2,
    "estadoFinal": "REPROBADO",
    "calificacionesCerradas": false,
    "fechaCierre": null,
    "actualizadoEn": "2025-11-13T17:36:17.384Z"
  },
  "conductasResumen": {
    "total": 2,
    "detalles": [
      {
        "id_conducta": 1,
        "id_alumno": 1,
        "fecha": "2025-05-12T07:00:00.000Z",
        "id_infraccion_catalogo": 2,
        "id_orientador": 1,
        "id_asignatura": null,
        "observacion": "Incidente registrado en 5/12/2025",
        "anio_academico": "2025",
        "trimestre": 2,
        "infraccion": {
          "id_infraccion": 2,
          "categoria": "MENOS_GRAVE",
          "articulo": "MG-002",
          "descripcion": "Llegada tardía (Acumulación)",
          "puntos": 1,
          "activo": true
        }
      }
    ]
  },
  "asistencia": {
    "total": 30,
    "presentes": 30,
    "porcentaje": 100
  }
}
```

### Cómo Mapear en React (Componente Completo de Boleta)

```typescript
const BoletaAlumno: React.FC<{ alumnoId: number }> = ({ alumnoId }) => {
  const [boleta, setBoleta] = useState<BoletaResponse | null>(null);

  useEffect(() => {
    fetch(`/reportes-notas/boleta/alumno/${alumnoId}?anio=2025`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setBoleta);
  }, [alumnoId]);

  if (!boleta) return <div>Cargando boleta...</div>;

  const estadoColor = {
    'APROBADO': 'green',
    'REPROBADO': 'red',
    'RECUPERACION': 'orange'
  };

  return (
    <div className="boleta-container">
      {/* Header */}
      <div className="boleta-header">
        <h1>BOLETA DE CALIFICACIONES</h1>
        <p>Año Académico: {boleta.anio}</p>
      </div>

      {/* Resumen General */}
      {boleta.finalAlumno && (
        <div
          className="resumen-general"
          style={{ backgroundColor: estadoColor[boleta.finalAlumno.estadoFinal] }}
        >
          <h2>Promedio General: {boleta.finalAlumno.promedioGeneral.toFixed(2)}</h2>
          <p><strong>{boleta.finalAlumno.estadoFinal}</strong></p>
          <p>Asignaturas Reprobadas: {boleta.finalAlumno.asignaturasReprobadas}</p>
        </div>
      )}

      {/* Calificaciones por Asignatura */}
      <section className="calificaciones">
        <h3>Calificaciones por Asignatura</h3>
        <table>
          <thead>
            <tr>
              <th>Asignatura</th>
              <th>Trimestre 1</th>
              <th>Trimestre 2</th>
              <th>Trimestre 3</th>
              <th>Promedio Final</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {boleta.finalesAsignatura.map(asig => (
              <tr key={asig.id} className={asig.aprobado ? 'aprobado' : 'reprobado'}>
                <td><strong>{asig.asignatura.nombre}</strong></td>
                <td>{asig.promedioTrimestre1?.toFixed(2) || '-'}</td>
                <td>{asig.promedioTrimestre2?.toFixed(2) || '-'}</td>
                <td>{asig.promedioTrimestre3?.toFixed(2) || '-'}</td>
                <td><strong>{asig.promedioFinal.toFixed(2)}</strong></td>
                <td>
                  {asig.aprobado ? (
                    <span className="badge-success">APROBADO</span>
                  ) : asig.requiereRecuperacion ? (
                    <span className="badge-warning">RECUPERACIÓN</span>
                  ) : (
                    <span className="badge-danger">REPROBADO</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Asistencia */}
      <section className="asistencia">
        <h3>Asistencia</h3>
        <div className="asistencia-stats">
          <div className="stat">
            <label>Total Registros:</label>
            <span>{boleta.asistencia.total}</span>
          </div>
          <div className="stat">
            <label>Asistencias:</label>
            <span>{boleta.asistencia.presentes}</span>
          </div>
          <div className="stat">
            <label>Ausencias:</label>
            <span>{boleta.asistencia.total - boleta.asistencia.presentes}</span>
          </div>
          <div className="stat highlight">
            <label>Porcentaje de Asistencia:</label>
            <span>{boleta.asistencia.porcentaje?.toFixed(1)}%</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${boleta.asistencia.porcentaje}%` }}
          >
            {boleta.asistencia.porcentaje?.toFixed(0)}%
          </div>
        </div>
      </section>

      {/* Conducta */}
      <section className="conducta">
        <h3>Conducta</h3>
        <p>Total de incidentes: <strong>{boleta.conductasResumen.total}</strong></p>

        {boleta.conductasResumen.total > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Trimestre</th>
                <th>Categoría</th>
                <th>Artículo</th>
                <th>Descripción</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {boleta.conductasResumen.detalles.map(conducta => (
                <tr key={conducta.id_conducta} className={`categoria-${conducta.infraccion.categoria.toLowerCase()}`}>
                  <td>{new Date(conducta.fecha).toLocaleDateString()}</td>
                  <td>T{conducta.trimestre}</td>
                  <td>
                    <span className={`badge-${conducta.infraccion.categoria.toLowerCase()}`}>
                      {conducta.infraccion.categoria}
                    </span>
                  </td>
                  <td>{conducta.infraccion.articulo}</td>
                  <td>{conducta.infraccion.descripcion}</td>
                  <td>{conducta.infraccion.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="sin-incidentes">✓ No hay incidentes registrados</p>
        )}
      </section>

      {/* Footer */}
      <div className="boleta-footer">
        <p>Documento generado el {new Date().toLocaleDateString()}</p>
        <button onClick={() => window.print()}>Imprimir Boleta</button>
      </div>
    </div>
  );
};
```

---

## 🎨 CSS SUGERIDO PARA ESTILOS

```css
/* Colores según estado */
.aprobado {
  background-color: #d4edda;
  color: #155724;
}

.reprobado {
  background-color: #f8d7da;
  color: #721c24;
}

.pendiente {
  background-color: #fff3cd;
  color: #856404;
}

/* Badges */
.badge-success {
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Barra de progreso */
.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: width 0.3s ease;
}

/* Categorías de conducta */
.categoria-leve {
  border-left: 3px solid #17a2b8;
}

.categoria-menos_grave {
  border-left: 3px solid #ffc107;
}

.categoria-grave {
  border-left: 3px solid #fd7e14;
}

.categoria-muy_grave {
  border-left: 3px solid #dc3545;
}
```

---

## 📝 NOTAS IMPORTANTES PARA EL FRONTEND

1. **Manejo de `null`**: Muchos campos pueden ser `null` (especialmente en promedios mensuales y recuperaciones). Siempre valida antes de renderizar.

2. **Formato de fechas**: Las fechas vienen en formato ISO (`2025-11-13T17:33:08.981Z`). Usa `new Date()` y formatea según tu necesidad.

3. **Decimales**: Las calificaciones tienen muchos decimales. Usa `.toFixed(2)` para mostrar solo 2 decimales.

4. **Estados dinámicos**: Usa clases CSS condicionales basadas en:
   - `aprobado` (boolean)
   - `tiene_calificacion` (boolean)
   - `estadoFinal` (string)
   - `categoria` de infracciones

5. **Agrupación de datos**: Los datos vienen en arrays planos. Considera agruparlos por:
   - Asignatura
   - Trimestre
   - Tipo de evaluación

6. **Loading states**: Siempre muestra un indicador de carga mientras fetch está en progreso.

7. **Error handling**: Captura errores 401 (token expirado), 403 (sin permisos), 404 (no encontrado).

---

## 🚀 EJEMPLO DE HOOK PERSONALIZADO

```typescript
function useReporte<T>(endpoint: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, deps);

  return { data, loading, error };
}

// Uso
const { data, loading, error } = useReporte<BoletaResponse>(
  `/reportes-notas/boleta/alumno/1?anio=2025`,
  [alumnoId],
);
```

---

**¿Necesitas más ejemplos o aclaraciones sobre algún endpoint específico?**
