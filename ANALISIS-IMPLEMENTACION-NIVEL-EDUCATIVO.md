# 🔍 Análisis: Implementación de Distinción BÁSICA vs BACHILLERATO

**Fecha:** 8 de noviembre de 2025  
**Objetivo:** Verificar que el sistema usa correctamente el nivel educativo para distinguir entre BÁSICA y BACHILLERATO

---

## ✅ RESUMEN EJECUTIVO

**Estado:** ✅ **CORRECTAMENTE IMPLEMENTADO**

El sistema SÍ utiliza el nivel educativo del curso (a través de la asignatura) para hacer la distinción correcta entre BÁSICA y BACHILLERATO en TODO el flujo de evaluación.

---

## 📋 Flujo de Obtención del Nivel Educativo

### **Método Principal: `obtenerNivelEducativo()`**

**Ubicación:** `src/sistema-evaluacion/sistema-evaluacion.service.ts` (líneas 39-62)

```typescript
private async obtenerNivelEducativo(
  id_asignatura: number,
): Promise<NivelEducativo> {
  const asignatura = await this.prisma.asignatura.findUnique({
    where: { id_asignatura },
    include: {
      curso: {
        include: {
          gradoAcademico: true,
        },
      },
    },
  });

  if (!asignatura || !asignatura.curso || !asignatura.curso.gradoAcademico) {
    throw new NotFoundException(
      `No se pudo determinar el nivel educativo de la asignatura ${id_asignatura}`,
    );
  }

  return asignatura.curso.gradoAcademico.nivel_educativo;
}
```

### **Navegación de Relaciones:**

```
id_asignatura
  ↓
Asignatura
  ↓ (include curso)
Curso
  ↓ (include gradoAcademico)
Grado_Academico
  ↓
nivel_educativo (BASICA | BACHILLERATO)
```

---

## 🎯 Puntos Donde Se Usa el Nivel Educativo

### **1. En `calcularNotaMensual()` (Línea 302)**

**Propósito:** Seleccionar la estrategia de cálculo correcta

```typescript
// Obtener el nivel educativo para seleccionar la estrategia
const nivelEducativo = await this.obtenerNivelEducativo(dto.id_asignatura);
const strategy = this.strategies.get(nivelEducativo);

if (!strategy) {
  throw new BadRequestException(
    `No se encontró estrategia de evaluación para el nivel: ${nivelEducativo}`,
  );
}
```

**Resultado:**

- Si es **BASICA** → Usa `BasicaEvaluacionStrategy`
- Si es **BACHILLERATO** → Usa `BachilleratoEvaluacionStrategy`

---

### **2. En `formatearNotaMensualPorNivel()` (Línea 72)**

**Propósito:** Formatear la respuesta según el nivel educativo

```typescript
const nivelEducativo = await this.obtenerNivelEducativo(id_asignatura);

if (nivelEducativo === 'BASICA') {
  // Retorna formato simple: actividades + examen
  return {
    ...baseResponse,
    actividades: notaMensual.actividades,
    examen_mensual: notaMensual.examen_mensual,
    promedio_actividades: notaMensual.promedio_puro_actividades,
  };
} else {
  // Retorna formato desglosado por categorías (6 componentes)
  // Agrupa actividades por categoria_bachillerato
}
```

---

### **3. En `obtenerConfiguracionEvaluacion()` (Línea 1859)**

**Propósito:** Devolver la configuración según el nivel

```typescript
const nivelEducativo = await this.obtenerNivelEducativo(id_asignatura);
const strategy = this.strategies.get(nivelEducativo);

if (!strategy) {
  throw new NotFoundException(
    `No se encontró configuración para el nivel: ${nivelEducativo}`,
  );
}

return strategy.obtenerConfiguracion();
```

---

## 🔧 Sistema de Estrategias (Strategy Pattern)

### **Inicialización en el Constructor:**

```typescript
constructor(
  private prisma: PrismaService,
  private basicaStrategy: BasicaEvaluacionStrategy,
  private bachilleratoStrategy: BachilleratoEvaluacionStrategy,
) {
  // Inicializar mapa de estrategias
  this.strategies = new Map<string, EvaluacionStrategy>([
    ['BASICA', this.basicaStrategy],
    ['BACHILLERATO', this.bachilleratoStrategy],
  ]);
}
```

### **Estrategias Disponibles:**

#### **BasicaEvaluacionStrategy**

