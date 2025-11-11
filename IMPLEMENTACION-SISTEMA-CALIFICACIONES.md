# Implementación Completa del Sistema de Calificaciones

## IMPLEMENTACIÓN COMPLETADA

### 1. Schema de Prisma Actualizado

#### Cambios realizados:

- **Eliminado** campo `calificacion` del modelo `Evaluacion`
- **Creadas 5 nuevas tablas** para el sistema de promedios:
- `PromedioMensual` - Promedios mensuales (BÁSICA)
- `PromedioTrimestral` - Promedios trimestrales (BÁSICA)
- `PromedioPeriodo` - Promedios por periodo (BACHILLERATO)
- `PromedioFinalAsignatura` - Promedio final anual por asignatura
- `PromedioFinalAlumno` - Promedio general del alumno
- **Actualizadas relaciones** en modelos `Alumno`, `Asignatura` y `Curso`
- **Migración aplicada**: `20251111024726_sistema_completo_calificaciones`

### 2. Nuevo Módulo de Promedios

Ubicación: `src/promedios/`

#### Archivos creados:

- `promedios.service.ts` - Servicio completo con lógica de cálculo
- `promedios.controller.ts` - Controlador con endpoints REST
- `promedios.module.ts` - Módulo de NestJS

#### Funcionalidades implementadas en PromediosService:

##### A. Cálculo de Promedios Mensuales (BÁSICA)

```typescript
calcularPromedioMensual(alumnoId, asignaturaId, anioAcademico, mes, trimestre);
```

- Agrupa notas por tipo: Tareas, Revisiones, Laboratorios
- Aplica fórmula: `((0.05·Tareas + 0.15·Revisiones + 0.15·Lab) / 0.35) × 100`
- Maneja componentes no programados (NA no pondera)
- Guarda resultado en `PromedioMensual`

##### B. Cálculo de Promedios Trimestrales (BÁSICA)

```typescript
calcularPromedioTrimestral(alumnoId, asignaturaId, anioAcademico, trimestre);
```

- Calcula promedios de 3 meses con ponderación (28%-27%-45%)
- Obtiene Actividad Integradora y Autoevaluación
- Obtiene Examen Trimestral
- Aplica fórmula: `0.35·Meses + 0.35·Actividades + 0.30·Examen`
- Verifica aprobación con `nota_minima` del grado
- Guarda resultado en `PromedioTrimestral`

##### C. Cálculo de Promedios por Periodo (BACHILLERATO)

```typescript
calcularPromedioPeriodo(alumnoId, asignaturaId, anioAcademico, periodo);
```

- Obtiene los 6 rubros del periodo
- Aplica fórmula: `0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParcial + 0.30·ExPeriodo`
- Verifica aprobación
- Guarda resultado en `PromedioPeriodo`

##### D. Cálculo de Promedio Final por Asignatura

```typescript
calcularPromedioFinalAsignatura(alumnoId, asignaturaId, anioAcademico);
```

- Detecta automáticamente si es BÁSICA o BACHILLERATO
- **BÁSICA**: Promedia 3 trimestres
- **BACHILLERATO**: Promedia 4 periodos
- Marca campo `aprobado` según `nota_minima`
- Marca campo `requiereRecuperacion` si reprobó
- Guarda resultado en `PromedioFinalAsignatura`

##### E. Cálculo de Promedio Final del Alumno

```typescript
calcularPromedioFinalAlumno(alumnoId, cursoId, anioAcademico);
```

- Calcula promedio de todas las asignaturas del curso
- Cuenta asignaturas reprobadas
- Marca `aprobadoTodasAsignaturas` (true si aprobó todas)
- Determina `estadoFinal`: "APROBADO", "REPROBADO" o "EN_RECUPERACION"
- Guarda resultado en `PromedioFinalAlumno`

##### F. Recálculo Automático

```typescript
recalcularTodosLosPromedios(alumnoId, anioAcademico);
```

