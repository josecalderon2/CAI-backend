# 🔍 Aclaración: Guardado de Actividades de Evaluación

**Fecha:** 8 de noviembre de 2025  
**Problema Reportado:** Las notas individuales de las actividades no se están guardando en la base de datos

---

## ✅ RESUMEN EJECUTIVO

**Respuesta:** Las actividades **SÍ se están guardando** en la base de datos, pero **en el módulo correcto**.

### El Sistema Tiene 2 Módulos:

| Módulo                   | Endpoint                           | ¿Guarda Actividades? | Estado                |
| ------------------------ | ---------------------------------- | -------------------- | --------------------- |
| **`sistema-evaluacion`** | `/sistema-evaluacion/nota-mensual` | ✅ **SÍ**            | **USAR ESTE**         |
| **`notas-mensuales`**    | `/notas-mensuales`                 | ❌ **NO**            | Obsoleto/Simplificado |

---

## 📊 Estructura de Base de Datos

### **Tabla: `NotaMensual`**

```prisma
model NotaMensual {
  id_nota_mensual              Int      @id @default(autoincrement())
  id_alumno                    Int
  id_asignatura                Int
  mes                          String
  trimestre                    Int
  anio_academico               String

  // Exámenes
  examen_mensual               Float
  examen_parcial               Float?

  // Promedios calculados
  promedio_puro_actividades    Float
  promedio_70_actividades      Float
  promedio_30_examen           Float
  nota_mensual                 Float
  porcentaje_aporte            Float
  aporte_al_trimestre          Float

  // ⭐ RELACIÓN CON ACTIVIDADES
  actividades                  ActividadEvaluacion[]  // ✅ Aquí se guardan

  // Timestamps
  fecha_registro               DateTime @default(now())
  actualizado_en               DateTime @updatedAt

  @@unique([id_alumno, id_asignatura, mes, trimestre, anio_academico])
}
```

### **Tabla: `ActividadEvaluacion`**

```prisma
model ActividadEvaluacion {
  id_actividad_evaluacion  Int      @id @default(autoincrement())
  id_nota_mensual          Int
  id_tipo_actividad        Int      // Referencia a TipoActividadEvaluacion
  numero_actividad         Int?     // Número de instancia (Tarea 1, Tarea 2, etc.)
  nota                     Float    // ⭐ LA NOTA INDIVIDUAL

  notaMensual              NotaMensual            @relation(...)
  tipoActividad            TipoActividadEvaluacion @relation(...)
}
```

---

## ✅ Módulo Correcto: `sistema-evaluacion`

### **Endpoint: `POST /sistema-evaluacion/nota-mensual`**

Este endpoint **SÍ guarda todas las actividades** en la tabla `ActividadEvaluacion`.

### **Código de Guardado (líneas 426-436):**

```typescript
// ACTUALIZACIÓN (si ya existe)
notaMensual = await tx.notaMensual.update({
  where: { id_nota_mensual: notaExistente.id_nota_mensual },
  data: {
    ...dataToSave,
    actividades: {
      create: dto.actividades.map((act) => ({
        id_tipo_actividad: act.id_tipo_actividad, // ✅ Tipo de actividad
        numero_actividad: act.numero_actividad, // ✅ Número de instancia
        nota: act.nota, // ✅ NOTA GUARDADA
      })),
    },
  },
  include: {
    actividades: {
      include: {
        tipoActividad: true, // ✅ Incluye nombre del tipo
      },
    },
  },
});
```

### **Ejemplo de Payload para BÁSICA:**

```json
{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes": "Febrero",
  "trimestre": 1,
  "anio_academico": "2025",
  "actividades": [
    {
      "id_tipo_actividad": 1, // Tarea
      "numero_actividad": 1, // Tarea 1
      "nota": 8.5 // ✅ ESTA NOTA SE GUARDA
    },
    {
      "id_tipo_actividad": 2, // Revisión de Libros y Cuadernos
      "numero_actividad": null, // No tiene número (solo hay una)
      "nota": 9.0 // ✅ ESTA NOTA SE GUARDA
    },
    {
      "id_tipo_actividad": 1, // Tarea
      "numero_actividad": 2, // Tarea 2
      "nota": 7.5 // ✅ ESTA NOTA SE GUARDA
    },
    {
      "id_tipo_actividad": 3, // Laboratorio Escrito
      "numero_actividad": null,
      "nota": 8.0 // ✅ ESTA NOTA SE GUARDA
    }
  ],
  "examen_mensual": 9.0 // ✅ ESTA NOTA SE GUARDA
}
```

