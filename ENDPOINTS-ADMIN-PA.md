# 🔴 Endpoints Exclusivos para Admin y Personal Académico

Estos endpoints solo están disponibles para usuarios con roles **Admin** o **P.A** (Personal Académico). Son reportes institucionales avanzados para análisis y supervisión.

---

## 1️⃣ GET `/reportes-notas/curso/:id/ranking`

### 📋 Descripción
Obtiene el ranking de los mejores alumnos de un curso ordenados por su promedio general descendente.

### 🔑 Permisos
- ✅ Admin
- ✅ Personal Académico (P.A)
- ❌ Orientador

### 📥 Parámetros de Entrada

#### Path Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `id` | integer | ✅ Sí | ID del curso | `1` |

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo | Default |
|-----------|------|-----------|-------------|---------|---------|
| `anio` | string | ❌ No | Año académico | `"2025"` | Año actual |
| `top` | integer | ❌ No | Cantidad de alumnos a mostrar | `10` | `10` |

### 📤 Respuesta Exitosa (200 OK)

```typescript
// Tipo de dato de respuesta
interface RankingResponse {
  id: number;
  alumnoId: number;
  cursoId: number;
  anioAcademico: string;
  promedioGeneral: number; // Promedio general del alumno
  alumno: {
    id_alumno: number;
    nombre: string;
    apellido: string;
    numeroMatricula: string;
    // ... otros campos del alumno
  };
  // ... otros campos de PromedioFinalAlumno
}

// La respuesta es un array ordenado por promedioGeneral descendente
type RankingArray = RankingResponse[];
```

### 📦 Ejemplo de Respuesta

```json
[
  {
    "id": 15,
    "alumnoId": 3,
    "cursoId": 1,
    "anioAcademico": "2025",
    "promedioGeneral": 9.85,
    "alumno": {
      "id_alumno": 3,
      "nombre": "María",
      "apellido": "González",
      "numeroMatricula": "2025-001-003",
      "fecha_nacimiento": "2010-03-15T00:00:00.000Z",
      "direccion": "Colonia Centro, San Salvador",
      "telefono": "2222-3333",
      "email": "maria.gonzalez@email.com",
      "genero": "Femenino"
    }
  },
  {
    "id": 14,
    "alumnoId": 2,
    "cursoId": 1,
    "anioAcademico": "2025",
    "promedioGeneral": 9.50,
    "alumno": {
      "id_alumno": 2,
      "nombre": "Juan",
      "apellido": "Pérez",
      "numeroMatricula": "2025-001-002",
      "fecha_nacimiento": "2010-05-20T00:00:00.000Z",
      "direccion": "Colonia Escalón, San Salvador",
      "telefono": "2222-1111",
      "email": "juan.perez@email.com",
      "genero": "Masculino"
    }
  },
  {
    "id": 16,
    "alumnoId": 5,
    "cursoId": 1,
    "anioAcademico": "2025",
    "promedioGeneral": 8.90,
    "alumno": {
      "id_alumno": 5,
      "nombre": "Carlos",
      "apellido": "Martínez",
      "numeroMatricula": "2025-001-005",
      "fecha_nacimiento": "2010-07-10T00:00:00.000Z",
      "direccion": "Colonia San Benito, San Salvador",
      "telefono": "2222-5555",
      "email": "carlos.martinez@email.com",
      "genero": "Masculino"
    }
  }
]
```

### 🎯 Casos de Uso Frontend
- **Dashboard Institucional**: Mostrar top 10 mejores alumnos por curso
- **Reportes de Excelencia**: Generar reconocimientos académicos
- **Análisis Comparativo**: Comparar rendimiento entre diferentes cursos
- **Gráficos de Barras**: Visualizar promedios de los mejores estudiantes

### 📌 Notas Importantes
- Los alumnos se ordenan por `promedioGeneral` de mayor a menor
- Solo incluye alumnos que tienen promedio final calculado
- Si no hay datos, retorna un array vacío `[]`
- El parámetro `top` permite limitar resultados (útil para dashboards)

---

## 2️⃣ GET `/reportes-notas/asignatura/:id/distribucion`

### 📋 Descripción
Obtiene estadísticas de distribución de calificaciones de una asignatura: mínimo, máximo, promedio, mediana y desviación estándar.

### 🔑 Permisos
- ✅ Admin
- ✅ Personal Académico (P.A)
- ❌ Orientador

### 📥 Parámetros de Entrada