- Encuentra la inscripción activa del alumno
- Recalcula TODAS las asignaturas
- Actualiza promedio final general
- **Se llama automáticamente** al crear/actualizar/eliminar una calificación

##### G. Cierre de Calificaciones

```typescript
cerrarCalificaciones(alumnoId, cursoId, anioAcademico);
```

- Marca `calificacionesCerradas = true`
- Registra `fechaCierre`
- Indica que el orientador finalizó las calificaciones

##### H. Verificación de Aprobación para Promoción

```typescript
verificarAprobacionParaPromocion(alumnoId, anioAcademico);
```

- Verifica si el alumno está inscrito
- Verifica si los promedios están calculados
- Verifica si las calificaciones están cerradas
- Verifica si aprobó todas las asignaturas
- **Retorna lista de asignaturas reprobadas** si aplica

##### I. Obtención de Promedios

```typescript
obtenerPromediosAlumno(alumnoId, anioAcademico);
```

- Obtiene promedio general del alumno
- Obtiene promedios por cada asignatura
- Retorna vista completa del estado académico

#### Endpoints REST creados:

| Método | Ruta                                        | Descripción                                     |
| ------ | ------------------------------------------- | ----------------------------------------------- |
| GET    | `/promedios/alumno/:alumnoId`               | Ver todos los promedios de un alumno            |
| GET    | `/promedios/verificar-aprobacion/:alumnoId` | Verificar si puede ser promovido                |
| POST   | `/promedios/recalcular/:alumnoId`           | Recalcular manualmente todos los promedios      |
| POST   | `/promedios/cerrar/:alumnoId`               | Cerrar calificaciones (orientador finaliza año) |

Todos los endpoints requieren autenticación JWT y roles: `Admin`, `P.A`, `Orientador`

### 3. Integración con Módulo de Calificaciones

#### CalificacionesService actualizado:

- Inyecta `PromediosService`
- **Método `create()`**: Recalcula promedios automáticamente al crear una calificación
- **Método `update()`**: Recalcula promedios automáticamente al actualizar una calificación
- **Método `remove()`**: Recalcula promedios automáticamente al eliminar una calificación
- **Eliminado método** `actualizarPromedio` antiguo (ya no se usa)

#### CalificacionesModule actualizado:

- Importa `PromediosModule`

### 4. Integración con Módulo de Promociones

#### PromocionesService actualizado:

- Inyecta `PromediosService`
- **Validación antes de promover**:

```typescript
const verificacion =
  await this.promediosService.verificarAprobacionParaPromocion(
    alumnoId,
    anioActual,
  );

if (!verificacion.puedePromover) {
  throw new BadRequestException({
    message: `No se puede promover al alumno: ${verificacion.motivo}`,
    asignaturasReprobadas: verificacion.asignaturasReprobadas || [],
  });
}
```

- **Copia automática** de `PromedioFinalAlumno.promedioGeneral` a `HistorialAcademico.notaPromedio`
- **Manejo de errores** con información de asignaturas reprobadas

#### PromocionesModule actualizado:

- Importa `PromediosModule`

### 5. AppModule actualizado

- Agregado `PromediosModule` a la lista de imports

## 🔄 Flujo de Trabajo Completo

### Escenario 1: Registrar una Calificación

1. **Frontend** llama: `POST /calificaciones`
2. **CalificacionesService.create()**:
   - Valida la evaluación
   - Valida que no existe calificación previa
   - Valida que el alumno existe y está inscrito
   - Crea el registro en la tabla `Notas`
   - ✨ **Llama automáticamente**: `promediosService.recalcularTodosLosPromedios()`
3. **PromediosService.recalcularTodosLosPromedios()**:
   - Encuentra la inscripción activa
   - Para cada asignatura del curso:
     - Detecta si es BÁSICA o BACHILLERATO
     - **Si BÁSICA**: Calcula mensuales → trimestrales → final asignatura
     - **Si BACHILLERATO**: Calcula periodos → final asignatura
   - Calcula promedio general del alumno
   - Actualiza `PromedioFinalAlumno`