### **Respuesta del Endpoint:**

```json
{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes": "Febrero",
  "trimestre": 1,
  "anio_academico": "2025",
  "actividades": [
    {
      "id_tipo_actividad": 1,
      "tipo_actividad_nombre": "Tarea",
      "numero_actividad": 1,
      "nombre_completo": "Tarea 1",
      "nota": 8.5 // ✅ NOTA GUARDADA Y DEVUELTA
    },
    {
      "id_tipo_actividad": 2,
      "tipo_actividad_nombre": "Revisión de Libros y Cuadernos",
      "numero_actividad": null,
      "nombre_completo": "Revisión de Libros y Cuadernos",
      "nota": 9.0 // ✅ NOTA GUARDADA Y DEVUELTA
    },
    {
      "id_tipo_actividad": 1,
      "tipo_actividad_nombre": "Tarea",
      "numero_actividad": 2,
      "nombre_completo": "Tarea 2",
      "nota": 7.5 // ✅ NOTA GUARDADA Y DEVUELTA
    },
    {
      "id_tipo_actividad": 3,
      "tipo_actividad_nombre": "Laboratorio Escrito",
      "numero_actividad": null,
      "nombre_completo": "Laboratorio Escrito",
      "nota": 8.0 // ✅ NOTA GUARDADA Y DEVUELTA
    }
  ],
  "examen_mensual": 9.0,
  "promedio_puro_actividades": 8.25,
  "promedio_70_actividades": 5.775,
  "promedio_30_examen": 2.7,
  "nota_mensual": 8.475,
  "porcentaje_aporte_trimestre": 0.28,
  "aporte_al_trimestre": 2.37,
  "fecha_registro": "2025-11-08T10:30:00.000Z"
}
```

---

## 📥 Cómo Recuperar las Actividades Guardadas

### **Endpoint Existente: `GET /sistema-evaluacion/notas-mensuales/:id_alumno/:id_asignatura`**

**URL Completa:**

```
GET /sistema-evaluacion/notas-mensuales/1/2?trimestre=1&anio_academico=2025
```

**Parámetros:**

- `id_alumno`: ID del alumno (en la URL)
- `id_asignatura`: ID de la asignatura (en la URL)
- `trimestre`: Número de trimestre (query parameter)
- `anio_academico`: Año académico (query parameter)

### **Código del Servicio (líneas 677-711):**

```typescript
async obtenerNotasMensuales(
  id_alumno: number,
  id_asignatura: number,
  trimestre: number,
  anio_academico: string,
): Promise<any[]> {
  const notas = await this.prisma.notaMensual.findMany({
    where: {
      id_alumno,
      id_asignatura,
      trimestre,
      anio_academico,
    },
    include: {
      asignatura: {
        select: {
          nombre: true,
        },
      },
      alumno: {
        select: {
          nombre: true,
          apellido: true,
        },
      },
      actividades: {              // ✅ INCLUYE LAS ACTIVIDADES
        include: {
          tipoActividad: true,    // ✅ CON NOMBRE DEL TIPO
        },
        orderBy: {
          id_actividad_evaluacion: 'asc',
        },
      },
    },
    orderBy: {
      fecha_registro: 'asc',
    },
  });

  return notas;
}
```

### **Respuesta del Endpoint:**

