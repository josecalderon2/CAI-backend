# Scripts de Prueba - Sistema de Promedios

## Scripts Principales

### 1. `generar-evaluaciones-documento.ts`

**Propósito:** Genera las evaluaciones según el documento oficial del sistema de evaluación.

**Qué hace:**

- Crea 36 evaluaciones por asignatura (72 total para 2 asignaturas)
- Estructura por trimestre:
  - 9 evaluaciones mensuales (3 meses × 3 tipos: Tarea, Revisión, Laboratorio)
  - 3 evaluaciones trimestrales (Actividad Integradora, Autoevaluación, Examen)
- Total: 12 evaluaciones por trimestre × 3 trimestres = 36 por asignatura

**Uso:**

```bash
npx ts-node scripts/generar-evaluaciones-documento.ts
```

**Cuándo usarlo:**

- Al iniciar el proyecto por primera vez
- Después de resetear la base de datos
- Si necesitas recrear las evaluaciones

---

### 2. `setup-notas-ejemplo-completo.ts`

**Propósito:** Prepara el sistema con las notas del ejemplo del documento para pruebas.

**Qué hace:**

1. Limpia todas las tablas de promedios (PromedioMensual, PromedioTrimestral, PromedioFinalAsignatura, PromedioFinalAlumno)
2. Elimina las notas existentes del alumno 4
3. Ingresa las notas exactas del ejemplo del documento:
   - Febrero: 8.2
   - Marzo: 8.6
   - Abril: 9.0
   - Actividad Integradora: 9.5
   - Autoevaluación: 10.0
   - Examen Trimestral: 8.0

**Resultado esperado:**

- Promedio Trimestre 1: 8.813
- Alumno debe estar APROBADO

**Uso:**

```bash
npx ts-node scripts/setup-notas-ejemplo-completo.ts
```

**Cuándo usarlo:**

- Antes de probar el sistema de cálculo de promedios
- Para verificar que las fórmulas funcionan correctamente
- Después de hacer cambios en las fórmulas de cálculo

---

## Scripts de Bachillerato

### 3. `crear-alumnos-bachillerato.ts`

**Propósito:** Crea alumnos de prueba para el curso de Bachillerato.

**Qué hace:**

- Crea 3 alumnos de prueba (Carlos Martínez, María Rodríguez, José García)
- Los inscribe en el curso "Primer Año de Bachillerato" para 2025
- Verifica si ya existen antes de crearlos

**Uso:**

```bash
npx ts-node scripts/crear-alumnos-bachillerato.ts
```

---

### 4. `generar-evaluaciones-bachillerato.ts`

**Propósito:** Genera las evaluaciones para Bachillerato según el documento oficial.

**Qué hace:**

- Crea 24 evaluaciones por asignatura (4 periodos × 6 tipos)
- Tipos de evaluación por periodo:
  - Tarea (5%)
  - Laboratorio (10%)
  - Actividad Integradora (25%)
  - Coevaluación (5%)
  - Examen Parcial (25%)
  - Examen de Periodo (30%)

**Uso:**

```bash
npx ts-node scripts/generar-evaluaciones-bachillerato.ts
```

---

### 5. `ingresar-notas-bachillerato.ts`

**Propósito:** Ingresa notas de ejemplo para el alumno Carlos Martínez en Matemáticas.

**Qué hace:**

- Limpia notas existentes
- Ingresa 24 notas (6 por periodo × 4 periodos)
- Notas realistas que demuestran progresión:
  - Periodo 1: 8.525 (Buen rendimiento)
  - Periodo 2: 7.525 (Regular)
  - Periodo 3: 8.875 (Mejora)
  - Periodo 4: 9.125 (Excelente)

**Resultado esperado:**

- Promedio Final: **8.51** (Aprobado)

**Uso:**

```bash
npx ts-node scripts/ingresar-notas-bachillerato.ts
```

---

