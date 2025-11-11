# 🚀 Guía Rápida de Integración - Frontend# 📘 Guía Frontend - Sistema de Evaluación

Esta guía proporciona todo el código necesario para integrar el Sistema de Evaluación Dual en el frontend.## API de Gestión de Notas y Boletas del Liceo Latinoamericano

## 📋 Documentos de Referencia> **Última actualización:** 7 de noviembre de 2025

> **Base URL:** `http://localhost:3000/sistema-evaluacion`

1. **`DOCUMENTACION-API-SISTEMA-EVALUACION.md`** - Documentación completa de la API> **Autor:** Sistema de Evaluación CAI Backend

2. **`RESUMEN-CORRECCIONES-SISTEMA-EVALUACION.md`** - Cambios realizados y estado actual

3. **Este documento** - Código listo para usar en el frontend---

---## 📋 Tabla de Contenidos

## ⚡ Quick Start1. [Información General](#información-general)

2. [Endpoints POST - Registro de Notas](#endpoints-post---registro-de-notas)

### 1. Base URL3. [Endpoints GET - Reportes para Alumnos/Padres](#endpoints-get---reportes-para-alumnospadres)

````typescript4. [Endpoints GET - Reportes para Administradores](#endpoints-get---reportes-para-administradores)

const API_BASE_URL = 'http://localhost:3000/sistema-evaluacion';5. [Casos de Uso Frontend](#casos-de-uso-frontend)

```6. [Estructura de Respuestas](#estructura-de-respuestas)

7. [Manejo de Errores](#manejo-de-errores)

### 2. Flujo de Trabajo8. [Ejemplos de Implementación](#ejemplos-de-implementación)

````

1. Usuario selecciona Asignatura---

   ↓

2. Frontend obtiene configuración (GET /configuracion-evaluacion/:id)## 📌 Información General

   ↓

3. Frontend adapta UI según nivel (BASICA vs BACHILLERATO)### Sistema de Cálculo de Notas

   ↓

4. Usuario completa formularioEl sistema implementa la metodología oficial del Liceo Latinoamericano:

   ↓

5. Frontend valida datos#### Fórmula de Nota Mensual

   ↓

6. Frontend envía registro (POST /nota-mensual)```

   ↓Promedio Actividades = Suma(actividades) / Cantidad

7. Backend calcula y retorna nota finalNota Mensual = (Promedio Actividades × 70%) + (Examen Mensual × 30%)

````



---#### Fórmula de Nota Trimestral



## 📝 Puntos Clave```

Trimestre 1: Febrero(28%) + Marzo(27%) + Abril(45%)

### ✅ Siempre Hacer:Trimestre 2: Mayo(28%) + Junio(27%) + Julio(45%)

- Obtener configuración antes de mostrar formulariosTrimestre 3: Agosto(28%) + Septiembre(27%) + Octubre(45%)

- Validar categorías en Bachillerato (4 obligatorias)```

- Incluir `examen_parcial` para Bachillerato

- Usar nombres completos de meses: "Febrero", "Periodo 1"### Tipos de Actividades

- Multiplicar porcentajes × 100 para mostrar

- **Tarea** (id: 1)

### ❌ Nunca Hacer:- **Revisión de libros y cuadernos** (id: 2)

- Enviar campo `nivel` (se detecta automáticamente)- **Laboratorio escrito** (id: 3)

- Usar números para meses (usar "Febrero" no "2")- **Proyecto** (id: 4)

- Omitir `examen_parcial` en Bachillerato- **Exposición** (id: 5)

- Mezclar tipos de actividades entre niveles

---

---

## 🔐 Endpoints POST - Registro de Notas

## 🔧 Código de Producción

### 1. POST `/nota-mensual`

Ver en este repositorio:

- `DOCUMENTACION-API-SISTEMA-EVALUACION.md` - Endpoints completos con ejemplos**Propósito:** Registrar las actividades y examen mensual de un alumno

- `scripts/test-sistema-evaluacion-completo.sh` - Ejemplos de llamadas curl**Usado por:** Profesores para ingresar notas

**Guarda en BD:** ✅ Sí (tabla `NotaMensual` y `ActividadEvaluacion`)

---

#### Request Body

## 📊 Formatos de Respuesta

```typescript

### BÁSICA{

```json  id_alumno: number;          // ID del alumno

{  id_asignatura: number;      // ID de la asignatura

  "nivel": "BASICA",  mes: string;                // "Febrero", "Marzo", "Abril", etc.

  "actividades": [...],  trimestre: number;          // 1, 2 o 3

  "calculo": {  anio_academico: string;     // "2025"

    "promedio_70_actividades": 6.125,  actividades: [              // Mínimo 1 actividad requerida

    "promedio_30_examen": 2.64    {

  },      id_tipo_actividad: number;   // 1=Tarea, 2=Revisión, 3=Laboratorio

  "nota_mensual": 8.765      numero_actividad: number | null;  // Número de la actividad (null si no aplica)

}      nota: number;                     // Nota de 0-10

```    }

  ];

### BACHILLERATO  examen_mensual: number;     // Nota del examen (0-10)

```json}

{```

  "nivel": "BACHILLERATO",

  "componentes": {#### Ejemplo cURL

    "actividades_integradoras": {promedio, peso: 0.25, aporte},

    "tareas": {promedio, peso: 0.05, aporte},```bash

    "coevaluaciones": {promedio, peso: 0.05, aporte},curl -X POST http://localhost:3000/sistema-evaluacion/nota-mensual \

    "laboratorios": {promedio, peso: 0.10, aporte},  -H "Content-Type: application/json" \

    "examen_parcial": {nota, peso: 0.25, aporte},  -d '{

    "examen_periodo": {nota, peso: 0.30, aporte}    "id_alumno": 1,

  },    "id_asignatura": 1,

  "nota_mensual": 8.735    "mes": "Febrero",

}    "trimestre": 1,

```    "anio_academico": "2025",

    "actividades": [

---      { "id_tipo_actividad": 1, "numero_actividad": 1, "nota": 8.0 },

      { "id_tipo_actividad": 2, "numero_actividad": null, "nota": 9.0 },

## 🧪 Testing      { "id_tipo_actividad": 1, "numero_actividad": 2, "nota": 7.5 },

      { "id_tipo_actividad": 3, "numero_actividad": 1, "nota": 8.5 }

```bash    ],

# Ejecutar pruebas del backend    "examen_mensual": 9.0

./scripts/test-sistema-evaluacion-completo.sh  }'

````

---#### Response

## 📞 Soporte```json

{

- **Documentación API**: Ver `DOCUMENTACION-API-SISTEMA-EVALUACION.md` "id_alumno": 1,

- **Ejemplos**: Ver `scripts/test-sistema-evaluacion-completo.sh` "id_asignatura": 1,

- **Swagger**: http://localhost:3000/api "mes": "Febrero",

  "trimestre": 1,

--- "anio_academico": "2025",

"actividades": [

**Versión**: 2.0 - Sistema Dual Completo {

      "id_tipo_actividad": 1,
      "tipo_actividad_nombre": "Tarea",
      "numero_actividad": 1,
      "nombre_completo": "Tarea 1",
      "nota": 8.0
    },
    {
      "id_tipo_actividad": 2,
      "tipo_actividad_nombre": "Revisión de libros y cuadernos",
      "numero_actividad": null,
      "nombre_completo": "Revisión de libros y cuadernos",
      "nota": 9.0
    }

],
"examen_mensual": 9.0,
"promedio_puro_actividades": 8.25,
"promedio_70_actividades": 5.78,
"promedio_30_examen": 2.7,
"nota_mensual": 8.48,
"porcentaje_aporte_trimestre": 28,
"aporte_al_trimestre": 2.37,
"fecha_registro": "2025-11-07T10:30:00.000Z"
}

````

---

### 2. POST `/nota-trimestral`

**Propósito:** Calcular y guardar la nota trimestral automáticamente
**Usado por:** Sistema automático o profesores al cerrar trimestre
**Guarda en BD:** ✅ Sí (tabla `NotaTrimestral`)

#### Request Body

```typescript
{
  id_alumno: number;
  id_asignatura: number;
  trimestre: number; // 1, 2 o 3
  anio_academico: string; // "2025"
}
````

#### Ejemplo cURL

```bash
curl -X POST http://localhost:3000/sistema-evaluacion/nota-trimestral \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "trimestre": 1,
    "anio_academico": "2025"
  }'
```

#### Response

```json
{
  "id_alumno": 1,
  "id_asignatura": 1,
  "trimestre": 1,
  "anio_academico": "2025",
  "notas_mensuales": [
    {
      "mes": "Febrero",
      "nota_mensual": 8.48,
      "porcentaje": 28,
      "aporte": 2.37
    },
    {
      "mes": "Marzo",
      "nota_mensual": 8.59,
      "porcentaje": 27,
      "aporte": 2.32
    },
    {
      "mes": "Abril",
      "nota_mensual": 8.63,
      "porcentaje": 45,
      "aporte": 3.88
    }
  ],
  "nota_trimestral": 8.57,
  "fecha_calculo": "2025-11-07T10:35:00.000Z"
}
```

---

## 👨‍🎓 Endpoints GET - Reportes para Alumnos/Padres

Estos endpoints están diseñados para **portales de alumnos y padres** donde se consulta información de UN alumno específico.

### 3. GET `/reporte-mensual-alumno/:id_alumno/:id_asignatura`

**Propósito:** Generar boleta mensual de UNA asignatura  
**Caso de uso:** Ver detalle de notas de Matemática en Febrero  
**Incluye:** ✅ Todas las actividades, ✅ Examen, ✅ Cálculos detallados

#### Parámetros

- **Path:** `id_alumno`, `id_asignatura`
- **Query:** `mes`, `trimestre`, `anio_academico`

#### Ejemplo cURL

```bash
curl "http://localhost:3000/sistema-evaluacion/reporte-mensual-alumno/1/1?mes=Febrero&trimestre=1&anio_academico=2025"
```

#### Response

```json
{
  "alumno": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "curso": "Quinto Grado"
  },
  "asignatura": {
    "id": 1,
    "nombre": "Matemática I"
  },
  "periodo": {
    "mes": "Febrero",
    "trimestre": 1,
    "anio_academico": "2025",
    "porcentaje_aporte": 28
  },
  "actividades": [
    {
      "tipo": "Tarea",
      "numero": 1,
      "nota": 8.0
    },
    {
      "tipo": "Revisión de libros y cuadernos",
      "numero": null,
      "nota": 9.0
    },
    {
      "tipo": "Tarea",
      "numero": 2,
      "nota": 7.5
    },
    {
      "tipo": "Laboratorio escrito",
      "numero": 1,
      "nota": 8.5
    }
  ],
  "examen_mensual": 9.0,
  "promedio_actividades": 8.25,
  "nota_mensual": 8.48,
  "aporte_al_trimestre": 2.37
}
```

#### 💡 Uso en Frontend (React/TypeScript)

```typescript
interface ReporteMensualAsignatura {
  alumno: {
    id: number;
    nombre_completo: string;
    curso: string;
  };
  asignatura: {
    id: number;
    nombre: string;
  };
  periodo: {
    mes: string;
    trimestre: number;
    anio_academico: string;
    porcentaje_aporte: number;
  };
  actividades: Array<{
    tipo: string;
    numero: number | null;
    nota: number;
  }>;
  examen_mensual: number;
  promedio_actividades: number;
  nota_mensual: number;
  aporte_al_trimestre: number;
}

async function obtenerBoletaMensual(
  idAlumno: number,
  idAsignatura: number,
  mes: string,
  trimestre: number,
  anioAcademico: string,
): Promise<ReporteMensualAsignatura> {
  const response = await fetch(
    `http://localhost:3000/sistema-evaluacion/reporte-mensual-alumno/${idAlumno}/${idAsignatura}?mes=${mes}&trimestre=${trimestre}&anio_academico=${anioAcademico}`,
  );
  return response.json();
}
```

---

### 4. GET `/consolidado-mensual-alumno/:id_alumno`

**Propósito:** Generar boleta mensual con TODAS las asignaturas  
**Caso de uso:** Boleta completa del alumno en Febrero  
**Incluye:** ✅ Todas las asignaturas, ✅ Actividades de cada una, ✅ Promedio general

#### Parámetros

- **Path:** `id_alumno`
- **Query:** `mes`, `trimestre`, `anio_academico`

#### Ejemplo cURL

```bash
curl "http://localhost:3000/sistema-evaluacion/consolidado-mensual-alumno/1?mes=Febrero&trimestre=1&anio_academico=2025"
```

#### Response (MEJORADA con actividades)

```json
{
  "alumno": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "curso": "Quinto Grado"
  },
  "periodo": {
    "mes": "Febrero",
    "trimestre": 1,
    "anio_academico": "2025",
    "porcentaje_aporte": 28
  },
  "resumen": {
    "total_asignaturas": 8,
    "asignaturas_evaluadas": 8,
    "promedio_general": 8.48
  },
  "asignaturas": [
    {
      "id_asignatura": 1,
      "nombre": "Matemática I",
      "actividades": [
        { "tipo": "Tarea", "numero": 1, "nota": 8.0 },
        {
          "tipo": "Revisión de libros y cuadernos",
          "numero": null,
          "nota": 9.0
        },
        { "tipo": "Tarea", "numero": 2, "nota": 7.5 },
        { "tipo": "Laboratorio escrito", "numero": 1, "nota": 8.5 }
      ],
      "examen_mensual": 9.0,
      "promedio_actividades": 8.25,
      "calculo": {
        "promedio_70_actividades": 5.78,
        "promedio_30_examen": 2.7
      },
      "nota_mensual": 8.48,
      "aporte_al_trimestre": 2.37,
      "tiene_nota": true
    },
    {
      "id_asignatura": 2,
      "nombre": "Lenguaje y Literatura",
      "actividades": [
        { "tipo": "Tarea", "numero": 1, "nota": 9.0 },
        { "tipo": "Exposición", "numero": 1, "nota": 8.5 }
      ],
      "examen_mensual": 8.5,
      "promedio_actividades": 8.75,
      "calculo": {
        "promedio_70_actividades": 6.13,
        "promedio_30_examen": 2.55
      },
      "nota_mensual": 8.68,
      "aporte_al_trimestre": 2.43,
      "tiene_nota": true
    }
  ]
}
```

#### 💡 Uso en Frontend

```typescript
// Componente para mostrar boleta mensual completa
function BoletaMensualCompleta({ idAlumno, mes, trimestre }: Props) {
  const [boleta, setBoleta] = useState<ConsolidadoMensual | null>(null);

  useEffect(() => {
    fetch(`/sistema-evaluacion/consolidado-mensual-alumno/${idAlumno}?mes=${mes}&trimestre=${trimestre}&anio_academico=2025`)
      .then(res => res.json())
      .then(data => setBoleta(data));
  }, [idAlumno, mes, trimestre]);

  return (
    <div className="boleta-mensual">
      <h2>Boleta Mensual - {boleta?.periodo.mes} {boleta?.periodo.anio_academico}</h2>
      <div className="info-alumno">
        <p><strong>Alumno:</strong> {boleta?.alumno.nombre_completo}</p>
        <p><strong>Curso:</strong> {boleta?.alumno.curso}</p>
        <p><strong>Promedio General:</strong> {boleta?.resumen.promedio_general}</p>
      </div>

      {boleta?.asignaturas.map(asignatura => (
        <div key={asignatura.id_asignatura} className="asignatura-card">
          <h3>{asignatura.nombre}</h3>

          {/* Tabla de Actividades */}
          <table>
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {asignatura.actividades.map((act, idx) => (
                <tr key={idx}>
                  <td>{act.tipo} {act.numero ? act.numero : ''}</td>
                  <td>{act.nota}</td>
                </tr>
              ))}
              <tr className="examen-row">
                <td><strong>Examen Mensual</strong></td>
                <td><strong>{asignatura.examen_mensual}</strong></td>
              </tr>
            </tbody>
          </table>

          {/* Cálculos */}
          <div className="calculos">
            <p>Promedio Actividades (70%): {asignatura.calculo.promedio_70_actividades}</p>
            <p>Examen (30%): {asignatura.calculo.promedio_30_examen}</p>
            <p className="nota-final"><strong>Nota Mensual: {asignatura.nota_mensual}</strong></p>
            <p>Aporte al Trimestre: {asignatura.aporte_al_trimestre}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 5. GET `/reporte-trimestral-alumno/:id_alumno/:id_asignatura`

**Propósito:** Reporte trimestral de UNA asignatura  
**Caso de uso:** Ver progreso del alumno en Matemática durante el trimestre  
**Incluye:** ✅ Desglose mes por mes, ✅ Nota trimestral

#### Ejemplo cURL

```bash
curl "http://localhost:3000/sistema-evaluacion/reporte-trimestral-alumno/1/1?trimestre=1&anio_academico=2025"
```

#### Response

```json
{
  "alumno": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "curso": "Quinto Grado"
  },
  "asignatura": {
    "id": 1,
    "nombre": "Matemática I"
  },
  "periodo": {
    "trimestre": 1,
    "anio_academico": "2025",
    "meses": ["Febrero", "Marzo", "Abril"]
  },
  "desglose_mensual": [
    {
      "mes": "Febrero",
      "nota_mensual": 8.48,
      "aporte": 2.37,
      "porcentaje": 28
    },
    {
      "mes": "Marzo",
      "nota_mensual": 8.59,
      "aporte": 2.32,
      "porcentaje": 27
    },
    {
      "mes": "Abril",
      "nota_mensual": 8.63,
      "aporte": 3.88,
      "porcentaje": 45
    }
  ],
  "nota_trimestral": 8.57
}
```

---

### 6. GET `/consolidado-trimestral-alumno/:id_alumno`

**Propósito:** Boleta trimestral completa con TODAS las asignaturas  
**Caso de uso:** Boleta oficial del trimestre para entregar a padres  
**Incluye:** ✅ Todas las asignaturas, ✅ Desglose mensual de cada una, ✅ Actividades mes por mes

#### Ejemplo cURL

```bash
curl "http://localhost:3000/sistema-evaluacion/consolidado-trimestral-alumno/1?trimestre=1&anio_academico=2025"
```

#### Response (MEJORADA con actividades)

```json
{
  "alumno": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "curso": "Quinto Grado"
  },
  "periodo": {
    "trimestre": 1,
    "anio_academico": "2025",
    "meses": ["Febrero", "Marzo", "Abril"]
  },
  "resumen": {
    "total_asignaturas": 8,
    "asignaturas_evaluadas": 8,
    "promedio_trimestral": 8.55
  },
  "asignaturas": [
    {
      "id_asignatura": 1,
      "nombre": "Matemática I",
      "desglose_mensual": [
        {
          "mes": "Febrero",
          "porcentaje": 28,
          "actividades": [
            { "tipo": "Tarea", "numero": 1, "nota": 8.0 },
            {
              "tipo": "Revisión de libros y cuadernos",
              "numero": null,
              "nota": 9.0
            },
            { "tipo": "Tarea", "numero": 2, "nota": 7.5 },
            { "tipo": "Laboratorio escrito", "numero": 1, "nota": 8.5 }
          ],
          "examen_mensual": 9.0,
          "promedio_actividades": 8.25,
          "calculo": {
            "promedio_70_actividades": 5.78,
            "promedio_30_examen": 2.7
          },
          "nota_mensual": 8.48,
          "aporte": 2.37
        },
        {
          "mes": "Marzo",
          "porcentaje": 27,
          "actividades": [
            { "tipo": "Tarea", "numero": 3, "nota": 9.0 },
            { "tipo": "Proyecto", "numero": 1, "nota": 8.5 }
          ],
          "examen_mensual": 8.5,
          "promedio_actividades": 8.75,
          "calculo": {
            "promedio_70_actividades": 6.13,
            "promedio_30_examen": 2.55
          },
          "nota_mensual": 8.68,
          "aporte": 2.34
        },
        {
          "mes": "Abril",
          "porcentaje": 45,
          "actividades": [
            { "tipo": "Tarea", "numero": 4, "nota": 8.5 },
            { "tipo": "Exposición", "numero": 1, "nota": 9.0 }
          ],
          "examen_mensual": 9.0,
          "promedio_actividades": 8.75,
          "calculo": {
            "promedio_70_actividades": 6.13,
            "promedio_30_examen": 2.7
          },
          "nota_mensual": 8.83,
          "aporte": 3.97
        }
      ],
      "nota_trimestral": 8.68,
      "tiene_nota": true
    }
  ]
}
```

#### 💡 Uso en Frontend - Boleta Trimestral Imprimible

```typescript
function BoletaTrimestralImprimible({ idAlumno, trimestre }: Props) {
  const [boleta, setBoleta] = useState<ConsolidadoTrimestral | null>(null);

  useEffect(() => {
    fetch(`/sistema-evaluacion/consolidado-trimestral-alumno/${idAlumno}?trimestre=${trimestre}&anio_academico=2025`)
      .then(res => res.json())
      .then(data => setBoleta(data));
  }, [idAlumno, trimestre]);

  const imprimirBoleta = () => {
    window.print();
  };

  return (
    <div className="boleta-trimestral-imprimible">
      {/* Header */}
      <header className="boleta-header">
        <img src="/logo-liceo.png" alt="Logo" />
        <h1>LICEO LATINOAMERICANO</h1>
        <h2>Boleta de Calificaciones - Trimestre {boleta?.periodo.trimestre}</h2>
        <p>Año Académico {boleta?.periodo.anio_academico}</p>
      </header>

      {/* Información del Alumno */}
      <section className="info-alumno">
        <p><strong>Nombre:</strong> {boleta?.alumno.nombre_completo}</p>
        <p><strong>Curso:</strong> {boleta?.alumno.curso}</p>
        <p><strong>Promedio Trimestral:</strong> {boleta?.resumen.promedio_trimestral}</p>
      </section>

      {/* Tabla de Asignaturas */}
      {boleta?.asignaturas.map(asignatura => (
        <section key={asignatura.id_asignatura} className="asignatura-detalle">
          <h3>{asignatura.nombre}</h3>

          {/* Tabla de Meses */}
          {asignatura.desglose_mensual.map((mes, idx) => (
            <div key={idx} className="mes-detalle">
              <h4>{mes.mes} ({mes.porcentaje}%)</h4>

              {mes.actividades.length > 0 ? (
                <>
                  <table className="tabla-actividades">
                    <thead>
                      <tr>
                        <th>Actividad</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mes.actividades.map((act, actIdx) => (
                        <tr key={actIdx}>
                          <td>{act.tipo} {act.numero || ''}</td>
                          <td>{act.nota.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="subtotal">
                        <td><strong>Promedio Actividades (70%)</strong></td>
                        <td><strong>{mes.calculo.promedio_70_actividades.toFixed(2)}</strong></td>
                      </tr>
                      <tr className="examen">
                        <td><strong>Examen Mensual (30%)</strong></td>
                        <td><strong>{mes.examen_mensual.toFixed(2)}</strong></td>
                      </tr>
                      <tr className="total">
                        <td><strong>Nota Mensual</strong></td>
                        <td><strong>{mes.nota_mensual.toFixed(2)}</strong></td>
                      </tr>
                      <tr className="aporte">
                        <td><em>Aporte al Trimestre</em></td>
                        <td><em>{mes.aporte.toFixed(2)}</em></td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="sin-notas">Sin evaluaciones registradas</p>
              )}
            </div>
          ))}

          {/* Nota Trimestral Final */}
          <div className="nota-trimestral-final">
            <strong>NOTA TRIMESTRAL: {asignatura.nota_trimestral.toFixed(2)}</strong>
          </div>
        </section>
      ))}

      {/* Firma */}
      <footer className="firmas">
        <div className="firma">
          <p>_______________________</p>
          <p>Firma del Profesor</p>
        </div>
        <div className="firma">
          <p>_______________________</p>
          <p>Firma del Director</p>
        </div>
        <div className="firma">
          <p>_______________________</p>
          <p>Firma del Padre/Madre</p>
        </div>
      </footer>

      <button onClick={imprimirBoleta} className="btn-imprimir no-print">
        🖨️ Imprimir Boleta
      </button>
    </div>
  );
}
```

---

## 👨‍💼 Endpoints GET - Reportes para Administradores

Estos endpoints están diseñados para **dashboards administrativos** donde se consulta información de TODOS los alumnos de un curso.

### 7. GET `/consolidado-mensual-curso/:id_curso/:id_asignatura`

**Propósito:** Ver notas mensuales de todos los alumnos del curso  
**Caso de uso:** Profesor revisa el desempeño general del curso en Matemática  
**Incluye:** ✅ Listado completo de alumnos, ✅ Estadísticas del curso

#### Ejemplo cURL

```bash
curl "http://localhost:3000/sistema-evaluacion/consolidado-mensual-curso/1/1?mes=Febrero&trimestre=1&anio_academico=2025"
```

#### Response

```json
{
  "curso": {
    "id": 1,
    "nombre": "Quinto Grado"
  },
  "asignatura": {
    "id": 1,
    "nombre": "Matemática I"
  },
  "periodo": {
    "mes": "Febrero",
    "trimestre": 1,
    "anio_academico": "2025",
    "porcentaje_aporte": 28
  },
  "estadisticas": {
    "total_alumnos": 25,
    "promedio_general": 8.35,
    "nota_maxima": 9.5,
    "nota_minima": 6.8
  },
  "alumnos": [
    {
      "id_alumno": 1,
      "nombre_completo": "García López, Ana María",
      "promedio_actividades": 8.5,
      "examen_mensual": 9.0,
      "nota_mensual": 8.65,
      "aporte_al_trimestre": 2.42
    },
    {
      "id_alumno": 2,
      "nombre_completo": "Martínez Pérez, Carlos José",
      "promedio_actividades": 7.8,
      "examen_mensual": 8.5,
      "nota_mensual": 8.01,
      "aporte_al_trimestre": 2.24
    }
    // ... más alumnos
  ]
}
```

---

### 8. GET `/consolidado-trimestral-curso/:id_curso/:id_asignatura`

**Propósito:** Ver notas trimestrales de todos los alumnos del curso  
**Caso de uso:** Reporte final del trimestre para la dirección  
**Incluye:** ✅ Desglose mensual por alumno, ✅ Notas trimestrales

#### Ejemplo cURL

```bash
curl "http://localhost:3000/sistema-evaluacion/consolidado-trimestral-curso/1/1?trimestre=1&anio_academico=2025"
```

#### Response

```json
{
  "curso": {
    "id": 1,
    "nombre": "Quinto Grado"
  },
  "asignatura": {
    "id": 1,
    "nombre": "Matemática I"
  },
  "periodo": {
    "trimestre": 1,
    "anio_academico": "2025",
    "meses": ["Febrero", "Marzo", "Abril"]
  },
  "estadisticas": {
    "total_alumnos": 25,
    "promedio_general": 8.42,
    "nota_maxima": 9.2,
    "nota_minima": 7.1
  },
  "alumnos": [
    {
      "id_alumno": 1,
      "nombre_completo": "García López, Ana María",
      "desglose_mensual": [
        {
          "mes": "Febrero",
          "nota_mensual": 8.65,
          "aporte": 2.42
        },
        {
          "mes": "Marzo",
          "nota_mensual": 8.75,
          "aporte": 2.36
        },
        {
          "mes": "Abril",
          "nota_mensual": 8.9,
          "aporte": 4.01
        }
      ],
      "nota_trimestral": 8.79
    }
    // ... más alumnos
  ]
}
```

#### 💡 Uso en Frontend - Dashboard Administrativo

```typescript
function DashboardProfesor({ idCurso, idAsignatura, trimestre }: Props) {
  const [reporte, setReporte] = useState<ConsolidadoCurso | null>(null);
  const [ordenamiento, setOrdenamiento] = useState<'alfabetico' | 'nota'>('alfabetico');

  useEffect(() => {
    fetch(`/sistema-evaluacion/consolidado-trimestral-curso/${idCurso}/${idAsignatura}?trimestre=${trimestre}&anio_academico=2025`)
      .then(res => res.json())
      .then(data => setReporte(data));
  }, [idCurso, idAsignatura, trimestre]);

  const alumnosOrdenados = useMemo(() => {
    if (!reporte) return [];

    return [...reporte.alumnos].sort((a, b) => {
      if (ordenamiento === 'alfabetico') {
        return a.nombre_completo.localeCompare(b.nombre_completo);
      } else {
        return b.nota_trimestral - a.nota_trimestral;
      }
    });
  }, [reporte, ordenamiento]);

  return (
    <div className="dashboard-profesor">
      <h1>{reporte?.asignatura.nombre} - {reporte?.curso.nombre}</h1>
      <h2>Trimestre {reporte?.periodo.trimestre} - {reporte?.periodo.anio_academico}</h2>

      {/* Estadísticas Generales */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <h3>Total Alumnos</h3>
          <p className="stat-value">{reporte?.estadisticas.total_alumnos}</p>
        </div>
        <div className="stat-card">
          <h3>Promedio General</h3>
          <p className="stat-value">{reporte?.estadisticas.promedio_general.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Nota Máxima</h3>
          <p className="stat-value success">{reporte?.estadisticas.nota_maxima.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Nota Mínima</h3>
          <p className="stat-value warning">{reporte?.estadisticas.nota_minima.toFixed(2)}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="controles">
        <button onClick={() => setOrdenamiento('alfabetico')}>
          Orden Alfabético
        </button>
        <button onClick={() => setOrdenamiento('nota')}>
          Orden por Nota
        </button>
        <button onClick={() => exportarExcel(reporte)}>
          📊 Exportar a Excel
        </button>
      </div>

      {/* Tabla de Alumnos */}
      <table className="tabla-alumnos">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Febrero (28%)</th>
            <th>Marzo (27%)</th>
            <th>Abril (45%)</th>
            <th>Nota Trimestral</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {alumnosOrdenados.map(alumno => {
            const [feb, mar, abr] = alumno.desglose_mensual;
            const estado = alumno.nota_trimestral >= 7 ? 'Aprobado' : 'Reprobado';
            const estadoClass = estado === 'Aprobado' ? 'success' : 'danger';

            return (
              <tr key={alumno.id_alumno}>
                <td>{alumno.nombre_completo}</td>
                <td>{feb.nota_mensual.toFixed(2)}</td>
                <td>{mar.nota_mensual.toFixed(2)}</td>
                <td>{abr.nota_mensual.toFixed(2)}</td>
                <td className="nota-trimestral">
                  <strong>{alumno.nota_trimestral.toFixed(2)}</strong>
                </td>
                <td className={estadoClass}>{estado}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Gráfico de Distribución */}
      <div className="grafico-distribucion">
        <h3>Distribución de Notas</h3>
        {/* Aquí puedes integrar Chart.js o Recharts */}
      </div>
    </div>
  );
}
```

---

## 🎯 Casos de Uso Frontend

### Caso 1: Portal de Alumnos/Padres

**Objetivo:** Ver boletas mensuales y trimestrales

```typescript
// Página: MisBoletas.tsx
function MisBoletas() {
  const { idAlumno } = useAuth(); // Del contexto de autenticación
  const [trimestre, setTrimestre] = useState(1);
  const [mes, setMes] = useState('Febrero');

  // Seleccionar boleta mensual o trimestral
  const [tipoBoleta, setTipoBoleta] = useState<'mensual' | 'trimestral'>('mensual');

  return (
    <div>
      <h1>Mis Boletas de Calificaciones</h1>

      {/* Selector */}
      <div className="selectores">
        <select value={tipoBoleta} onChange={e => setTipoBoleta(e.target.value)}>
          <option value="mensual">Boleta Mensual</option>
          <option value="trimestral">Boleta Trimestral</option>
        </select>

        <select value={trimestre} onChange={e => setTrimestre(+e.target.value)}>
          <option value={1}>Trimestre 1</option>
          <option value={2}>Trimestre 2</option>
          <option value={3}>Trimestre 3</option>
        </select>

        {tipoBoleta === 'mensual' && (
          <select value={mes} onChange={e => setMes(e.target.value)}>
            <option>Febrero</option>
            <option>Marzo</option>
            <option>Abril</option>
          </select>
        )}
      </div>

      {/* Mostrar Boleta */}
      {tipoBoleta === 'mensual' ? (
        <BoletaMensualCompleta
          idAlumno={idAlumno}
          mes={mes}
          trimestre={trimestre}
        />
      ) : (
        <BoletaTrimestralImprimible
          idAlumno={idAlumno}
          trimestre={trimestre}
        />
      )}
    </div>
  );
}
```

---

### Caso 2: Panel de Profesores

**Objetivo:** Registrar notas y ver desempeño del curso

```typescript
// Página: RegistroNotas.tsx
function RegistroNotas() {
  const { idProfesor, asignaturas, cursos } = useAuth();
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number>(1);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<number>(1);
  const [mes, setMes] = useState('Febrero');
  const [trimestre, setTrimestre] = useState(1);

  const registrarNotasAlumno = async (alumno: Alumno, actividades: Actividad[], examen: number) => {
    const response = await fetch('http://localhost:3000/sistema-evaluacion/nota-mensual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_alumno: alumno.id,
        id_asignatura: asignaturaSeleccionada,
        mes,
        trimestre,
        anio_academico: '2025',
        actividades,
        examen_mensual: examen
      })
    });

    const data = await response.json();
    console.log('Nota registrada:', data);
    alert(`Nota mensual calculada: ${data.nota_mensual}`);
  };

  return (
    <div>
      <h1>Registro de Notas</h1>

      {/* Selectores */}
      <div className="controles">
        <select value={cursoSeleccionado} onChange={e => setCursoSeleccionado(+e.target.value)}>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <select value={asignaturaSeleccionada} onChange={e => setAsignaturaSeleccionada(+e.target.value)}>
          {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {/* Formulario de Registro */}
      <FormularioRegistroNotas
        curso={cursoSeleccionado}
        asignatura={asignaturaSeleccionada}
        mes={mes}
        trimestre={trimestre}
        onRegistrar={registrarNotasAlumno}
      />

      {/* Ver Consolidado del Curso */}
      <button onClick={() => verConsolidadoCurso()}>
        📊 Ver Desempeño General del Curso
      </button>
    </div>
  );
}
```

---

## 📦 Estructura de Respuestas

### Código de Estado HTTP

| Código | Descripción                                          |
| ------ | ---------------------------------------------------- |
| 200    | ✅ Operación exitosa                                 |
| 400    | ❌ Datos inválidos o mes no válido para el trimestre |
| 404    | ❌ Alumno, asignatura o curso no encontrado          |
| 500    | ❌ Error interno del servidor                        |

---

## ⚠️ Manejo de Errores

### Ejemplo de Error 404

```json
{
  "statusCode": 404,
  "message": "El alumno con ID 999 no existe",
  "error": "Not Found"
}
```

### Ejemplo de Error 400

```json
{
  "statusCode": 400,
  "message": "El mes \"Enero\" no es válido para el trimestre 1",
  "error": "Bad Request"
}
```

### Manejo en Frontend

```typescript
async function obtenerBoleta(idAlumno: number) {
  try {
    const response = await fetch(
      `/sistema-evaluacion/consolidado-mensual-alumno/${idAlumno}?mes=Febrero&trimestre=1&anio_academico=2025`,
    );

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 404) {
        alert('Alumno no encontrado');
      } else if (response.status === 400) {
        alert('Datos inválidos: ' + error.message);
      } else {
        alert('Error del servidor');
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error de conexión:', error);
    alert('No se pudo conectar con el servidor');
    return null;
  }
}
```

---

## 🚀 Ejemplos de Implementación

### Ejemplo 1: Hook personalizado para boletas

```typescript
// hooks/useBoleta.ts
import { useState, useEffect } from 'react';

interface UsBoletaParams {
  idAlumno: number;
  tipo: 'mensual' | 'trimestral';
  mes?: string;
  trimestre: number;
  anioAcademico: string;
}

export function useBoleta({ idAlumno, tipo, mes, trimestre, anioAcademico }: UsBoletaParams) {
  const [boleta, setBoleta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoleta = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = tipo === 'mensual'
          ? `/sistema-evaluacion/consolidado-mensual-alumno/${idAlumno}?mes=${mes}&trimestre=${trimestre}&anio_academico=${anioAcademico}`
          : `/sistema-evaluacion/consolidado-trimestral-alumno/${idAlumno}?trimestre=${trimestre}&anio_academico=${anioAcademico}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Error al obtener boleta');
        }

        const data = await response.json();
        setBoleta(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoleta();
  }, [idAlumno, tipo, mes, trimestre, anioAcademico]);

  return { boleta, loading, error };
}

// Uso:
function MiBoleta() {
  const { boleta, loading, error } = useBoleta({
    idAlumno: 1,
    tipo: 'mensual',
    mes: 'Febrero',
    trimestre: 1,
    anioAcademico: '2025'
  });

  if (loading) return <Spinner />;
  if (error) return <Error mensaje={error} />;

  return <BoletaView data={boleta} />;
}
```

---

### Ejemplo 2: Servicio API centralizado

```typescript
// services/sistemaEvaluacion.service.ts
const API_BASE = 'http://localhost:3000/sistema-evaluacion';

export class SistemaEvaluacionService {
  // POST - Registrar nota mensual
  static async registrarNotaMensual(data: RegistroNotaMensual) {
    const response = await fetch(`${API_BASE}/nota-mensual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // POST - Calcular nota trimestral
  static async calcularNotaTrimestral(data: CalculoNotaTrimestral) {
    const response = await fetch(`${API_BASE}/nota-trimestral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // GET - Boleta mensual de una asignatura
  static async obtenerBoletaMensualAsignatura(
    idAlumno: number,
    idAsignatura: number,
    mes: string,
    trimestre: number,
    anioAcademico: string,
  ) {
    const response = await fetch(
      `${API_BASE}/reporte-mensual-alumno/${idAlumno}/${idAsignatura}?mes=${mes}&trimestre=${trimestre}&anio_academico=${anioAcademico}`,
    );
    return response.json();
  }

  // GET - Boleta mensual consolidada
  static async obtenerBoletaMensualCompleta(
    idAlumno: number,
    mes: string,
    trimestre: number,
    anioAcademico: string,
  ) {
    const response = await fetch(
      `${API_BASE}/consolidado-mensual-alumno/${idAlumno}?mes=${mes}&trimestre=${trimestre}&anio_academico=${anioAcademico}`,
    );
    return response.json();
  }

  // GET - Boleta trimestral de una asignatura
  static async obtenerBoletaTrimestralAsignatura(
    idAlumno: number,
    idAsignatura: number,
    trimestre: number,
    anioAcademico: string,
  ) {
    const response = await fetch(
      `${API_BASE}/reporte-trimestral-alumno/${idAlumno}/${idAsignatura}?trimestre=${trimestre}&anio_academico=${anioAcademico}`,
    );
    return response.json();
  }

  // GET - Boleta trimestral consolidada
  static async obtenerBoletaTrimestralCompleta(
    idAlumno: number,
    trimestre: number,
    anioAcademico: string,
  ) {
    const response = await fetch(
      `${API_BASE}/consolidado-trimestral-alumno/${idAlumno}?trimestre=${trimestre}&anio_academico=${anioAcademico}`,
    );
    return response.json();
  }

  // GET - Consolidado mensual del curso (Admin)
  static async obtenerConsolidadoMensualCurso(
    idCurso: number,
    idAsignatura: number,
    mes: string,
    trimestre: number,
    anioAcademico: string,
  ) {
    const response = await fetch(
      `${API_BASE}/consolidado-mensual-curso/${idCurso}/${idAsignatura}?mes=${mes}&trimestre=${trimestre}&anio_academico=${anioAcademico}`,
    );
    return response.json();
  }

  // GET - Consolidado trimestral del curso (Admin)
  static async obtenerConsolidadoTrimestralCurso(
    idCurso: number,
    idAsignatura: number,
    trimestre: number,
    anioAcademico: string,
  ) {
    const response = await fetch(
      `${API_BASE}/consolidado-trimestral-curso/${idCurso}/${idAsignatura}?trimestre=${trimestre}&anio_academico=${anioAcademico}`,
    );
    return response.json();
  }
}

// Uso:
async function ejemplo() {
  const boleta = await SistemaEvaluacionService.obtenerBoletaMensualCompleta(
    1,
    'Febrero',
    1,
    '2025',
  );
  console.log(boleta);
}
```

---

## 📝 Notas Importantes

### 1. Flujo de Registro de Notas

```
1. Profesor registra actividades y examen mensual
   └─> POST /nota-mensual (se guarda en BD)

2. Sistema calcula automáticamente:
   - Promedio de actividades
   - Nota mensual (70% + 30%)
   - Aporte al trimestre

3. Al final del mes, se registra el siguiente mes

4. Al completar los 3 meses del trimestre:
   └─> POST /nota-trimestral (se guarda en BD)

5. Sistema calcula nota trimestral:
   - Suma de aportes mensuales
```

### 2. Permisos y Roles (Recomendados)

- **Profesores:** POST endpoints + GET reportes de curso
- **Alumnos/Padres:** Solo GET reportes individuales
- **Administradores:** Acceso total

### 3. Validaciones Frontend

Antes de enviar datos al backend:

```typescript
function validarNotaMensual(data: RegistroNotaMensual): string | null {
  if (!data.actividades || data.actividades.length === 0) {
    return 'Debe agregar al menos una actividad';
  }

  if (data.examen_mensual < 0 || data.examen_mensual > 10) {
    return 'El examen debe estar entre 0 y 10';
  }

  for (const act of data.actividades) {
    if (act.nota < 0 || act.nota > 10) {
      return 'Todas las notas deben estar entre 0 y 10';
    }
  }

  return null; // Válido
}
```

### 4. Optimización de Rendimiento

```typescript
// Usar React Query para cachear boletas
import { useQuery } from '@tanstack/react-query';

function useBoleta(idAlumno: number, mes: string, trimestre: number) {
  return useQuery({
    queryKey: ['boleta', idAlumno, mes, trimestre],
    queryFn: () =>
      SistemaEvaluacionService.obtenerBoletaMensualCompleta(
        idAlumno,
        mes,
        trimestre,
        '2025',
      ),
    staleTime: 5 * 60 * 1000, // Cache 5 minutos
  });
}
```

---

## 🎨 Estilos CSS para Boletas

```css
/* Estilos para impresión de boletas */
@media print {
  .no-print {
    display: none !important;
  }

  .boleta-trimestral-imprimible {
    padding: 20mm;
  }

  .asignatura-detalle {
    page-break-inside: avoid;
  }

  table {
    font-size: 10pt;
  }
}

/* Estilos generales */
.boleta-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
}

.tabla-actividades {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.tabla-actividades th,
.tabla-actividades td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.tabla-actividades th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.nota-trimestral-final {
  background-color: #4caf50;
  color: white;
  padding: 15px;
  text-align: center;
  font-size: 18px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2196f3;
}

.success {
  color: #4caf50;
}

.danger {
  color: #f44336;
}

.warning {
  color: #ff9800;
}
```

---

## 📞 Soporte

Para dudas o problemas con la implementación:

- **Backend Developer:** contacto@liceolatino.edu
- **Documentación Swagger:** http://localhost:3000/api
- **Repositorio:** GitHub CAI-backend

---

**Última actualización:** 7 de noviembre de 2025  
**Versión:** 2.0.0 (Con detalle completo de actividades para boletas)