```json
[
  {
    "id_nota_mensual": 1,
    "id_alumno": 1,
    "id_asignatura": 2,
    "mes": "Febrero",
    "trimestre": 1,
    "anio_academico": "2025",
    "examen_mensual": 9.0,
    "examen_parcial": null,
    "promedio_puro_actividades": 8.25,
    "promedio_70_actividades": 5.775,
    "promedio_30_examen": 2.7,
    "nota_mensual": 8.475,
    "porcentaje_aporte": 0.28,
    "aporte_al_trimestre": 2.37,
    "fecha_registro": "2025-11-08T10:30:00.000Z",
    "actualizado_en": "2025-11-08T10:30:00.000Z",
    "asignatura": {
      "nombre": "Matemática I"
    },
    "alumno": {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "actividades": [
      // ✅ ACTIVIDADES GUARDADAS
      {
        "id_actividad_evaluacion": 1,
        "id_nota_mensual": 1,
        "id_tipo_actividad": 1,
        "numero_actividad": 1,
        "nota": 8.5, // ✅ NOTA INDIVIDUAL
        "tipoActividad": {
          "id_tipo_actividad": 1,
          "nombre": "Tarea",
          "nivel_educativo": "BASICA",
          "permite_multiples_instancias": true
        }
      },
      {
        "id_actividad_evaluacion": 2,
        "id_nota_mensual": 1,
        "id_tipo_actividad": 2,
        "numero_actividad": null,
        "nota": 9.0, // ✅ NOTA INDIVIDUAL
        "tipoActividad": {
          "id_tipo_actividad": 2,
          "nombre": "Revisión de Libros y Cuadernos",
          "nivel_educativo": "BASICA",
          "permite_multiples_instancias": false
        }
      },
      {
        "id_actividad_evaluacion": 3,
        "id_nota_mensual": 1,
        "id_tipo_actividad": 1,
        "numero_actividad": 2,
        "nota": 7.5, // ✅ NOTA INDIVIDUAL
        "tipoActividad": {
          "id_tipo_actividad": 1,
          "nombre": "Tarea",
          "nivel_educativo": "BASICA",
          "permite_multiples_instancias": true
        }
      },
      {
        "id_actividad_evaluacion": 4,
        "id_nota_mensual": 1,
        "id_tipo_actividad": 3,
        "numero_actividad": null,
        "nota": 8.0, // ✅ NOTA INDIVIDUAL
        "tipoActividad": {
          "id_tipo_actividad": 3,
          "nombre": "Laboratorio Escrito",
          "nivel_educativo": "BASICA",
          "permite_multiples_instancias": false
        }
      }
    ]
  }
]
```

---

## ❌ Módulo Obsoleto: `notas-mensuales`

### **Endpoint: `POST /notas-mensuales`**

Este módulo es una **versión simplificada antigua** que:

- ✅ Guarda `examen_mensual`
- ✅ Calcula promedios
- ❌ **NO guarda actividades individuales**

### **Evidencia en el Código (líneas 188-214):**

```typescript
// NOTA: Esta es una versión simplificada que no guarda las notas individuales
// en la tabla ActividadEvaluacion. Si necesitas guardarlas, habría que crear
// registros en esa tabla también.

// Crear la nota mensual en la base de datos
const notaMensual = await this.prisma.notaMensual.create({
  data: {
    id_alumno: createDto.id_alumno,
    id_asignatura: createDto.id_asignatura,
    mes: this.obtenerNombreMes(createDto.mes),
    trimestre: trimestre,
    anio_academico: createDto.anio.toString(),
    examen_mensual: createDto.examen_mensual || 0,
    promedio_puro_actividades: calculoNota.promedio_puro_actividades,
    promedio_70_actividades: calculoNota.promedio_70_actividades,
    promedio_30_examen: calculoNota.promedio_30_examen,
    nota_mensual: calculoNota.nota_mensual,
    porcentaje_aporte: porcentaje_aporte,
    aporte_al_trimestre: aporte_al_trimestre,
    // ❌ NO HAY CAMPO 'actividades' aquí
  },
  // ...
});
```

### **Por Qué Existe Este Módulo:**

1. Fue creado como una **versión simplificada** para pruebas iniciales
2. Solo maneja el sistema de **BÁSICA** (70/30)
3. **No contempla BACHILLERATO** (6 componentes)
4. **No guarda las actividades individuales**