#### Path Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `id` | integer | ✅ Sí | ID de la asignatura | `4` |

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo | Default |
|-----------|------|-----------|-------------|---------|---------|
| `anio` | string | ❌ No | Año académico | `"2025"` | Año actual |

### 📤 Respuesta Exitosa (200 OK)

```typescript
interface DistribucionResponse {
  count: number;        // Total de notas registradas
  min: number | null;   // Nota mínima
  max: number | null;   // Nota máxima
  mean: number | null;  // Promedio aritmético
  median: number | null;// Mediana
  stddev: number | null;// Desviación estándar
}
```

### 📦 Ejemplo de Respuesta

**Caso con datos:**
```json
{
  "count": 45,
  "min": 4.5,
  "max": 10.0,
  "mean": 7.82,
  "median": 8.0,
  "stddev": 1.35
}
```

**Caso sin datos:**
```json
{
  "count": 0,
  "min": null,
  "max": null,
  "mean": null,
  "median": null,
  "stddev": null
}
```

### 🎯 Casos de Uso Frontend
- **Análisis Estadístico**: Mostrar distribución de calificaciones
- **Gráficos de Campana**: Visualizar distribución normal de notas
- **Alertas de Rendimiento**: Detectar asignaturas con bajo rendimiento general
- **Comparaciones**: Comparar dificultad entre diferentes asignaturas
- **Box Plots**: Crear diagramas de caja y bigotes

### 📊 Interpretación de Estadísticas

| Métrica | Descripción | Uso |
|---------|-------------|-----|
| `count` | Cantidad total de notas | Validar tamaño de muestra |
| `min` | Nota más baja registrada | Identificar casos críticos |
| `max` | Nota más alta registrada | Identificar excelencia |
| `mean` | Promedio simple de todas las notas | Tendencia central general |
| `median` | Valor central de la distribución | Resistente a valores extremos |
| `stddev` | Dispersión de las notas | Alta = mucha variabilidad |

### 📌 Notas Importantes
- Solo considera notas **no nulas** en los cálculos
- Si `anio` no se proporciona, usa todas las notas de la asignatura
- Una `stddev` alta indica que hay mucha diferencia entre alumnos
- La `median` es más confiable que `mean` cuando hay outliers

---

## 3️⃣ GET `/reportes-notas/evaluacion/:id/pendientes`

### 📋 Descripción
Lista los alumnos que aún no tienen calificación registrada para una evaluación específica. Útil para supervisar el progreso de registro de notas.

### 🔑 Permisos
- ✅ Admin
- ✅ Personal Académico (P.A)
- ❌ Orientador

### 📥 Parámetros de Entrada

#### Path Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `id` | integer | ✅ Sí | ID de la evaluación | `19` |

#### Query Parameters
Ninguno

### 📤 Respuesta Exitosa (200 OK)

```typescript
interface PendientesResponse {
  evaluacion: {
    id_evaluacion: number;
    nombre: string;
  };
  total_alumnos: number;      // Total de alumnos inscritos en el curso
  registrados: number;         // Cantidad de notas ya registradas
  pendientes: Array<{          // Alumnos sin nota registrada
    id_alumno: number;
    nombre: string;
    apellido: string;
  }>;
}
```

### 📦 Ejemplo de Respuesta

**Caso con pendientes:**
```json
{
  "evaluacion": {
    "id_evaluacion": 19,
    "nombre": "Examen Parcial - Matemáticas"
  },
  "total_alumnos": 25,
  "registrados": 22,
  "pendientes": [
    {
      "id_alumno": 7,
      "nombre": "Pedro",
      "apellido": "Ramírez"
    },
    {
      "id_alumno": 12,
      "nombre": "Ana",
      "apellido": "López"
    },
    {
      "id_alumno": 18,
      "nombre": "Luis",
      "apellido": "Hernández"
    }
  ]
}
```

**Caso sin pendientes (todo completo):**
```json
{
  "evaluacion": {
    "id_evaluacion": 19,
    "nombre": "Examen Parcial - Matemáticas"
  },
  "total_alumnos": 25,
  "registrados": 25,
  "pendientes": []
}
```

### 🎯 Casos de Uso Frontend
- **Dashboard de Supervisión**: Ver progreso de registro de notas
- **Alertas Administrativas**: Notificar orientadores con pendientes
- **Reportes de Cumplimiento**: Generar lista de evaluaciones incompletas
- **Indicadores de Progreso**: Mostrar barra de progreso (registrados/total)
- **Seguimiento de Deadlines**: Identificar evaluaciones atrasadas

