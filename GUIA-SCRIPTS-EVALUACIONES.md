# 📚 GUÍA DE SCRIPTS DE EVALUACIONES Y NOTAS

## 🎯 Resumen de Scripts Disponibles

### Scripts de Generación de Evaluaciones

#### 1. `generar-evaluaciones-documento.ts` - BÁSICA (Primaria y Secundaria)

**Qué hace:**

- Genera evaluaciones para el sistema de BÁSICA (Primaria y Secundaria)
- Crea evaluaciones para 3 trimestres al año
- Implementa las reglas correctas de validación

**Estructura que crea por asignatura:**

**Por cada trimestre (3 meses):**

**Evaluaciones Mensuales (1 por mes):**

- 3 Tareas (una por mes: Feb, Mar, Abr / Mayo, Jun, Jul / Ago, Sep, Oct)
- 3 Revisiones de Cuaderno (una por mes)
- 3 Laboratorios (una por mes)

**Evaluaciones Trimestrales (1 por trimestre):**

- 1 Actividad Integradora
- 1 Autoevaluación
- 1 Examen Trimestral

**Total por asignatura:** 12 evaluaciones por trimestre × 3 trimestres = **36 evaluaciones**

**Cómo usarlo:**

```bash
npx ts-node scripts/generar-evaluaciones-documento.ts
```

**Nota:** Modificar la línea del curso si necesitas otro:

```typescript
// Línea 13: Cambiar el id_curso según necesites
where: { id_curso: 1 }, // Cambiar este número
```

---

#### 2. `generar-evaluaciones-bachillerato.ts` - BACHILLERATO

**Qué hace:**

- Genera evaluaciones para el sistema de BACHILLERATO
- Crea evaluaciones para 4 periodos al año
- Implementa las reglas correctas de validación (solo 1 por periodo)

**Estructura que crea por asignatura:**

**Por cada periodo (4 en el año):**

- 1 Tarea (5%)
- 1 Laboratorio (10%)
- 1 Actividad Integradora (25%)
- 1 Coevaluación (5%)
- 1 Examen Parcial (25%)
- 1 Examen de Periodo (30%)

**Total por asignatura:** 6 evaluaciones por periodo × 4 periodos = **24 evaluaciones**

**Cómo usarlo:**

```bash
npx ts-node scripts/generar-evaluaciones-bachillerato.ts
```

**Nota:** Busca automáticamente el curso "Primer Año de Bachillerato". Modificar si necesitas otro curso.

---

#### 3. `limpiar-y-crear-evaluaciones-simples.ts` - LIMPIEZA Y SETUP BÁSICO

**Qué hace:**

- ⚠️ **ELIMINA** todas las notas existentes
- ⚠️ **ELIMINA** todas las evaluaciones existentes
- Crea 1 evaluación de ejemplo por cada tipo de evaluación (18 en total)

**Usar solo para:**

- Reset completo de la base de datos
- Testing inicial
- Cuando quieras empezar de cero

**⚠️ ADVERTENCIA:** Este script borra TODO. Úsalo con cuidado.

```bash
npx ts-node scripts/limpiar-y-crear-evaluaciones-simples.ts
```

---

### Scripts de Ingreso de Notas

#### 4. `ingresar-notas-bachillerato.ts` - Notas de ejemplo para BACHILLERATO

**Qué hace:**

- Ingresa notas de ejemplo para un alumno específico (Carlos Martínez)
- En la asignatura "Sociales" de Bachillerato
- Usa los valores del documento oficial del colegio
- Calcula para obtener 8.28 en cada periodo

**Notas que ingresa (escala 0-10):**

```
Periodo 1, 2, 3 y 4:
- Actividad Integradora: 9.0
- Tarea: 8.7
- Coevaluación: 8.8
- Laboratorio: 8.8
- Examen Parcial: 7.5
- Examen de Periodo: 8.0

Promedio esperado: 8.28 por periodo
Promedio final: 8.28
```

**Cómo usarlo:**

```bash
npx ts-node scripts/ingresar-notas-bachillerato.ts
```

---

#### 5. `setup-notas-ejemplo-completo.ts` - Notas de ejemplo para BÁSICA

**Qué hace:**

- Limpia tablas de promedios del año 2025
- Limpia notas del alumno ID 4
- Ingresa notas de ejemplo siguiendo el documento oficial
- Usa valores que producen 8.813 en el primer trimestre

**Notas que ingresa (escala 0-10):**

```
Mensuales:
- Febrero: 8.2
- Marzo: 8.6
- Abril: 9.0
(Repite patrón para trimestres 2 y 3)

Trimestrales:
- Actividad Integradora: 9.5
- Autoevaluación: 10.0
- Examen Trimestral: 8.0
```

**Cómo usarlo:**

```bash
npx ts-node scripts/setup-notas-ejemplo-completo.ts
```

---

### Scripts de Diagnóstico

#### 6. `mostrar-tipos-evaluacion-por-grado.ts` - Ver configuración