---

## 🎯 Recomendaciones para el Frontend

### **✅ USAR: `sistema-evaluacion` (Endpoints Simplificados)**

#### **🆕 Para Crear Notas (FORMATO NUMÉRICO - RECOMENDADO):**

```typescript
POST /sistema-evaluacion/nota-mensual/simple
{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes_numerico": 2,       // ✅ NÚMERO (2 = Febrero)
  "anio": 2025,            // ✅ NÚMERO
  "trimestre": 1,
  "actividades": [...],
  "examen_mensual": 9.0
}
```

#### **🆕 Para Consultar Notas (FORMATO NUMÉRICO - RECOMENDADO):**

```typescript
GET /sistema-evaluacion/notas-mensuales/simple?id_alumno=1&anio=2025
GET /sistema-evaluacion/notas-mensuales/simple?id_asignatura=2&mes_numerico=2&anio=2025
```

#### **🆕 Para Obtener Nota por ID (FORMATO NUMÉRICO):**

```typescript
GET /sistema-evaluacion/nota-mensual/simple/:id
```

---

### **⚡ Alternativa: Endpoints Estándar (Formato String)**

#### **Para Crear Notas (si prefieres formato string):**

```typescript
POST / sistema - evaluacion / nota - mensual;
```

#### **Para Obtener Notas con Actividades:**

```typescript
GET /sistema-evaluacion/notas-mensuales/:id_alumno/:id_asignatura?trimestre=1&anio_academico=2025
```

#### **Para Obtener Reporte Mensual Detallado:**

```typescript
GET /sistema-evaluacion/reporte-mensual-alumno/:id_alumno/:id_asignatura/:mes/:trimestre?anio_academico=2025
```

---

### **❌ NO USAR: `notas-mensuales`**

Este módulo **está obsoleto** porque:

- ❌ No guarda las actividades individuales
- ❌ No es compatible con BACHILLERATO
- ❌ Funcionalidad limitada

**La funcionalidad del módulo `notas-mensuales` ha sido migrada a `sistema-evaluacion` con endpoints simplificados.** Ver: `MIGRACION-NOTAS-SIMPLIFICADAS.md`

---

## 📝 Flujo Completo en el Frontend

### **Paso 1: Obtener Nivel Educativo del Curso**

```typescript
const response = await fetch(`/cursos/${cursoId}/nivel-educativo`);
const { nivel_educativo } = await response.json();
```

### **Paso 2: Cargar Tipos de Actividad según Nivel**

```typescript
const tiposResponse = await fetch(
  `/sistema-evaluacion/catalogo/tipos-actividad/${nivel_educativo}`,
);
const tiposActividad = await tiposResponse.json();
```

### **Paso 3: Usuario Ingresa Notas (Formulario Dinámico)**

Para **BÁSICA**:

- Campo: Tarea 1 → `nota: 8.5`
- Campo: Revisión Libros y Cuadernos → `nota: 9.0`
- Campo: Tarea 2 → `nota: 7.5`
- Campo: Laboratorio Escrito → `nota: 8.0`
- Campo: Examen Mensual → `nota: 9.0`

### **Paso 4: Enviar al Backend (USANDO ENDPOINT SIMPLIFICADO)**

```typescript
const payload = {
  id_alumno: 1,
  id_asignatura: 2,
  mes_numerico: 2, // ✅ Febrero como número
  trimestre: 1,
  anio: 2025, // ✅ Año como número
  actividades: [
    { id_tipo_actividad: 1, numero_actividad: 1, nota: 8.5 }, // Tarea 1
    { id_tipo_actividad: 2, numero_actividad: null, nota: 9.0 }, // Revisión
    { id_tipo_actividad: 1, numero_actividad: 2, nota: 7.5 }, // Tarea 2
    { id_tipo_actividad: 3, numero_actividad: null, nota: 8.0 }, // Lab
  ],
  examen_mensual: 9.0,
};

const result = await fetch('/sistema-evaluacion/nota-mensual/simple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

### **Paso 5: Recibir Respuesta con Todo Guardado**

```typescript
const respuesta = await result.json();
console.log(respuesta.mes_numerico); // ✅ 2
console.log(respuesta.anio); // ✅ 2025
console.log(respuesta.actividades); // ✅ Todas las actividades guardadas
console.log(respuesta.examen_mensual); // ✅ Examen guardado
console.log(respuesta.nota_mensual); // ✅ Nota calculada
```

### **Paso 6: Consultar Notas Guardadas Posteriormente (USANDO ENDPOINT SIMPLIFICADO)**

```typescript
const notasGuardadas = await fetch(
  `/sistema-evaluacion/notas-mensuales/simple?id_alumno=1&id_asignatura=2&anio=2025`,
);
const data = await notasGuardadas.json();