### 📊 Cálculos Útiles para Frontend

```typescript
// Calcular porcentaje de completitud
const porcentajeCompletado = (registrados / total_alumnos) * 100;

// Determinar estado
const estado = pendientes.length === 0 ? 'COMPLETO' : 'PENDIENTE';

// Calcular cantidad de pendientes
const cantidadPendientes = total_alumnos - registrados;
```

### 🎨 Sugerencias de UI

**Tabla de pendientes:**
```
┌────────────────────────────────────────┐
│ Evaluación: Examen Parcial             │
│ Progreso: 22/25 (88%)                  │
├────────────────────────────────────────┤
│ Alumnos Pendientes:                    │
│ • Pedro Ramírez                        │
│ • Ana López                            │
│ • Luis Hernández                       │
└────────────────────────────────────────┘
```

**Badge de estado:**
- 🟢 100% = Verde (Completo)
- 🟡 80-99% = Amarillo (Casi completo)
- 🔴 <80% = Rojo (Pendientes críticos)

### 📌 Notas Importantes
- Solo incluye alumnos **activos** en el curso
- Se basa en inscripciones del mismo año académico de la evaluación
- Un array vacío de `pendientes` significa que todos tienen nota
- El curso se obtiene automáticamente de la asignatura de la evaluación

### ⚠️ Errores Posibles

**404 - Evaluación no encontrada:**
```json
{
  "statusCode": 404,
  "message": "Evaluación no encontrada"
}
```

**404 - Curso asociado no encontrado:**
```json
{
  "statusCode": 404,
  "message": "Curso asociado no encontrado"
}
```

---

## 🔐 Autenticación y Autorización

Todos estos endpoints requieren:

1. **Token JWT válido** en header:
```
Authorization: Bearer <token>
```

2. **Rol apropiado** en el token:
- `Admin` ✅
- `P.A` ✅
- `Orientador` ❌

### Ejemplo de request completo:

```bash
# Ranking de curso
curl -X GET "http://localhost:3000/reportes-notas/curso/1/ranking?anio=2025&top=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Distribución de asignatura
curl -X GET "http://localhost:3000/reportes-notas/asignatura/4/distribucion?anio=2025" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Pendientes de evaluación
curl -X GET "http://localhost:3000/reportes-notas/evaluacion/19/pendientes" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📱 Integración con Frontend

### React/TypeScript - Tipos de Datos

```typescript
// types/reportes.types.ts

export interface RankingAlumno {
  id: number;
  alumnoId: number;
  cursoId: number;
  anioAcademico: string;
  promedioGeneral: number;
  alumno: {
    id_alumno: number;
    nombre: string;
    apellido: string;
    numeroMatricula: string;
    fecha_nacimiento: string;
    direccion: string;
    telefono: string;
    email: string;
    genero: string;
  };
}

export interface DistribucionNotas {
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  stddev: number | null;
}

export interface AlumnoPendiente {
  id_alumno: number;
  nombre: string;
  apellido: string;
}

