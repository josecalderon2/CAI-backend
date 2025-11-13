# 🔒 Sistema de Cierre de Calificaciones con Validaciones

## Resumen de Funcionalidades Implementadas

Se ha implementado un sistema robusto para cerrar calificaciones que incluye:

✅ **Validación completa antes de cerrar**
✅ **Detección de evaluaciones faltantes**
✅ **Detección de alumnos sin calificar**
✅ **Estadísticas detalladas**
✅ **Advertencias informativas**
✅ **Opción de forzar cierre**

---

## 📋 Endpoints Disponibles

### 1. Verificar Estado antes de Cerrar

**Endpoint:** `GET /promedios/verificar-cierre`

**Descripción:** Verifica el estado de las calificaciones y retorna advertencias y estadísticas ANTES de cerrar.

**Parámetros:**

- `cursoId` (required): ID del curso
- `anioAcademico` (required): Año académico (ej: "2025")
- `trimestre` (optional): 1, 2 o 3 (solo para básica)
- `periodo` (optional): 1, 2, 3 o 4 (solo para bachillerato)

**Ejemplo de Request:**

```http
GET /promedios/verificar-cierre?cursoId=5&anioAcademico=2025&trimestre=1
```

**Ejemplo de Response:**

```json
{
  "puedesCerrar": false,
  "mensaje": "⚠️ Se encontraron advertencias. Revisa la información antes de continuar. Aún puedes cerrar si lo consideras necesario.",
  "advertencias": [
    {
      "tipo": "EVALUACIONES_FALTANTES",
      "mensaje": "Hay tipos de evaluación sin crear para el trimestre 1",
      "evaluacionesFaltantes": [
        {
          "tipoEvaluacion": "Examen Trimestral",
          "esperadas": 8,
          "creadas": 6
        }
      ]
    },
    {
      "tipo": "ALUMNOS_SIN_CALIFICAR",
      "mensaje": "3 alumno(s) no tienen todas las calificaciones",
      "alumnosSinCalificar": [
        {
          "id_alumno": 123,
          "nombreCompleto": "Juan Pérez",
          "evaluacionesPendientes": [
            "Tarea 1 - Matemáticas",
            "Examen Parcial - Lenguaje"
          ]
        }
      ]
    }
  ],
  "estadisticas": {
    "totalAlumnos": 30,
    "alumnosConTodasLasNotas": 27,
    "alumnosSinNotas": 3,
    "totalEvaluacionesEsperadas": 48,
    "evaluacionesCreadas": 46,
    "totalCalificacionesRegistradas": 1350,
    "totalCalificacionesEsperadas": 1380
  }
}
```

---

### 2. Cerrar Calificaciones de un Alumno

**Endpoint:** `POST /promedios/cerrar/:alumnoId`

**Descripción:** Cierra las calificaciones de un alumno individual.

**Parámetros:**

- `alumnoId` (path, required): ID del alumno
- `cursoId` (query, required): ID del curso
- `anioAcademico` (query, required): Año académico
- `forzar` (query, optional): `true` para forzar cierre aunque haya advertencias

**Ejemplo de Request:**

```http
POST /promedios/cerrar/123?cursoId=5&anioAcademico=2025&forzar=true
```

---

### 3. Cerrar Calificaciones de TODO un Curso

**Endpoint:** `POST /promedios/cerrar-curso`

**Descripción:** Cierra las calificaciones de TODOS los alumnos activos de un curso.

**Parámetros:**

- `cursoId` (required): ID del curso
- `anioAcademico` (required): Año académico
- `trimestre` (optional): 1, 2 o 3 (solo para básica)
- `periodo` (optional): 1, 2, 3 o 4 (solo para bachillerato)
- `forzar` (optional): `true` para forzar cierre aunque haya advertencias

**Ejemplo de Request:**

```http
POST /promedios/cerrar-curso?cursoId=5&anioAcademico=2025&trimestre=1&forzar=false
```

**Ejemplo de Response (con advertencias):**

```json
{
  "mensaje": "Se cerraron las calificaciones de 27 de 30 alumnos",
  "totalAlumnos": 30,
  "alumnosCerrados": 27,
  "alumnosConError": 3,
  "advertencias": [
    {
      "tipo": "ALUMNOS_SIN_CALIFICAR",
      "mensaje": "3 alumno(s) no tienen todas las calificaciones",
      "alumnosSinCalificar": [...]
    }
  ],
  "errores": [
    {
      "alumnoId": 125,
      "error": "No se encontró el promedio final del alumno"
    }
  ]
}
```

---

## 🎯 Flujo Recomendado para el Frontend

### Paso 1: Verificar Estado

```javascript
// Antes de mostrar el botón de cerrar
const verificacion = await fetch(
  '/promedios/verificar-cierre?cursoId=5&anioAcademico=2025&trimestre=1',
);
const estado = await verificacion.json();

if (estado.puedesCerrar) {
  // ✅ Mostrar: "Todo en orden, puedes cerrar"
  mostrarBotonCerrar({ tipo: 'seguro' });
} else {
  // ⚠️ Mostrar advertencias al usuario
  mostrarAdvertencias(estado.advertencias);
  mostrarEstadisticas(estado.estadisticas);

  // Dar opción de forzar cierre
  mostrarBotonCerrar({
    tipo: 'forzar',
    mensaje: '¿Estás seguro de cerrar con advertencias?',
  });
}
```

### Paso 2: Mostrar Advertencias al Usuario