- **Archivo:** `src/sistema-evaluacion/strategies/basica-strategy.service.ts`
- **Sistema:** 70% actividades + 30% examen
- **Periodos:** 3 trimestres
- **Nivel:** `NivelEducativo.BASICA`

#### **BachilleratoEvaluacionStrategy**

- **Archivo:** `src/sistema-evaluacion/strategies/bachillerato-strategy.service.ts`
- **Sistema:** 6 componentes ponderados
- **Periodos:** 4 periodos
- **Nivel:** `NivelEducativo.BACHILLERATO`

---

## ✅ Validaciones Implementadas

### **1. Validación de Actividades por Estrategia:**

```typescript
// Validar actividades según la estrategia
const validacionActividades = strategy.validarActividades(
  actividadesConCategoria,
);

if (!validacionActividades.valido) {
  throw new BadRequestException(
    `Actividades inválidas: ${validacionActividades.errores?.join(', ')}`,
  );
}
```

**Resultado:**

- **BASICA:** Valida que haya al menos 1 actividad (cualquier tipo)
- **BACHILLERATO:** Valida que haya actividades de cada categoría requerida

---

### **2. Validación de Exámenes por Estrategia:**

```typescript
// Preparar objeto de exámenes
const examenes = {
  examen_principal: dto.examen_mensual,
  examen_parcial: dto.examen_parcial,
};

// Validar exámenes según la estrategia
const validacionExamenes = strategy.validarExamenes(examenes);

if (!validacionExamenes.valido) {
  throw new BadRequestException(
    `Exámenes inválidos: ${validacionExamenes.errores?.join(', ')}`,
  );
}
```

**Resultado:**

- **BASICA:** Requiere solo `examen_mensual`
- **BACHILLERATO:** Requiere `examen_mensual` Y `examen_parcial`

---

## 🎯 Endpoint Relacionado: `/cursos/:id/nivel-educativo`

### **¿Se Usa Este Endpoint en la Lógica Interna?**

**Respuesta:** ❌ **NO** - Y **NO ES NECESARIO**

### **¿Por qué?**

El método privado `obtenerNivelEducativo()` hace EXACTAMENTE lo mismo que el endpoint público, pero más eficientemente:

| Aspecto        | Endpoint Público       | Método Privado                      |
| -------------- | ---------------------- | ----------------------------------- |
| **Entrada**    | `id_curso`             | `id_asignatura`                     |
| **Navegación** | Curso → GradoAcademico | Asignatura → Curso → GradoAcademico |
| **Salida**     | JSON con nivel         | `NivelEducativo` enum               |
| **Uso**        | Frontend               | Backend interno                     |
| **Eficiencia** | Requiere llamada HTTP  | Llamada directa a DB                |

### **Propósito del Endpoint:**

El endpoint `GET /cursos/:id/nivel-educativo` está diseñado para:

1. ✅ **Frontend:** Obtener el nivel educativo ANTES de cargar los tipos de actividad
2. ✅ **Validación:** Confirmar que un curso tiene nivel educativo definido
3. ✅ **UI Logic:** Determinar qué formulario mostrar al usuario

---

## 📊 Flujo Completo: Frontend → Backend

### **Paso 1: Frontend obtiene nivel educativo del curso**

```typescript
const response = await fetch(`/cursos/${cursoId}/nivel-educativo`);
const { nivel_educativo } = await response.json();
// nivel_educativo: "BASICA" | "BACHILLERATO"
```

### **Paso 2: Frontend carga tipos de actividad según nivel**

```typescript
const tiposResponse = await fetch(
  `/sistema-evaluacion/catalogo/tipos-actividad/${nivel_educativo}`,
);
const tiposActividad = await tiposResponse.json();
```

### **Paso 3: Usuario ingresa notas**

```typescript
// Frontend construye el payload según el nivel educativo
const payload = {
  id_alumno: alumnoId,
  id_asignatura: asignaturaId,
  actividades: [...],
  examen_mensual: 9.0,
  examen_parcial: nivel_educativo === 'BACHILLERATO' ? 8.5 : undefined,
  // ...otros campos
};
```

### **Paso 4: Backend procesa con estrategia correcta**

```typescript
// Backend INTERNAMENTE obtiene el nivel educativo de nuevo
const nivelEducativo = await this.obtenerNivelEducativo(dto.id_asignatura);

// Backend selecciona estrategia automáticamente
const strategy = this.strategies.get(nivelEducativo);

// Backend valida y calcula según la estrategia
const resultado = strategy.calcularNotaPeriodo(actividades, examenes);
```