4. **Resultado**: Todos los promedios se actualizan automáticamente

### Escenario 2: Promover un Alumno

1. **Frontend** llama: `POST /promociones/promover-alumno`
2. **PromocionesService.promoverAlumno()**:
   - **PRIMERO valida**: `promediosService.verificarAprobacionParaPromocion()`
   - Si no puede promover: Lanza error con lista de asignaturas reprobadas
   - Si puede promover: Continúa
   - Obtiene `PromedioFinalAlumno.promedioGeneral`
   - Inicia transacción:
     - Finaliza inscripción actual
     - Crea/actualiza `HistorialAcademico` con el promedio desde `PromedioFinalAlumno`
     - Crea nueva inscripción
     - Actualiza alumno
3. **Resultado**: Solo se promueven alumnos que:
   - Tienen calificaciones cerradas
   - Aprobaron todas las asignaturas
   - Tienen sus promedios calculados

### Escenario 3: Cerrar Calificaciones del Año

1. **Orientador** termina de calificar
2. **Frontend** llama: `POST /promedios/cerrar/:alumnoId?cursoId=X&anioAcademico=2025`
3. **PromediosService.cerrarCalificaciones()**:
   - Marca `calificacionesCerradas = true`
   - Registra `fechaCierre = now()`
4. **Resultado**: El alumno queda listo para ser promovido

### Escenario 4: Verificar Estado de un Alumno

1. **Frontend** llama: `GET /promedios/verificar-aprobacion/:alumnoId?anioAcademico=2025`
2. **PromediosService.verificarAprobacionParaPromocion()**:
   - Retorna:
     ```json
     {
       "puedePromover": false,
       "motivo": "Alumno reprobó 2 asignatura(s)",
       "asignaturasReprobadas": [
         { "asignatura": "Matemáticas", "promedio": 5.2 },
         { "asignatura": "Ciencias", "promedio": 4.8 }
       ]
     }
     ```
3. **Resultado**: Frontend muestra información clara al usuario

## 📊 Estructura de Base de Datos

### Jerarquía de Cálculos

```
Notas (tabla base)
    ↓
PromedioMensual (BÁSICA)
    ↓
PromedioTrimestral (BÁSICA) ←→ PromedioPeriodo (BACHILLERATO)
    ↓                               ↓
PromedioFinalAsignatura (ambos sistemas)
    ↓
PromedioFinalAlumno (promedio general)
    ↓ (al promover)
HistorialAcademico.notaPromedio (solo lectura)
```

### Campos de Control Importantes

| Tabla                     | Campo                      | Propósito                                      |
| ------------------------- | -------------------------- | ---------------------------------------------- |
| `PromedioTrimestral`      | `aprobado`                 | Indica si aprobó el trimestre                  |
| `PromedioPeriodo`         | `aprobado`                 | Indica si aprobó el periodo                    |
| `PromedioFinalAsignatura` | `aprobado`                 | Indica si aprobó la asignatura                 |
| `PromedioFinalAsignatura` | `requiereRecuperacion`     | Marca si necesita recuperación                 |
| `PromedioFinalAlumno`     | `aprobadoTodasAsignaturas` | ⚠️ **CLAVE para promoción**                    |
| `PromedioFinalAlumno`     | `asignaturasReprobadas`    | Cantidad reprobada                             |
| `PromedioFinalAlumno`     | `calificacionesCerradas`   | ⚠️ **CLAVE para promoción**                    |
| `PromedioFinalAlumno`     | `estadoFinal`              | "APROBADO" / "REPROBADO" / "EN_RECUPERACION"   |
| `HistorialAcademico`      | `notaPromedio`             | 📖 **Solo lectura** - Se copia automáticamente |

## Validaciones Implementadas

### Validación 1: Al Promover