**Qué hace:**

- Muestra todos los tipos de evaluación agrupados por grado académico
- Valida que los porcentajes sumen 100%
- Identifica configuraciones faltantes

**Cómo usarlo:**

```bash
npx ts-node scripts/mostrar-tipos-evaluacion-por-grado.ts
```

**Output esperado:**

```
📚 BACHILLERATO
  1. Actividad Integradora     25%
  2. Coevaluación              5%
  3. Examen de Periodo         30%
  4. Examen Parcial            25%
  5. Laboratorio               10%
  6. Tarea                     5%
  Total: 6 tipos
  Suma: 100% ✓
```

---

## 🔄 Flujo Recomendado de Uso

### Para empezar desde cero:

1. **Limpiar todo:**

```bash
npx ts-node scripts/limpiar-y-crear-evaluaciones-simples.ts
```

2. **Generar evaluaciones para BÁSICA:**

```bash
npx ts-node scripts/generar-evaluaciones-documento.ts
```

3. **Generar evaluaciones para BACHILLERATO:**

```bash
npx ts-node scripts/generar-evaluaciones-bachillerato.ts
```

4. **Ingresar notas de ejemplo (opcional):**

```bash
# Para bachillerato:
npx ts-node scripts/ingresar-notas-bachillerato.ts

# Para básica:
npx ts-node scripts/setup-notas-ejemplo-completo.ts
```

5. **Recalcular promedios (desde el backend corriendo):**

```bash
# Usar endpoint POST /promedios/recalcular/{id_alumno}?anioAcademico=2025
```

---

## ✅ Validaciones Implementadas

Todos los scripts respetan las reglas:

### BÁSICA (Primaria/Secundaria):

- ✅ Tarea, Revisión, Laboratorio: 1 por mes (3 por trimestre)
- ✅ Actividad Integradora, Autoevaluación, Examen: 1 por trimestre
- ✅ Campo `trimestre` obligatorio
- ✅ Campo `mes` para evaluaciones mensuales

### BACHILLERATO:

- ✅ Todos los tipos: 1 por periodo (4 periodos)
- ✅ Campo `periodo` obligatorio
- ✅ No permite duplicados del mismo tipo en el mismo periodo

### General:

- ✅ Año académico automático (año actual)
- ✅ Validación de grado académico
- ✅ No permite tipos de evaluación incorrectos

---

## 🛠️ Modificaciones Comunes

### Cambiar el curso objetivo:

```typescript
// En generar-evaluaciones-documento.ts (línea 13)
where: { id_curso: 1 }, // Cambiar este ID

// En generar-evaluaciones-bachillerato.ts (línea 39)
where: {
  nombre: 'Primer Año de Bachillerato', // Cambiar este nombre
}
```

### Cambiar el alumno para notas:

```typescript
// En ingresar-notas-bachillerato.ts (línea 29)
where: {
  nombre: 'Carlos',  // Cambiar nombre
  apellido: 'Martínez', // Cambiar apellido
}

// En setup-notas-ejemplo-completo.ts (línea 28)
const alumnoId = 4; // Cambiar este ID
```

### Cambiar el año académico:

Los scripts usan automáticamente el año actual, pero puedes cambiarlo:

```typescript
// En cualquier script, buscar:
const anioAcademico = new Date().getFullYear().toString();

// Y cambiar por:
const anioAcademico = '2026'; // O el año que necesites
```

---

## 📊 Verificación Post-Ejecución

Después de correr los scripts, verifica en la base de datos:

```sql
-- Ver total de evaluaciones por asignatura
SELECT
  a.nombre,
  COUNT(*) as total_evaluaciones
FROM Evaluacion e
JOIN Asignatura a ON e.id_asignatura = a.id_asignatura
WHERE e.anio_academico = '2025'
GROUP BY a.nombre;

-- Esperado para BÁSICA: 36 por asignatura
-- Esperado para BACHILLERATO: 24 por asignatura
```

---

## 🐛 Problemas Comunes

### Error: "No se encontró el curso"

- Verifica que el curso existe en la base de datos
- Modifica el nombre o ID del curso en el script

### Error: "No se encontraron tipos de evaluación"

- Ejecuta el seed de la base de datos primero
- Verifica con `mostrar-tipos-evaluacion-por-grado.ts`

### Error: "Ya existe una evaluación"

- Los scripts verifican duplicados antes de crear
- Si quieres recrear, usa primero `limpiar-y-crear-evaluaciones-simples.ts`

### Las notas no se calculan correctamente

- Asegúrate de tener todas las evaluaciones creadas primero
- Ejecuta el endpoint de recalcular promedios después de ingresar notas

---

## 📝 Notas Adicionales

- Todos los scripts usan transacciones implícitas de Prisma
- Los scripts son idempotentes (verifican duplicados)
- Siempre desconectan Prisma al finalizar
- Los logs son descriptivos para seguir el progreso
- Usar en desarrollo, validar antes de producción