// Iterar sobre las notas mensuales
data.forEach((notaMensual) => {
  console.log(`Mes: ${notaMensual.mes_nombre} (${notaMensual.mes_numerico})`);
  console.log(`Año: ${notaMensual.anio}`);
  console.log(`Nota Mensual: ${notaMensual.nota_mensual}`);

  // ✅ Mostrar actividades guardadas
  notaMensual.actividades.forEach((actividad) => {
    console.log(`${actividad.nombre_completo}: ${actividad.nota}`);
  });

  console.log(`Examen: ${notaMensual.examen_mensual}`);
});
```

---

## 🔧 Endpoints Disponibles en `sistema-evaluacion`

| Método  | Endpoint                                                                               | Propósito                            | Devuelve Actividades |
| ------- | -------------------------------------------------------------------------------------- | ------------------------------------ | -------------------- |
| `POST`  | `/sistema-evaluacion/nota-mensual`                                                     | Crear/actualizar nota mensual        | ✅ En respuesta      |
| `PATCH` | `/sistema-evaluacion/nota-mensual/:id`                                                 | Actualizar nota existente            | ✅ En respuesta      |
| `GET`   | `/sistema-evaluacion/notas-mensuales/:id_alumno/:id_asignatura`                        | Historial de notas mensuales         | ✅ Incluidas         |
| `GET`   | `/sistema-evaluacion/detalle-evaluacion/:id_alumno/:id_asignatura`                     | Detalle completo de evaluación       | ✅ Incluidas         |
| `GET`   | `/sistema-evaluacion/reporte-mensual-alumno/:id_alumno/:id_asignatura/:mes/:trimestre` | Reporte mensual detallado            | ✅ Incluidas         |
| `GET`   | `/sistema-evaluacion/consolidado-mensual-alumno/:id_alumno/:mes/:trimestre`            | Consolidado de todas las asignaturas | ✅ Incluidas         |

---

## ✅ Conclusión

**Las actividades SÍ se están guardando** en la base de datos cuando usas el módulo correcto:

1. ✅ **Módulo a usar:** `sistema-evaluacion`
2. ✅ **Endpoint a usar:** `POST /sistema-evaluacion/nota-mensual`
3. ✅ **Tabla donde se guardan:** `ActividadEvaluacion`
4. ✅ **Relación:** `NotaMensual.actividades` → `ActividadEvaluacion[]`
5. ✅ **Endpoint para consultar:** `GET /sistema-evaluacion/notas-mensuales/:id_alumno/:id_asignatura`

El módulo `notas-mensuales` es obsoleto y no debe usarse para el sistema completo.

---

## 📚 Referencias

- **Archivo Service:** `src/sistema-evaluacion/sistema-evaluacion.service.ts`
  - Guardado de actividades: líneas 426-470
  - Consulta de actividades: líneas 677-711
- **Archivo Controller:** `src/sistema-evaluacion/sistema-evaluacion.controller.ts`
  - Endpoint POST: líneas 36-110
  - Endpoint GET notas: líneas 211-277
- **Schema Prisma:** `prisma/schema.prisma`
  - Modelo NotaMensual
  - Modelo ActividadEvaluacion
  - Relación entre ambos

---

**¡El sistema está funcionando correctamente! Solo asegúrate de usar el módulo `sistema-evaluacion` en tu frontend.** 🎉