```typescript
// En PromocionesService.promoverAlumno()
const verificacion = await this.promediosService.verificarAprobacionParaPromocion(...);
if (!verificacion.puedePromover) {
  throw new BadRequestException({
    message: verificacion.motivo,
    asignaturasReprobadas: verificacion.asignaturasReprobadas
  });
}
```

**Motivos de rechazo:**

- Alumno no inscrito en el año académico
- No se han calculado los promedios
- Las calificaciones no han sido cerradas por el orientador
- El alumno reprobó una o más asignaturas

### Validación 2: Regla NA (No Aplica)

```typescript
// Si un componente no se programó, no afecta el promedio
if (promedioTareas !== null) {
  suma += 0.05 * promedioTareas;
  divisor += 0.05;
}
// Si no hay ningún componente programado, promedio = 0
const promedioMensual = divisor > 0 ? (suma / divisor) * 100 : 0;
```

### Validación 3: Verificación de Nota Mínima

```typescript
// Obtiene nota_minima del grado académico
const notaMinima = asignatura?.curso?.gradoAcademico?.nota_minima || 6.0;
const aprobado = promedio >= notaMinima;
```

## 🎯 Próximos Pasos (Pendientes para Implementación Futura)

### 1. Frontend

- [ ] Vista de promedios desglosados por alumno
- [ ] Indicador visual de "Calificaciones Cerradas"
- [ ] Bloqueo de promoción si no están cerradas las calificaciones
- [ ] Lista de asignaturas reprobadas en modal de promoción
- [ ] Dashboard de promedios por curso/asignatura

### 2. Periodo de Recuperación

- [ ] Endpoint para registrar nota de recuperación
- [ ] Lógica para actualizar `notaRecuperacion` en `PromedioFinalAsignatura`
- [ ] Lógica para recalcular `aproboRecuperacion`
- [ ] Actualizar estado a "EN_RECUPERACION"

### 3. Reportes

- [ ] Reporte de promedios por curso
- [ ] Reporte de asignaturas con más reprobados
- [ ] Reporte histórico de promedios
- [ ] Exportación a Excel/PDF

### 4. Optimizaciones

- [ ] Cache de promedios calculados
- [ ] Jobs en background para recálculos masivos
- [ ] Notificaciones cuando se cierran calificaciones

## 📝 Notas Importantes

1. **Automatización Total**: El recálculo de promedios es completamente automático. No requiere intervención manual.

2. **Manejo de Errores**: Los errores en el recálculo de promedios no bloquean el registro de calificaciones (se registran en consola pero no lanzan excepción).

3. **Compatibilidad**: La estructura de promociones existente NO fue modificada, solo se agregaron validaciones adicionales.

4. **Solo Lectura**: `HistorialAcademico.notaPromedio` es de solo lectura y se actualiza automáticamente al promover.

5. **Escalabilidad**: El sistema está diseñado para manejar tanto BÁSICA como BACHILLERATO automáticamente detectando el tipo de grado.

6. **Redondeo**: Todos los promedios se redondean a 2 decimales: `Math.round(promedio * 100) / 100`

## Checklist de Verificación

- [x] Schema de Prisma actualizado
- [x] Migración aplicada exitosamente
- [x] Prisma Client regenerado
- [x] PromediosService creado con todas las funciones
- [x] PromediosController creado con todos los endpoints
- [x] PromediosModule creado y configurado
- [x] CalificacionesService integrado con PromediosService
- [x] CalificacionesModule actualizado
- [x] PromocionesService integrado con validaciones
- [x] PromocionesModule actualizado
- [x] AppModule actualizado
- [x] Documentación completa creada

## 🎉 Resultado Final

El sistema de calificaciones ahora:

- Calcula automáticamente todos los promedios
- Valida aprobación antes de promover
- Maneja BÁSICA y BACHILLERATO simultáneamente
- Implementa reglas de aprobación por asignatura
- Proporciona endpoints REST para consultas
- Integra con el módulo de promociones existente
- Mantiene compatibilidad con el frontend actual
- Está listo para producción

**La implementación está COMPLETA y lista para pruebas! 🚀**
