# 📚 Guía Práctica: Implementación Frontend - Sistema de Ingreso de Notas

## 🎯 Objetivo

Esta guía muestra paso a paso cómo implementar el flujo completo de ingreso de notas en el frontend, probando cada endpoint necesario.

---

## 📋 Flujo Completo del Sistema

### **PASO 1: Cargar Cursos del Orientador** 🏫

**Endpoint:** `GET /cursos/mis-cursos`

**Headers necesarios:**

```http
Authorization: Bearer {token_jwt}
```

**Descripción:**

- Obtiene automáticamente los cursos asignados al orientador autenticado
- El ID del orientador se obtiene del token JWT
- Retorna cursos donde el orientador es titular o tiene asignaturas asignadas

**Ejemplo de Request:**

```bash
curl -X GET "http://localhost:3000/cursos/mis-cursos" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": [
    {
      "id_curso": 1,
      "nombre": "5° Grado A",
      "seccion": "A",
      "anio_academico": "2025",
      "cupos_totales": 30,
      "id_grado_academico": 5,
      "id_orientador": 2,
      "activo": true,
      "gradoAcademico": {
        "id_grado_academico": 5,
        "nombre": "5° Grado",
        "nivel_educativo": "BASICA"
      },
      "orientador": {
        "id_orientador": 2,
        "nombre": "Juan",
        "apellido": "Pérez"
      }
    },
    {
      "id_curso": 7,
      "nombre": "1° Año Bachillerato A",
      "seccion": "A",
      "anio_academico": "2025",
      "cupos_totales": 35,
      "id_grado_academico": 10,
      "gradoAcademico": {
        "id_grado_academico": 10,
        "nombre": "1° Año",
        "nivel_educativo": "BACHILLERATO"
      }
    }
  ]
}
```

**Uso en Frontend (React/Vue/Angular):**

```typescript
// Cargar dropdown de cursos
async function cargarCursosOrientador() {
  const response = await fetch('/cursos/mis-cursos', {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();

  // Popular select/dropdown
  const cursos = data.data;
  cursos.forEach((curso) => {
    selectCurso.append(`
      <option value="${curso.id_curso}" 
              data-nivel="${curso.gradoAcademico.nivel_educativo}">
        ${curso.nombre} - ${curso.gradoAcademico.nivel_educativo}
      </option>
    `);
  });
}
```

---

### **PASO 2: Validar Nivel Educativo del Curso** ✅

**Endpoint:** `GET /cursos/:id/nivel-educativo`

**Descripción:**

- Determina si el curso es BASICA o BACHILLERATO
- Esto define qué tipo de evaluación mostrar en el frontend

**Ejemplo de Request:**

```bash
curl -X GET "http://localhost:3000/cursos/1/nivel-educativo" \
  -H "Authorization: Bearer {token}"
```

**Respuesta esperada:**

```json
{
  "id_curso": 1,
  "nombre_curso": "5° Grado A",
  "id_grado_academico": 5,
  "nombre_grado": "5° Grado",
  "nivel_educativo": "BASICA"
}
```

**Uso en Frontend:**

```typescript
// Cuando el usuario selecciona un curso
async function onCursoSeleccionado(idCurso) {
  const response = await fetch(`/cursos/${idCurso}/nivel-educativo`);
  const data = await response.json();

  // Guardar nivel educativo para validaciones
  nivelEducativo = data.nivel_educativo;

  if (nivelEducativo === 'BASICA') {
    // Mostrar formulario BÁSICA
    // 70% actividades + 30% examen mensual
    mostrarFormularioBasica();
  } else if (nivelEducativo === 'BACHILLERATO') {
    // Mostrar formulario BACHILLERATO
    // 6 componentes: Act.Int 25%, Tarea 5%, Coev 5%, Lab 10%,
    // Examen Parcial 25%, Examen Periodo 30%
    mostrarFormularioBachillerato();
  }
}
```

---

### **PASO 3: Cargar Asignaturas del Curso** 📖

**Endpoint:** `GET /asignaturas/curso/:idCurso`

**Descripción:**

- Obtiene todas las asignaturas del curso seleccionado
- Incluye información del tipo de asignatura y método de evaluación

