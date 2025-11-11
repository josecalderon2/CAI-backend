# Sistema Completo de Calificaciones - CAI Backend

## Cambios Realizados en el Schema de Prisma

### 1. Eliminación de Campo `calificacion` en Evaluacion

- **Eliminado**: Campo `calificacion` del modelo `Evaluacion`
- **Razón**: Las calificaciones ya se guardan en el modelo `Notas`

### 2. Nuevas Tablas para Sistema de Promedios

#### 2.1 `PromedioMensual` (Para BÁSICA)

Almacena los promedios mensuales por asignatura con la fórmula:

```
PromMes = ((0.05·Tareas + 0.15·Revisiones + 0.15·Laboratorios) / 0.35) × 100
```

**Campos:**

- `promedioTareas`: Promedio de tareas del mes
- `promedioRevisiones`: Promedio de revisiones del mes
- `promedioLaboratorios`: Promedio de laboratorios del mes
- `promedioMensual`: Resultado final normalizado a 100

**Índice único:** `alumnoId + asignaturaId + anioAcademico + mes`

#### 2.2 `PromedioTrimestral` (Para BÁSICA)

Almacena los promedios trimestrales por asignatura con la fórmula:

```
Trimestre = 0.35·Meses + 0.35·Actividades + 0.30·Examen

Donde:
- Meses = 0.28·Mes1 + 0.27·Mes2 + 0.45·Mes3
- Actividades = 0.25·ActIntegradora + 0.10·Autoevaluacion
```

**Campos:**

- `promedioMeses`: Promedio ponderado de los 3 meses (28%-27%-45%)
- `actividadIntegradora`: Nota de actividad integradora
- `autoevaluacion`: Nota de autoevaluación
- `promedioActividades`: Calculado (0.25·ActInteg + 0.10·Autoeval)
- `examenTrimestral`: Nota del examen trimestral
- `promedioTrimestral`: Resultado final
- `aprobado`: Boolean que indica si aprobó (>= nota_minima)

**Índice único:** `alumnoId + asignaturaId + anioAcademico + trimestre`

#### 2.3 `PromedioPeriodo` (Para BACHILLERATO)

Almacena los promedios por periodo (4 periodos) con la fórmula:

```
Periodo = 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParcial + 0.30·ExPeriodo
```

**Campos:**

- `actividadIntegradora`: 25%
- `promedioTareas`: 5%
- `coevaluacion`: 5%
- `promedioLaboratorios`: 10%
- `examenParcial`: 25%
- `examenPeriodo`: 30%
- `promedioPeriodo`: Resultado final
- `aprobado`: Boolean que indica si aprobó

**Índice único:** `alumnoId + asignaturaId + anioAcademico + periodo`

#### 2.4 `PromedioFinalAsignatura`

Almacena el promedio final anual de cada asignatura.

**Para BÁSICA:**

- `promedioTrimestre1`, `promedioTrimestre2`, `promedioTrimestre3`
- `promedioFinal`: Promedio de los 3 trimestres

**Para BACHILLERATO:**

- `promedioPeriodo1`, `promedioPeriodo2`, `promedioPeriodo3`, `promedioPeriodo4`
- `promedioFinal`: Promedio de los 4 periodos

**Campos de control:**

- `aprobado`: Boolean - true si >= nota_minima del grado
- `requiereRecuperacion`: Boolean - true si reprobó
- `notaRecuperacion`: Float (para implementación futura)
- `aproboRecuperacion`: Boolean (para implementación futura)

**Índice único:** `alumnoId + asignaturaId + anioAcademico`

#### 2.5 `PromedioFinalAlumno`

Almacena el promedio general del alumno (todas las asignaturas).

**Campos:**

- `promedioGeneral`: Promedio de todas las asignaturas
- `aprobadoTodasAsignaturas`: Boolean - true si aprobó todas
- `asignaturasReprobadas`: Int - Cantidad de asignaturas reprobadas
- `estadoFinal`: "APROBADO", "REPROBADO", "EN_RECUPERACION"
- `calificacionesCerradas`: Boolean - true cuando el orientador finaliza el año
- `fechaCierre`: DateTime de cierre

**Índice único:** `alumnoId + cursoId + anioAcademico`

### 3. Modificación en `HistorialAcademico`

- Campo `notaPromedio` ahora es **SOLO LECTURA**
- Se llena automáticamente desde `PromedioFinalAlumno.promedioGeneral`
- No debe ser modificado manualmente por el usuario
- Se actualiza automáticamente al promover

### 4. Sistema de Aprobación por Asignatura

**Regla importante:** Un alumno puede reprobar una asignatura y eso lo reprueba del curso completo.

**Validación en Promociones:**
Al promover un alumno, se debe validar:

1. Que `PromedioFinalAlumno.aprobadoTodasAsignaturas === true`
2. Si `aprobadoTodasAsignaturas === false`, el alumno NO puede ser promovido
3. Se debe mostrar qué asignaturas tiene reprobadas

**Estado en promoción:**

- `APROBADO`: Aprobó todas las asignaturas
- `REPROBADO`: Reprobó al menos una asignatura
- `EN_RECUPERACION`: Para implementación futura del periodo de recuperación

### 5. Control de Finalización de Año Académico

Se agregó el campo `calificacionesCerradas` en `PromedioFinalAlumno` para que el orientador pueda:

1. Terminar de calificar todas las evaluaciones
2. Marcar como "cerrado" el año académico
3. Diferenciarlo del periodo de recuperación (implementación futura)

Esto permite saber cuándo un orientador ya finalizó de calificar y está listo para promoción.

## Flujo de Cálculo de Promedios

### Para BÁSICA (1° a 9°):

1. **Nivel Mensual** (por asignatura):
   - Se calculan los promedios de: Tareas, Revisiones, Laboratorios
   - Se aplica la fórmula mensual normalizada a 100
   - Se guarda en `PromedioMensual`

2. **Nivel Trimestral** (por asignatura):
   - Se obtienen los 3 promedios mensuales del trimestre
   - Se ponderan (28%-27%-45%)
   - Se suman Actividad Integradora y Autoevaluación
   - Se suma el Examen Trimestral
   - Se aplica la fórmula trimestral
   - Se verifica aprobación (>= nota_minima)
   - Se guarda en `PromedioTrimestral`

3. **Nivel Anual** (por asignatura):
   - Se promedian los 3 trimestres
   - Se verifica aprobación
   - Se guarda en `PromedioFinalAsignatura`

4. **Promedio General** (alumno):
   - Se promedian todas las asignaturas
   - Se cuenta cuántas reprobó
   - Se determina si aprobó todas
   - Se guarda en `PromedioFinalAlumno`

5. **Historial Académico**:
   - Se copia automáticamente `PromedioFinalAlumno.promedioGeneral` a `HistorialAcademico.notaPromedio`

### Para BACHILLERATO:

1. **Nivel Periodo** (por asignatura):
   - Se calculan los 6 rubros del periodo
   - Se aplica la fórmula del periodo
   - Se verifica aprobación
   - Se guarda en `PromedioPeriodo`

2. **Nivel Anual** (por asignatura):
   - Se promedian los 4 periodos
   - Se verifica aprobación
   - Se guarda en `PromedioFinalAsignatura`

3. **Promedio General** (alumno):
   - Igual que en BÁSICA

## Índices Creados para Optimización

- `PromedioMensual`: Por alumno-asignatura, por año-trimestre
- `PromedioTrimestral`: Por alumno-asignatura, por año-trimestre, por aprobación
- `PromedioPeriodo`: Por alumno-asignatura, por año-periodo, por aprobación
- `PromedioFinalAsignatura`: Por alumno-año, por asignatura-año, por aprobación, por recuperación
- `PromedioFinalAlumno`: Por alumno-año, por aprobación de todas, por cierre de calificaciones

## Próximos Pasos

### 1. Actualizar Servicios

- [ ] Eliminar/actualizar referencias a `evaluacion.calificacion`
- [ ] Crear servicio para cálculo de promedios mensuales
- [ ] Crear servicio para cálculo de promedios trimestrales/periodos
- [ ] Crear servicio para cálculo de promedios finales por asignatura
- [ ] Crear servicio para cálculo de promedio final del alumno
- [ ] Actualizar servicio de calificaciones para disparar cálculos automáticos

### 2. Actualizar PromocionesService

- [ ] Agregar validación de `aprobadoTodasAsignaturas` antes de promover
- [ ] Mostrar lista de asignaturas reprobadas si no puede promover
- [ ] Copiar automáticamente `promedioGeneral` a `HistorialAcademico.notaPromedio`
- [ ] Validar que `calificacionesCerradas === true` antes de permitir promoción

### 3. Crear Endpoints Nuevos

- [ ] `POST /calificaciones/cerrar-ano/:alumnoId/:anioAcademico` - Para que el orientador marque como cerrado
- [ ] `GET /promedios/alumno/:alumnoId/:anioAcademico` - Ver todos los promedios del alumno
- [ ] `GET /promedios/asignatura/:asignaturaId/:anioAcademico` - Ver promedios de todos los alumnos en una asignatura
- [ ] `GET /promedios/verificar-aprobacion/:alumnoId/:anioAcademico` - Verificar si puede ser promovido

### 4. Frontend

- [ ] Mostrar indicador de "Calificaciones Cerradas" o "Pendiente"
- [ ] No permitir promoción si no están cerradas las calificaciones
- [ ] Mostrar lista de asignaturas reprobadas en interfaz de promoción
- [ ] Vista de promedios desglosados (mensual/trimestral/final)

## Notas Importantes

1. **Compatibilidad**: Los módulos de promociones existentes NO fueron modificados en su estructura, solo se agregarán validaciones adicionales.

2. **Periodo de Recuperación**: Queda para implementación futura. Los campos ya están en el schema (`requiereRecuperacion`, `notaRecuperacion`, `aproboRecuperacion`).

3. **Automatización**: Todo el cálculo de promedios debe ser automático. Cuando se registra o actualiza una nota en `Notas`, debe disparar el recálculo en cascada.

4. **Solo Lectura**: El campo `HistorialAcademico.notaPromedio` es de solo lectura y se actualiza automáticamente.

5. **Escala 0-10**: Todos los cálculos se realizan en escala 0-10 con redondeo a 2 decimales.

## Migración Aplicada

Migración `20251111024726_sistema_completo_calificaciones` aplicada exitosamente.

La base de datos está sincronizada con el nuevo schema.
