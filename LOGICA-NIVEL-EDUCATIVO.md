# 📚 Lógica de Nivel Educativo en el Backend

## 🎯 Cómo Funciona

### **Jerarquía:**
```
Grado Académico (tiene nivel_educativo: BASICA | BACHILLERATO)
    ↓
Curso (pertenece a un Grado Académico)
    ↓
Asignatura (pertenece a un Curso)
```

### **Ejemplo:**
```
Grado: "5to Grado" → nivel_educativo: BASICA
  ↓
Curso: "5to Grado A" (id_grado_academico: 5)
  ↓
Asignatura: "Matemática I" (id_curso: 1)
```

---

## 🔧 Endpoints Disponibles para el Frontend

### **1. Obtener Nivel Educativo de un CURSO**
```
GET /cursos/:id/nivel-educativo
```

**Respuesta:**
```json
{
  "id_curso": 1,
  "nombre_curso": "5to Grado A",
  "id_grado_academico": 5,
  "nombre_grado": "5to Grado",
  "nivel_educativo": "BASICA"
}
```

**Implementación Backend:**
- Archivo: `src/cursos/cursos.service.ts` línea 449
- Método: `getNivelEducativoCurso(cursoId)`

---

### **2. Obtener ASIGNATURA con Nivel Educativo incluido**
```
GET /asignaturas/:id
```

**Respuesta:**
```json
{
  "id_asignatura": 2,
  "nombre": "Matemática I",
  "id_curso": 1,
  "curso": {
    "id_curso": 1,
    "nombre": "5to Grado A",
    "id_grado_academico": 5,
    "gradoAcademico": {
      "id_grado_academico": 5,
      "nombre": "5to Grado",
      "nivel_educativo": "BASICA"  ← ✅ AQUÍ ESTÁ
    }
  }
}
```

**Implementación Backend:**
- Archivo: `src/asignaturas/asignaturas.service.ts`
- Método: `findOne(id)` línea 84
- **Ya incluye:** `gradoAcademico` anidado con `nivel_educativo`

---

### **3. Obtener FORMATO de Evaluación (ya implementado)**
```
GET /sistema-evaluacion/formato-evaluacion/asignatura/:id_asignatura
```

**Respuesta:**
```json
{
  "nivel": "BASICA",  ← ✅ Automáticamente detectado
  "asignatura": {
    "id": 2,
    "nombre": "Matemática I",
    "curso": "5to Grado A",
    "grado": "5to Grado"
  },
  "formato": "FIJO",
  "estructura_actividades": [...]
}
```

**Implementación Backend:**
- Archivo: `src/sistema-evaluacion/sistema-evaluacion.service.ts` línea 1962
- Método: `obtenerFormatoEvaluacionPorAsignatura()`
- **Detecta automáticamente** el nivel usando: `obtenerNivelEducativo(id_asignatura)` línea 39

---

## 💡 Cómo Usar en el Frontend

### **Opción 1: Desde el Curso**
```typescript
// Si tienes el ID del curso
const response = await fetch(`/cursos/${cursoId}/nivel-educativo`);
const { nivel_educativo } = await response.json();

if (nivel_educativo === 'BASICA') {
  // Mostrar formato Básica
} else {
  // Mostrar formato Bachillerato
}
```

### **Opción 2: Desde la Asignatura**
```typescript
// Si tienes el ID de la asignatura
const asignatura = await fetch(`/asignaturas/${asignaturaId}`);
const nivel = asignatura.curso.gradoAcademico.nivel_educativo;
```

### **Opción 3: Usar el Endpoint de Formato (RECOMENDADO)** ✅
```typescript
// El backend YA detecta automáticamente el nivel
const formato = await fetch(`/sistema-evaluacion/formato-evaluacion/asignatura/${asignaturaId}`);

// El campo 'nivel' ya viene en la respuesta
if (formato.nivel === 'BASICA') {
  // Renderizar: Tarea 1, Revisión, Tarea 2, Laboratorio
  formato.estructura_actividades.forEach(act => {
    renderInput(act.etiqueta, act.requerido);
  });
}
```

---

## ✅ Verificación de la Lógica

### **Test 1: Grado Académico → Nivel**
```sql
SELECT 
  id_grado_academico,
  nombre,
  nivel_educativo
FROM "Grado_Academico"
ORDER BY nivel_educativo, nombre;
```

### **Test 2: Curso → Grado → Nivel**
```sql
SELECT 
  c.id_curso,
  c.nombre as curso,
  g.nombre as grado,
  g.nivel_educativo
FROM "Curso" c
JOIN "Grado_Academico" g ON c.id_grado_academico = g.id_grado_academico
ORDER BY g.nivel_educativo, c.nombre;
```

### **Test 3: Asignatura → Curso → Grado → Nivel**
```sql
SELECT 
  a.id_asignatura,
  a.nombre as asignatura,
  c.nombre as curso,
  g.nombre as grado,
  g.nivel_educativo
FROM "Asignatura" a
JOIN "Curso" c ON a.id_curso = c.id_curso
JOIN "Grado_Academico" g ON c.id_grado_academico = g.id_grado_academico
ORDER BY g.nivel_educativo, a.nombre;
```

---

## 🎨 Resumen para el Frontend

**El backend YA tiene toda la lógica implementada:**

1. ✅ Los cursos incluyen `gradoAcademico.nivel_educativo`
2. ✅ Las asignaturas incluyen `curso.gradoAcademico.nivel_educativo`
3. ✅ El endpoint `/formato-evaluacion/asignatura/:id` detecta automáticamente el nivel
4. ✅ La detección es dinámica basada en la BD

**El frontend debe:**
- Llamar a `/formato-evaluacion/asignatura/:id` 
- Leer el campo `nivel` de la respuesta
- Renderizar el formulario según `estructura_actividades`

**NO necesita:**
- Hardcodear los tipos de actividad
- Saber manualmente si es BÁSICA o BACHILLERATO
- Hacer lógica de detección por su cuenta

---

¡El backend está completo y listo para usar! 🚀