### 6. `consultar-bachillerato.ts`

**Propósito:** Consulta y muestra toda la información de Bachillerato.

**Qué hace:**

- Muestra cursos de Bachillerato
- Lista asignaturas asignadas
- Muestra tipos de evaluación configurados
- Lista alumnos inscritos

**Uso:**

```bash
npx ts-node scripts/consultar-bachillerato.ts
```

---

## Flujo de Trabajo Completo

### Setup Inicial - BÁSICA (1° a 9°)

```bash
# 1. Generar evaluaciones
npx ts-node scripts/generar-evaluaciones-documento.ts

# 2. Ingresar notas de prueba
npx ts-node scripts/setup-notas-ejemplo-completo.ts
```

### Setup Inicial - BACHILLERATO

```bash
# 1. Crear alumnos de prueba
npx ts-node scripts/crear-alumnos-bachillerato.ts

# 2. Generar evaluaciones
npx ts-node scripts/generar-evaluaciones-bachillerato.ts

# 3. Ingresar notas de ejemplo
npx ts-node scripts/ingresar-notas-bachillerato.ts

# 4. Verificar (opcional)
npx ts-node scripts/consultar-bachillerato.ts
```

### Probar el Sistema

#### Para BÁSICA (Alumno ID: 4)

```bash
# 1. Iniciar el servidor
npm run start:dev

# 2. En test-promedios.http:
# - Hacer login
# - POST /promedios/recalcular/4?anioAcademico=2025
# - GET /promedios/alumno/4?anioAcademico=2025
```

#### Para BACHILLERATO (Alumno ID: 11)

```bash
# 1. Iniciar el servidor
npm run start:dev

# 2. En test-promedios.http:
# - Hacer login
# - POST /promedios/recalcular/11?anioAcademico=2025
# - GET /promedios/alumno/11?anioAcademico=2025
```

### Verificar Resultados Esperados

#### BÁSICA (Trimestre 1 - Alumno 4)

- **Promedio Mensual (Febrero):** 8.2
- **Promedio Mensual (Marzo):** 8.6
- **Promedio Mensual (Abril):** 9.0
- **Promedio Meses T1:** 8.68 (28% × 8.2 + 27% × 8.6 + 45% × 9.0)
- **Promedio Actividades:** 9.71 (normalizado: (25% × 9.5 + 10% × 10.0) / 35%)
- **Examen:** 8.0
- **Promedio Trimestre 1:** 8.813 (35% × 8.68 + 35% × 9.71 + 30% × 8.0)

#### BACHILLERATO (Año completo - Alumno 11)

- **Periodo 1:** 8.525
- **Periodo 2:** 7.525
- **Periodo 3:** 8.875
- **Periodo 4:** 9.125
- **Promedio Final:** 8.51 (Aprobado)

---

## Notas Importantes

**Antes de ejecutar estos scripts:**

- Asegúrate de tener el servidor detenido
- Estos scripts modifican la base de datos directamente

  **Después de ejecutar:**

- Reinicia el servidor para que tome los cambios
- Ejecuta el recálculo de promedios desde la API

  **Para producción:**

- NO uses estos scripts en producción
- Son solo para desarrollo y pruebas
- Las notas reales deben ingresarse a través de la API

---

## Scripts Legacy (Obsoletos)

Los siguientes scripts fueron usados durante desarrollo y ya no son necesarios:

- `actualizar-anio-evaluaciones.ts`
- `consultar-*.ts` (varios scripts de consulta)
- `crear-evaluaciones-completas.ts`
- `debug-calculo-promedios.ts`
- `generar-evaluaciones-trimestres.ts`
- `ingresar-*.ts` (otros scripts de ingreso)
- `limpiar-*.ts` (otros scripts de limpieza)
- `ver-*.ts` (varios scripts de visualización)
- `verificar-*.ts` (varios scripts de verificación)

Puedes eliminarlos si deseas limpiar el directorio.