export interface EvaluacionPendientes {
  evaluacion: {
    id_evaluacion: number;
    nombre: string;
  };
  total_alumnos: number;
  registrados: number;
  pendientes: AlumnoPendiente[];
}
```

### Servicios API

```typescript
// services/reportesApi.ts
import axios from 'axios';
import type { RankingAlumno, DistribucionNotas, EvaluacionPendientes } from '@/types/reportes.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const reportesApi = {
  // Ranking de curso
  getRankingCurso: async (
    cursoId: number, 
    anio?: string, 
    top: number = 10
  ): Promise<RankingAlumno[]> => {
    const params = new URLSearchParams();
    if (anio) params.append('anio', anio);
    params.append('top', top.toString());
    
    const response = await axios.get(
      `${API_BASE_URL}/reportes-notas/curso/${cursoId}/ranking?${params}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  },

  // Distribución de asignatura
  getDistribucionAsignatura: async (
    asignaturaId: number,
    anio?: string
  ): Promise<DistribucionNotas> => {
    const params = anio ? `?anio=${anio}` : '';
    const response = await axios.get(
      `${API_BASE_URL}/reportes-notas/asignatura/${asignaturaId}/distribucion${params}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  },

  // Pendientes de evaluación
  getPendientesEvaluacion: async (
    evaluacionId: number
  ): Promise<EvaluacionPendientes> => {
    const response = await axios.get(
      `${API_BASE_URL}/reportes-notas/evaluacion/${evaluacionId}/pendientes`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return response.data;
  }
};

// Helper para obtener token del localStorage o context
const getToken = () => localStorage.getItem('authToken') || '';
```

### React Hooks Personalizados

```typescript
// hooks/useReportesAdmin.ts
import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '@/services/reportesApi';

export const useRankingCurso = (cursoId: number, anio?: string, top: number = 10) => {
  return useQuery({
    queryKey: ['ranking-curso', cursoId, anio, top],
    queryFn: () => reportesApi.getRankingCurso(cursoId, anio, top),
    enabled: !!cursoId,
  });
};

export const useDistribucionAsignatura = (asignaturaId: number, anio?: string) => {
  return useQuery({
    queryKey: ['distribucion-asignatura', asignaturaId, anio],
    queryFn: () => reportesApi.getDistribucionAsignatura(asignaturaId, anio),
    enabled: !!asignaturaId,
  });
};

export const usePendientesEvaluacion = (evaluacionId: number) => {
  return useQuery({
    queryKey: ['pendientes-evaluacion', evaluacionId],
    queryFn: () => reportesApi.getPendientesEvaluacion(evaluacionId),
    enabled: !!evaluacionId,
  });
};
```

### Componentes de Ejemplo

```tsx
// components/RankingCurso.tsx
import { useRankingCurso } from '@/hooks/useReportesAdmin';

export const RankingCurso = ({ cursoId }: { cursoId: number }) => {
  const { data: ranking, isLoading, error } = useRankingCurso(cursoId, '2025', 10);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message="Error al cargar ranking" />;

  return (
    <div className="ranking-list">
      <h2>Top 10 - Mejores Alumnos</h2>
      {ranking?.map((item, index) => (
        <div key={item.id} className="ranking-item">
          <span className="position">#{index + 1}</span>
          <span className="name">{item.alumno.nombre} {item.alumno.apellido}</span>
          <span className="score">{item.promedioGeneral.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

// components/DistribucionChart.tsx
import { useDistribucionAsignatura } from '@/hooks/useReportesAdmin';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const DistribucionChart = ({ asignaturaId }: { asignaturaId: number }) => {
  const { data, isLoading } = useDistribucionAsignatura(asignaturaId, '2025');

  if (isLoading || !data || data.count === 0) return <NoData />;

  const chartData = [
    { name: 'Mínimo', value: data.min },
    { name: 'Promedio', value: data.mean },
    { name: 'Mediana', value: data.median },
    { name: 'Máximo', value: data.max },
  ];

  return (
    <div>
      <h3>Distribución de Calificaciones</h3>
      <p>Total de notas: {data.count} | Desviación: {data.stddev?.toFixed(2)}</p>
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

// components/PendientesEvaluacion.tsx
import { usePendientesEvaluacion } from '@/hooks/useReportesAdmin';

export const PendientesEvaluacion = ({ evaluacionId }: { evaluacionId: number }) => {
  const { data, isLoading } = usePendientesEvaluacion(evaluacionId);

  if (isLoading) return <Spinner />;
  if (!data) return null;

  const porcentaje = (data.registrados / data.total_alumnos) * 100;
  const estado = porcentaje === 100 ? '🟢 Completo' : 
                 porcentaje >= 80 ? '🟡 Casi completo' : '🔴 Pendiente';

  return (
    <div className="pendientes-card">
      <h3>{data.evaluacion.nombre}</h3>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${porcentaje}%` }}>
          {data.registrados}/{data.total_alumnos} ({porcentaje.toFixed(0)}%)
        </div>
      </div>
      <p>{estado}</p>
      
      {data.pendientes.length > 0 && (
        <div className="pendientes-list">
          <h4>Alumnos sin calificación:</h4>
          <ul>
            {data.pendientes.map(alumno => (
              <li key={alumno.id_alumno}>
                {alumno.nombre} {alumno.apellido}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 Resumen de Endpoints

| Endpoint | Método | Propósito | Respuesta |
|----------|--------|-----------|-----------|
| `/reportes-notas/curso/:id/ranking` | GET | Top alumnos por promedio | Array de alumnos con promedios |
| `/reportes-notas/asignatura/:id/distribucion` | GET | Estadísticas de notas | Objeto con min, max, mean, median, stddev |
| `/reportes-notas/evaluacion/:id/pendientes` | GET | Alumnos sin nota | Objeto con lista de pendientes |

**Todos requieren roles: Admin o P.A** 🔴