```javascript
// Ejemplo de UI
if (estado.advertencias.length > 0) {
  const mensajesHTML = estado.advertencias
    .map((adv) => {
      if (adv.tipo === 'ALUMNOS_SIN_CALIFICAR') {
        return `
        <div class="advertencia">
          <h4>⚠️ ${adv.mensaje}</h4>
          <ul>
            ${adv.alumnosSinCalificar
              .map(
                (alumno) => `
              <li>
                <strong>${alumno.nombreCompleto}</strong>
                <ul>
                  ${alumno.evaluacionesPendientes.map((ev) => `<li>${ev}</li>`).join('')}
                </ul>
              </li>
            `,
              )
              .join('')}
          </ul>
        </div>
      `;
      }

      if (adv.tipo === 'EVALUACIONES_FALTANTES') {
        return `
        <div class="advertencia">
          <h4>⚠️ ${adv.mensaje}</h4>
          <ul>
            ${adv.evaluacionesFaltantes
              .map(
                (ev) => `
              <li>${ev.tipoEvaluacion}: ${ev.creadas} de ${ev.esperadas} creadas</li>
            `,
              )
              .join('')}
          </ul>
        </div>
      `;
      }
    })
    .join('');

  document.getElementById('advertencias').innerHTML = mensajesHTML;
}
```

### Paso 3: Cerrar Calificaciones

```javascript
async function cerrarCalificaciones(forzar = false) {
  try {
    const response = await fetch(
      `/promedios/cerrar-curso?cursoId=5&anioAcademico=2025&trimestre=1&forzar=${forzar}`,
      { method: 'POST' },
    );

    const resultado = await response.json();

    if (resultado.alumnosCerrados === resultado.totalAlumnos) {
      mostrarExito('✅ Calificaciones cerradas exitosamente');
    } else {
      mostrarAdvertencia(`
        ⚠️ ${resultado.alumnosCerrados} de ${resultado.totalAlumnos} alumnos cerrados.
        ${resultado.alumnosConError} con errores.
      `);
    }
  } catch (error) {
    mostrarError('Error al cerrar calificaciones');
  }
}
```

---

## 📊 Casos de Uso

### Caso 1: Todo está perfecto

```
1. Orientador entra a Calificaciones
2. Sistema ejecuta GET /verificar-cierre
3. Response: puedesCerrar = true
4. Mostrar: "✅ Todo en orden"
5. Orientador presiona "Cerrar Calificaciones"
6. Sistema ejecuta POST /cerrar-curso
7. Éxito total
```

### Caso 2: Hay alumnos sin calificar

```
1. Orientador entra a Calificaciones
2. Sistema ejecuta GET /verificar-cierre
3. Response: puedesCerrar = false, advertencias = [ALUMNOS_SIN_CALIFICAR]
4. Mostrar: "⚠️ 3 alumnos sin calificaciones completas"
5. Listar alumnos y evaluaciones pendientes
6. Opciones:
   a) Ir a calificar esos alumnos
   b) Forzar cierre (POST /cerrar-curso?forzar=true)
```

### Caso 3: Faltan evaluaciones por crear

```
1. Sistema detecta: "Examen Trimestral: 6 de 8 creadas"
2. Mostrar: "⚠️ Faltan 2 exámenes trimestrales por crear"
3. Orientador puede:
   a) Crear las evaluaciones faltantes
   b) Forzar cierre si esas asignaturas no aplican
```

---

## 🎨 Recomendaciones de UX

### En la Vista de Calificaciones:

```
┌────────────────────────────────────────────────────┐
│  📊 Calificaciones - 7mo A - Trimestre 1          │
├────────────────────────────────────────────────────┤
│                                                     │
│  [Tabla de calificaciones aquí]                   │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ 📊 Estado de Calificaciones                  │ │
│  │                                               │ │
│  │ ✅ 27 de 30 alumnos con notas completas      │ │
│  │ ⚠️  3 alumnos sin calificaciones:            │ │
│  │     • Juan Pérez (2 evaluaciones faltantes)  │ │
│  │     • María López (1 evaluación faltante)    │ │
│  │     • Pedro García (3 evaluaciones faltantes)│ │
│  │                                               │ │
│  │ ⚠️  Evaluaciones faltantes:                  │ │
│  │     • Examen Trimestral: 6 de 8 creadas      │ │
│  │                                               │ │
│  │  [Ver Detalles]                              │ │
│  │                                               │ │
│  │  ⚠️ Aún puedes cerrar si es necesario        │ │
│  │                                               │ │
│  │  [🔒 Cerrar con Advertencias]  [❌ Cancelar] │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## ✅ Ventajas del Sistema

1. **Transparencia Total**: El orientador sabe exactamente qué falta
2. **Prevención de Errores**: Detecta problemas antes de cerrar
3. **Flexibilidad**: Permite forzar cierre cuando es justificado
4. **Trazabilidad**: Registra quién y cuándo cerró
5. **Estadísticas**: Métricas claras del estado del curso
6. **UX Mejorada**: El usuario está informado en todo momento

---

## 🔧 Archivos Modificados/Creados

1. ✅ `src/promedios/dto/verificacion-cierre.dto.ts` (NUEVO)
2. ✅ `src/promedios/promedios.service.ts` (MODIFICADO)
   - Método `verificarEstadoParaCierre()`
   - Método `verificarEvaluacionesFaltantes()`
   - Método `verificarAlumnosSinCalificar()`
   - Método `cerrarCalificaciones()` mejorado
   - Método `cerrarCalificacionesCurso()` (NUEVO)
3. ✅ `src/promedios/promedios.controller.ts` (MODIFICADO)
   - Endpoint `GET /verificar-cierre`
   - Endpoint `POST /cerrar/:alumnoId` mejorado
   - Endpoint `POST /cerrar-curso` (NUEVO)