**Ejemplo de Request:**

```bash
curl -X GET "http://localhost:3000/asignaturas/curso/1" \
  -H "Authorization: Bearer {token}"
```

**Respuesta esperada:**

```json
[
  {
    "id_asignatura": 1,
    "nombre": "Matemática I",
    "codigo": "MAT-5A-2025",
    "orden_en_reporte": "01",
    "horas_semanas": 5,
    "id_curso": 1,
    "id_tipo_asignatura": 1,
    "id_metodo_evaluacion": 1,
    "id_sistema_evaluacion": 1,
    "activo": true,
    "curso": {
      "nombre": "5° Grado A"
    },
    "tipoAsignatura": {
      "nombre": "Básica"
    },
    "metodoEvaluacion": {
      "nombre": "Evaluación Continua"
    }
  },
  {
    "id_asignatura": 2,
    "nombre": "Lenguaje y Literatura",
    "codigo": "LEN-5A-2025",
    "orden_en_reporte": "02",
    "horas_semanas": 5,
    "id_curso": 1
  }
]
```

**Uso en Frontend:**

```typescript
// Cargar dropdown de asignaturas
async function cargarAsignaturasCurso(idCurso) {
  const response = await fetch(`/asignaturas/curso/${idCurso}`);
  const asignaturas = await response.json();

  // Popular select de asignaturas
  selectAsignatura.innerHTML =
    '<option value="">Seleccione asignatura...</option>';
  asignaturas.forEach((asignatura) => {
    selectAsignatura.append(`
      <option value="${asignatura.id_asignatura}">
        ${asignatura.nombre} (${asignatura.horas_semanas}h/semana)
      </option>
    `);
  });
}
```

---

### **PASO 4: Cargar Alumnos del Curso** 👥

**Endpoint:** `GET /cursos/:id/alumnos`

**Descripción:**

- Obtiene lista de alumnos matriculados activamente en el curso
- Incluye información de inscripción

**Ejemplo de Request:**

```bash
curl -X GET "http://localhost:3000/cursos/1/alumnos" \
  -H "Authorization: Bearer {token}"
```

**Respuesta esperada:**

```json
{
  "curso": {
    "id_curso": 1,
    "nombre": "5° Grado A",
    "anio_academico": "2025"
  },
  "alumnos": [
    {
      "id_alumno": 1,
      "nombre": "Carlos",
      "apellido": "Martínez",
      "nie": "12345678",
      "fecha_nacimiento": "2015-03-15T00:00:00.000Z",
      "activo": true,
      "inscripcion": {
        "id_inscripcion": 1,
        "fecha_inscripcion": "2025-01-15T00:00:00.000Z",
        "estado": "ACTIVO"
      }
    },
    {
      "id_alumno": 2,
      "nombre": "María",
      "apellido": "González",
      "nie": "87654321",
      "fecha_nacimiento": "2015-05-20T00:00:00.000Z",
      "activo": true
    }
  ],
  "total_alumnos": 2
}
```

**Uso en Frontend:**