---

## 🔒 Seguridad y Validación

### **Doble Validación (Frontend + Backend):**

1. **Frontend valida:** Usando el nivel educativo del endpoint público
   - Muestra campos correctos
   - Valida requisitos antes de enviar

2. **Backend valida:** Usando el nivel educativo interno
   - No confía en lo que envía el frontend
   - Re-obtiene el nivel educativo de la base de datos
   - Aplica estrategia correcta independientemente del cliente

**Ventaja:** Aunque el frontend se equivoque o sea manipulado, el backend siempre usa el nivel educativo correcto.

---

## ✅ Conclusiones

### **Implementación CORRECTA:**

1. ✅ **Nivel educativo se obtiene dinámicamente** de la base de datos
2. ✅ **Estrategia se selecciona automáticamente** según el nivel
3. ✅ **Validaciones son específicas** para cada nivel educativo
4. ✅ **Cálculos son correctos** según el sistema de cada nivel
5. ✅ **Doble validación** (frontend para UX, backend para seguridad)

### **Flujo de Datos CORRECTO:**

```
Grado_Academico.nivel_educativo (Base de Datos)
  ↓
obtenerNivelEducativo() (Método Privado)
  ↓
Strategy Pattern (Selección Automática)
  ↓
BasicaEvaluacionStrategy | BachilleratoEvaluacionStrategy
  ↓
Cálculos y Validaciones Específicas
```

### **Endpoint Público:**

El endpoint `GET /cursos/:id/nivel-educativo` es:

- ✅ **Útil para el frontend** (obtener nivel antes de cargar formulario)
- ✅ **Complementario** (no reemplaza la lógica interna)
- ✅ **Seguro** (protegido con JWT)
- ✅ **Bien implementado** (devuelve la información correcta)

---

## 🚀 Recomendaciones

### **✅ NINGUNA CORRECCIÓN NECESARIA**

La implementación actual es correcta y sigue las mejores prácticas:

1. **Separation of Concerns:** Backend no confía en el frontend
2. **Strategy Pattern:** Código extensible y mantenible
3. **Type Safety:** Uso de enums de TypeScript/Prisma
4. **Validaciones Robustas:** Cada estrategia valida sus propios requisitos
5. **DRY (Don't Repeat Yourself):** Lógica centralizada en las estrategias

### **Mejoras Opcionales (No Urgentes):**

1. **Cache:** Podría cachear el resultado de `obtenerNivelEducativo()` si se llama múltiples veces con el mismo ID
2. **Logging:** Agregar logs cuando se selecciona una estrategia
3. **Métricas:** Rastrear uso de cada estrategia para análisis

---

## 📚 Archivos Relacionados

| Archivo                                       | Propósito                        | Estado      |
| --------------------------------------------- | -------------------------------- | ----------- |
| `sistema-evaluacion.service.ts` (línea 39-62) | Método `obtenerNivelEducativo()` | ✅ Correcto |
| `sistema-evaluacion.service.ts` (línea 302)   | Uso en `calcularNotaMensual()`   | ✅ Correcto |
| `sistema-evaluacion.service.ts` (línea 72)    | Uso en formateo de respuesta     | ✅ Correcto |
| `sistema-evaluacion.service.ts` (línea 1859)  | Uso en configuración             | ✅ Correcto |
| `basica-strategy.service.ts`                  | Estrategia para BÁSICA           | ✅ Correcto |
| `bachillerato-strategy.service.ts`            | Estrategia para BACHILLERATO     | ✅ Correcto |
| `cursos.service.ts` (línea 447-479)           | Endpoint público nivel educativo | ✅ Correcto |
| `cursos.controller.ts` (línea 148-180)        | Endpoint público nivel educativo | ✅ Correcto |

---

## 🎉 Resultado Final

**✅ EL SISTEMA ESTÁ CORRECTAMENTE IMPLEMENTADO**

El backend usa inteligentemente el `nivel_educativo` del `Grado_Academico` (a través de la navegación Asignatura → Curso → Grado) para:

1. Seleccionar la estrategia de cálculo correcta
2. Aplicar validaciones específicas
3. Formatear respuestas apropiadas
4. Garantizar consistencia de datos

El endpoint público `/cursos/:id/nivel-educativo` complementa esta lógica proporcionando al frontend la información necesaria para construir la UI correcta, pero **el backend SIEMPRE valida internamente** sin depender del cliente.

**No se requieren cambios en la implementación actual.**