```typescript
// Cargar tabla/lista de alumnos
async function cargarAlumnosCurso(idCurso) {
  const response = await fetch(`/cursos/${idCurso}/alumnos`);
  const data = await response.json();

  // Renderizar tabla de alumnos
  const tbody = document.getElementById('tablaAlumnos');
  tbody.innerHTML = '';

  data.alumnos.forEach((alumno, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${alumno.nombre} ${alumno.apellido}</td>
        <td>${alumno.nie}</td>
        <td>
          <button onclick="ingresarNotas(${alumno.id_alumno})" 
                  class="btn btn-primary">
            Ingresar Notas
          </button>
          <button onclick="verNotas(${alumno.id_alumno})" 
                  class="btn btn-info">
            Ver Notas
          </button>
        </td>
      </tr>
    `;
  });
}
```

---

### **PASO 5: Obtener Formato de Evaluación** 📝

**Endpoint:** `GET /sistema-evaluacion/formato-evaluacion/asignatura/:id_asignatura`

**Descripción:**

- Obtiene la estructura EXACTA de actividades que se deben ingresar
- Define el formulario dinámico según nivel educativo

**Ejemplo de Request:**

```bash
curl -X GET "http://localhost:3000/sistema-evaluacion/formato-evaluacion/asignatura/1"
```

**Respuesta BÁSICA:**

```json
{
  "nivel": "BASICA",
  "asignatura": {
    "id": 1,
    "nombre": "Matemática I",
    "curso": "5° Grado A",
    "grado": "5° Grado"
  },
  "formato": "FIJO",
  "instrucciones": "Ingrese las notas en el orden especificado. Las Tareas pueden tener números (1, 2, etc.)",
  "estructura_actividades": [
    {
      "orden": 1,
      "id_tipo_actividad": 1,
      "nombre": "Tarea",
      "numero_actividad": 1,
      "etiqueta": "Tarea 1",
      "requerido": true,
      "permite_multiples": true
    },
    {
      "orden": 2,
      "id_tipo_actividad": 2,
      "nombre": "Revisión de libros y cuadernos",
      "numero_actividad": null,
      "etiqueta": "Revisión de libros y cuadernos",
      "requerido": true,
      "permite_multiples": false
    },
    {
      "orden": 3,
      "id_tipo_actividad": 1,
      "nombre": "Tarea",
      "numero_actividad": 2,
      "etiqueta": "Tarea 2",
      "requerido": true,
      "permite_multiples": true
    },
    {
      "orden": 4,
      "id_tipo_actividad": 3,
      "nombre": "Laboratorio escrito",
      "numero_actividad": 1,
      "etiqueta": "Laboratorio escrito 1",
      "requerido": true,
      "permite_multiples": true
    }
  ],
  "examenes": [
    {
      "nombre": "Examen mensual",
      "campo": "examen_mensual",
      "porcentaje": 30,
      "requerido": true
    }
  ],
  "calculo": {
    "formula": "(Promedio Actividades × 70%) + (Examen Mensual × 30%)",
    "componentes": [
      {
        "nombre": "Actividades continuas",
        "porcentaje": 70,
        "descripcion": "Promedio simple de todas las actividades"
      },
      {
        "nombre": "Examen mensual",
        "porcentaje": 30,
        "descripcion": "Examen del mes"
      }
    ]
  }
}
```

**Respuesta BACHILLERATO:**

```json
{
  "nivel": "BACHILLERATO",
  "asignatura": {
    "id": 6,
    "nombre": "Matemática",
    "curso": "1° Año Bachillerato A",
    "grado": "1° Año"
  },
  "formato": "CATEGORIZADO",
  "instrucciones": "Debe ingresar al menos una actividad de cada categoría requerida",
  "categorias_requeridas": [
    {
      "categoria": "ACTIVIDAD_INTEGRADORA",
      "nombre": "Actividades Integradoras",
      "porcentaje": 25,
      "minimo_requerido": 1,
      "tipos_actividad": [
        {
          "id_tipo_actividad": 5,
          "nombre": "Actividad Integradora",
          "permite_multiples": false
        }
      ]
    },
    {
      "categoria": "TAREA",
      "nombre": "Tareas",
      "porcentaje": 5,
      "minimo_requerido": 1,
      "tipos_actividad": [
        {
          "id_tipo_actividad": 7,
          "nombre": "Tarea",
          "permite_multiples": true
        }
      ]
    },
    {
      "categoria": "COEVALUACION",
      "nombre": "Coevaluación",
      "porcentaje": 5,
      "minimo_requerido": 1,
      "tipos_actividad": [
        {
          "id_tipo_actividad": 9,
          "nombre": "Coevaluación",
          "permite_multiples": true
        }
      ]
    },
    {
      "categoria": "LABORATORIO",
      "nombre": "Laboratorio",
      "porcentaje": 10,
      "minimo_requerido": 1,
      "tipos_actividad": [
        {
          "id_tipo_actividad": 12,
          "nombre": "Laboratorio",
          "permite_multiples": true
        }
      ]
    }
  ],
  "examenes": [
    {
      "nombre": "Examen Parcial",
      "campo": "examen_parcial",
      "porcentaje": 25,
      "requerido": true
    },
    {
      "nombre": "Examen del Periodo",
      "campo": "examen_mensual",
      "porcentaje": 30,
      "requerido": true
    }
  ],
  "calculo": {
    "formula": "Act.Int(25%) + Tarea(5%) + Coev(5%) + Lab(10%) + Ex.Parcial(25%) + Ex.Periodo(30%)",
    "componentes": [
      {
        "nombre": "Actividades Integradoras",
        "porcentaje": 25
      },
      {
        "nombre": "Tareas",
        "porcentaje": 5
      },
      {
        "nombre": "Coevaluación",
        "porcentaje": 5
      },
      {
        "nombre": "Laboratorio",
        "porcentaje": 10
      },
      {
        "nombre": "Examen Parcial",
        "porcentaje": 25
      },
      {
        "nombre": "Examen del Periodo",
        "porcentaje": 30
      }
    ]
  }
}
```

**Uso en Frontend:**

```typescript
// Renderizar formulario dinámico según formato
async function cargarFormatoEvaluacion(idAsignatura) {
  const response = await fetch(
    `/sistema-evaluacion/formato-evaluacion/asignatura/${idAsignatura}`,
  );
  const formato = await response.json();

  const formulario = document.getElementById('formNotas');
  formulario.innerHTML = '';

  if (formato.nivel === 'BASICA') {
    // Renderizar campos fijos
    formato.estructura_actividades.forEach((actividad) => {
      formulario.innerHTML += `
        <div class="form-group">
          <label>${actividad.etiqueta} ${actividad.requerido ? '*' : ''}</label>
          <input type="number" 
                 name="actividad_${actividad.id_tipo_actividad}_${actividad.numero_actividad || 0}"
                 min="0" max="10" step="0.1"
                 ${actividad.requerido ? 'required' : ''}
                 class="form-control">
        </div>
      `;
    });

    // Examen mensual
    formulario.innerHTML += `
      <div class="form-group">
        <label>Examen Mensual (30%) *</label>
        <input type="number" name="examen_mensual" 
               min="0" max="10" step="0.1" required class="form-control">
      </div>
    `;
  } else if (formato.nivel === 'BACHILLERATO') {
    // Renderizar por categorías
    formato.categorias_requeridas.forEach((categoria) => {
      formulario.innerHTML += `
        <fieldset class="categoria">
          <legend>${categoria.nombre} (${categoria.porcentaje}%)</legend>
          ${categoria.tipos_actividad
            .map(
              (tipo) => `
            <div class="form-group">
              <label>${tipo.nombre}</label>
              <input type="number" 
                     name="actividad_${tipo.id_tipo_actividad}_1"
                     min="0" max="10" step="0.1" required
                     class="form-control">
            </div>
          `,
            )
            .join('')}
        </fieldset>
      `;
    });

    // Exámenes
    formato.examenes.forEach((examen) => {
      formulario.innerHTML += `
        <div class="form-group">
          <label>${examen.nombre} (${examen.porcentaje}%) *</label>
          <input type="number" name="${examen.campo}" 
                 min="0" max="10" step="0.1" required class="form-control">
        </div>
      `;
    });
  }

  // Mostrar fórmula de cálculo
  document.getElementById('formulaCalculo').textContent =
    formato.calculo.formula;
}
```

---

### **PASO 6: Ingresar/Guardar Notas** 💾

**Endpoint:** `POST /sistema-evaluacion/nota-mensual/simple`

**Descripción:**

- Guarda las notas y calcula automáticamente los promedios
- Usa formato simplificado (mes numérico, año numérico)

**Body para BÁSICA:**

```json
{
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes_numerico": 2,
  "anio": 2025,
  "actividades": [
    {
      "id_tipo_actividad": 1,
      "numero_actividad": 1,
      "nota": 8.5
    },
    {
      "id_tipo_actividad": 2,
      "numero_actividad": null,
      "nota": 9.0
    },
    {
      "id_tipo_actividad": 1,
      "numero_actividad": 2,
      "nota": 7.5
    },
    {
      "id_tipo_actividad": 3,
      "numero_actividad": 1,
      "nota": 8.0
    }
  ],
  "examen_mensual": 9.0
}
```

**Body para BACHILLERATO:**

```json
{
  "id_alumno": 2,
  "id_asignatura": 6,
  "mes_numerico": 2,
  "anio": 2025,
  "actividades": [
    {
      "id_tipo_actividad": 5,
      "numero_actividad": 1,
      "nota": 8.5
    },
    {
      "id_tipo_actividad": 7,
      "numero_actividad": 1,
      "nota": 9.0
    },
    {
      "id_tipo_actividad": 9,
      "numero_actividad": 1,
      "nota": 8.0
    },
    {
      "id_tipo_actividad": 12,
      "numero_actividad": 1,
      "nota": 8.5
    }
  ],
  "examen_mensual": 9.0,
  "examen_parcial": 8.5
}
```

**Respuesta exitosa (BÁSICA):**

```json
{
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": "Febrero",
  "mes_numerico": 2,
  "trimestre": 1,
  "anio_academico": "2025",
  "anio": 2025,
  "actividades": [
    {
      "id_tipo_actividad": 1,
      "tipo_actividad_nombre": "Tarea",
      "numero_actividad": 1,
      "nombre_completo": "Tarea 1",
      "nota": 8.5
    },
    {
      "id_tipo_actividad": 2,
      "tipo_actividad_nombre": "Revisión de libros y cuadernos",
      "numero_actividad": null,
      "nombre_completo": "Revisión de libros y cuadernos",
      "nota": 9.0
    },
    {
      "id_tipo_actividad": 1,
      "tipo_actividad_nombre": "Tarea",
      "numero_actividad": 2,
      "nombre_completo": "Tarea 2",
      "nota": 7.5
    },
    {
      "id_tipo_actividad": 3,
      "tipo_actividad_nombre": "Laboratorio escrito",
      "numero_actividad": 1,
      "nombre_completo": "Laboratorio escrito 1",
      "nota": 8.0
    }
  ],
  "examen_mensual": 9.0,
  "promedio_puro_actividades": 8.25,
  "promedio_70_actividades": 5.78,
  "promedio_30_examen": 2.7,
  "nota_mensual": 8.48,
  "porcentaje_aporte_trimestre": 0.28,
  "aporte_al_trimestre": 2.37,
  "fecha_registro": "2025-11-08T10:30:00.000Z"
}
```

**Uso en Frontend:**

```typescript
// Guardar notas
async function guardarNotas(formData) {
  // Preparar datos
  const body = {
    id_alumno: parseInt(formData.get('id_alumno')),
    id_asignatura: parseInt(formData.get('id_asignatura')),
    mes_numerico: parseInt(formData.get('mes')),
    anio: parseInt(formData.get('anio')),
    actividades: [],
    examen_mensual: parseFloat(formData.get('examen_mensual')),
  };

  // Recopilar actividades del formulario
  const inputs = document.querySelectorAll('input[name^="actividad_"]');
  inputs.forEach((input) => {
    const [_, idTipo, numero] = input.name.split('_');
    body.actividades.push({
      id_tipo_actividad: parseInt(idTipo),
      numero_actividad: numero !== '0' ? parseInt(numero) : null,
      nota: parseFloat(input.value),
    });
  });

  // Si es bachillerato, agregar examen parcial
  if (nivelEducativo === 'BACHILLERATO') {
    body.examen_parcial = parseFloat(formData.get('examen_parcial'));
  }

  // Enviar request
  const response = await fetch('/sistema-evaluacion/nota-mensual/simple', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  const resultado = await response.json();

  // Mostrar resultado
  mostrarResultados(resultado);
}

function mostrarResultados(resultado) {
  // Mostrar promedios calculados
  document.getElementById('promedios').innerHTML = `
    <div class="alert alert-success">
      <h4>✅ Notas guardadas exitosamente</h4>
      
      <h5>📊 Promedios Calculados:</h5>
      <table class="table">
        <tr>
          <td><strong>Promedio Puro (Actividades):</strong></td>
          <td>${resultado.promedio_puro_actividades.toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Promedio 70% (Actividades):</strong></td>
          <td>${resultado.promedio_70_actividades.toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Promedio 30% (Examen):</strong></td>
          <td>${resultado.promedio_30_examen.toFixed(2)}</td>
        </tr>
        <tr class="table-primary">
          <td><strong>Nota Mensual (70% + 30%):</strong></td>
          <td><strong>${resultado.nota_mensual.toFixed(2)}</strong></td>
        </tr>
        <tr class="table-info">
          <td><strong>Conversión 28% (Aporte al Trimestre):</strong></td>
          <td><strong>${resultado.aporte_al_trimestre.toFixed(2)}</strong></td>
        </tr>
      </table>
      
      <p class="text-muted">
        <small>Fórmula: (${resultado.promedio_70_actividades.toFixed(2)} + ${resultado.promedio_30_examen.toFixed(2)}) = ${resultado.nota_mensual.toFixed(2)}</small>
      </p>
      <p class="text-muted">
        <small>Aporte: ${resultado.nota_mensual.toFixed(2)} × ${(resultado.porcentaje_aporte_trimestre * 100).toFixed(0)}% = ${resultado.aporte_al_trimestre.toFixed(2)}</small>
      </p>
    </div>
  `;
}
```

---

### **PASO 7: Consultar/Ver Notas Guardadas** 👁️

**Endpoint:** `GET /sistema-evaluacion/notas-mensuales/simple`

**Query Params:**

- `id_alumno` (opcional)
- `id_asignatura` (opcional)
- `mes_numerico` (opcional): 1-12
- `trimestre` (opcional): 1-3
- `anio` (opcional): 2025

**Ejemplo de Request:**

```bash
# Ver todas las notas de un alumno en una asignatura
curl -X GET "http://localhost:3000/sistema-evaluacion/notas-mensuales/simple?id_alumno=1&id_asignatura=1&anio=2025"

# Ver notas de un mes específico
curl -X GET "http://localhost:3000/sistema-evaluacion/notas-mensuales/simple?id_alumno=1&id_asignatura=1&mes_numerico=2&anio=2025"
```

**Respuesta:**

```json
[
  {
    "id_nota_mensual": 1,
    "id_alumno": 1,
    "id_asignatura": 1,
    "alumno": {
      "nombre": "Carlos",
      "apellido": "Martínez"
    },
    "asignatura": {
      "nombre": "Matemática I"
    },
    "mes_numerico": 2,
    "mes_nombre": "Febrero",
    "trimestre": 1,
    "anio": 2025,
    "actividades": [
      {
        "id_actividad_evaluacion": 1,
        "id_tipo_actividad": 1,
        "tipo_actividad_nombre": "Tarea",
        "numero_actividad": 1,
        "nota": 8.5,
        "nombre_completo": "Tarea 1"
      },
      {
        "id_actividad_evaluacion": 2,
        "id_tipo_actividad": 2,
        "tipo_actividad_nombre": "Revisión de libros y cuadernos",
        "numero_actividad": null,
        "nota": 9.0,
        "nombre_completo": "Revisión de libros y cuadernos"
      }
    ],
    "examen_mensual": 9.0,
    "promedio_puro_actividades": 8.25,
    "promedio_70_actividades": 5.78,
    "promedio_30_examen": 2.7,
    "nota_mensual": 8.48,
    "porcentaje_aporte": 0.28,
    "aporte_al_trimestre": 2.37,
    "fecha_registro": "2025-11-08T10:30:00.000Z"
  }
]
```

**Uso en Frontend:**

```typescript
// Ver notas de un alumno
async function verNotasAlumno(idAlumno, idAsignatura, anio = 2025) {
  const response = await fetch(
    `/sistema-evaluacion/notas-mensuales/simple?id_alumno=${idAlumno}&id_asignatura=${idAsignatura}&anio=${anio}`,
  );
  const notas = await response.json();

  // Renderizar tabla de notas
  const tbody = document.getElementById('tablaNotas');
  tbody.innerHTML = '';

  notas.forEach((nota) => {
    const actividades = nota.actividades
      .map((act) => `${act.nombre_completo}: ${act.nota}`)
      .join('<br>');

    tbody.innerHTML += `
      <tr>
        <td>${nota.mes_nombre}</td>
        <td>${actividades}</td>
        <td>${nota.examen_mensual}</td>
        <td>${nota.promedio_puro_actividades.toFixed(2)}</td>
        <td>${nota.promedio_70_actividades.toFixed(2)}</td>
        <td>${nota.promedio_30_examen.toFixed(2)}</td>
        <td><strong>${nota.nota_mensual.toFixed(2)}</strong></td>
        <td>${nota.aporte_al_trimestre.toFixed(2)}</td>
        <td>
          <button onclick="editarNota(${nota.id_nota_mensual})" 
                  class="btn btn-sm btn-warning">
            ✏️ Editar
          </button>
        </td>
      </tr>
    `;
  });
}
```

---

### **PASO 8: Consultar Nota Trimestral** 📈

**Endpoint:** `POST /sistema-evaluacion/nota-trimestral`

**Body:**

```json
{
  "id_alumno": 1,
  "id_asignatura": 1,
  "trimestre": 1,
  "anio_academico": "2025"
}
```

**Respuesta:**

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
      "nota_mensual": 8.75,
      "porcentaje": 27,
      "aporte": 2.36
    },
    {
      "mes": "Abril",
      "nota_mensual": 9.0,
      "porcentaje": 45,
      "aporte": 4.05
    }
  ],
  "nota_trimestral": 8.78,
  "fecha_calculo": "2025-11-08T10:45:00.000Z"
}
```

**Uso en Frontend:**

```typescript
// Calcular nota trimestral
async function calcularNotaTrimestral(idAlumno, idAsignatura, trimestre) {
  const body = {
    id_alumno: idAlumno,
    id_asignatura: idAsignatura,
    trimestre: trimestre,
    anio_academico: '2025',
  };

  const response = await fetch('/sistema-evaluacion/nota-trimestral', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  const resultado = await response.json();

  // Mostrar desglose trimestral
  document.getElementById('trimestral').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h5>Trimestre ${resultado.trimestre} - Año ${resultado.anio_academico}</h5>
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Nota Mensual</th>
              <th>Porcentaje</th>
              <th>Aporte</th>
            </tr>
          </thead>
          <tbody>
            ${resultado.notas_mensuales
              .map(
                (nm) => `
              <tr>
                <td>${nm.mes}</td>
                <td>${nm.nota_mensual.toFixed(2)}</td>
                <td>${nm.porcentaje}%</td>
                <td>${nm.aporte.toFixed(2)}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr class="table-success">
              <td colspan="3"><strong>NOTA TRIMESTRAL:</strong></td>
              <td><strong>${resultado.nota_trimestral.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}
```

---

## 🎨 Ejemplo Completo de Interfaz Frontend

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Sistema de Ingreso de Notas</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <div class="container mt-4">
      <h1>📚 Sistema de Ingreso de Notas</h1>

      <!-- PASO 1: Seleccionar Curso -->
      <div class="card mb-3">
        <div class="card-header">
          <h5>1️⃣ Seleccionar Curso</h5>
        </div>
        <div class="card-body">
          <select
            id="selectCurso"
            class="form-select"
            onchange="onCursoSeleccionado()"
          >
            <option value="">Seleccione un curso...</option>
          </select>
          <div id="infoCurso" class="mt-2"></div>
        </div>
      </div>

      <!-- PASO 2: Seleccionar Asignatura -->
      <div class="card mb-3">
        <div class="card-header">
          <h5>2️⃣ Seleccionar Asignatura</h5>
        </div>
        <div class="card-body">
          <select
            id="selectAsignatura"
            class="form-select"
            onchange="onAsignaturaSeleccionada()"
            disabled
          >
            <option value="">Seleccione una asignatura...</option>
          </select>
        </div>
      </div>

      <!-- PASO 3: Seleccionar Alumno -->
      <div class="card mb-3">
        <div class="card-header">
          <h5>3️⃣ Seleccionar Alumno</h5>
        </div>
        <div class="card-body">
          <table class="table" id="tablaAlumnos">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>NIE</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <!-- PASO 4: Formulario de Notas -->
      <div class="card mb-3" id="cardFormulario" style="display: none;">
        <div class="card-header">
          <h5>4️⃣ Ingresar Notas</h5>
        </div>
        <div class="card-body">
          <form id="formNotas" onsubmit="guardarNotas(event)">
            <div class="row mb-3">
              <div class="col-md-6">
                <label>Mes:</label>
                <select name="mes" class="form-select" required>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                </select>
              </div>
              <div class="col-md-6">
                <label>Año:</label>
                <input
                  type="number"
                  name="anio"
                  value="2025"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div id="camposNotas"></div>

            <div class="alert alert-info">
              <strong>Fórmula:</strong> <span id="formulaCalculo"></span>
            </div>

            <button type="submit" class="btn btn-primary">
              💾 Guardar Notas
            </button>
          </form>
        </div>
      </div>

      <!-- PASO 5: Resultados -->
      <div id="promedios"></div>
    </div>

    <script src="app.js"></script>
  </body>
</html>
```

---

## 📊 Explicación de los Cálculos

### Para BÁSICA:

```
Promedio Puro = (Suma de todas las actividades) / (Cantidad de actividades)
Ejemplo: (8.5 + 9.0 + 7.5 + 8.0) / 4 = 8.25

Promedio 70% = Promedio Puro × 0.70
Ejemplo: 8.25 × 0.70 = 5.78

Promedio 30% = Examen Mensual × 0.30
Ejemplo: 9.0 × 0.30 = 2.70

Nota Mensual = Promedio 70% + Promedio 30%
Ejemplo: 5.78 + 2.70 = 8.48

Conversión 28% (Aporte Febrero al Trimestre) = Nota Mensual × 0.28
Ejemplo: 8.48 × 0.28 = 2.37
```

### Para BACHILLERATO:

```
Actividades Integradoras (25%) = Promedio Act.Int × 0.25
Tareas (5%) = Promedio Tareas × 0.05
Coevaluación (5%) = Promedio Coev × 0.05
Laboratorio (10%) = Promedio Lab × 0.10
Examen Parcial (25%) = Examen Parcial × 0.25
Examen Periodo (30%) = Examen Periodo × 0.30

Nota Periodo = Suma de todos los componentes
```

---

## 🚀 Resumen de Endpoints Clave

| Paso | Endpoint                                                | Método | Propósito                    |
| ---- | ------------------------------------------------------- | ------ | ---------------------------- |
| 1    | `/cursos/mis-cursos`                                    | GET    | Cargar cursos del orientador |
| 2    | `/cursos/:id/nivel-educativo`                           | GET    | Validar tipo de evaluación   |
| 3    | `/asignaturas/curso/:idCurso`                           | GET    | Cargar asignaturas del curso |
| 4    | `/cursos/:id/alumnos`                                   | GET    | Cargar alumnos del curso     |
| 5    | `/sistema-evaluacion/formato-evaluacion/asignatura/:id` | GET    | Obtener formato dinámico     |
| 6    | `/sistema-evaluacion/nota-mensual/simple`               | POST   | Guardar notas                |
| 7    | `/sistema-evaluacion/notas-mensuales/simple`            | GET    | Consultar notas guardadas    |
| 8    | `/sistema-evaluacion/nota-trimestral`                   | POST   | Calcular nota trimestral     |

---

## ✅ Checklist de Implementación

- [ ] Implementar autenticación JWT
- [ ] Cargar dropdown de cursos del orientador
- [ ] Mostrar nivel educativo del curso seleccionado
- [ ] Cargar asignaturas del curso
- [ ] Cargar lista de alumnos
- [ ] Obtener y renderizar formato de evaluación dinámico
- [ ] Validar formulario según nivel educativo
- [ ] Implementar guardado de notas
- [ ] Mostrar promedios calculados en tiempo real
- [ ] Implementar consulta de notas guardadas
- [ ] Implementar cálculo de nota trimestral
- [ ] Agregar manejo de errores
- [ ] Agregar feedback visual (loading, success, error)

---

🎯 **¡Listo para implementar!** Esta guía cubre todo el flujo necesario para el ingreso de notas desde el frontend.
