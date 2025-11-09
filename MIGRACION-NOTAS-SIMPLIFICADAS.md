# 🔄 Migración de Funcionalidad: notas-mensuales → sistema-evaluacion

**Fecha:** 8 de noviembre de 2025  
**Motivo:** Consolidar funcionalidad en un solo módulo con todas las capacidades

---

## 📋 Resumen Ejecutivo

Se ha migrado la **interfaz simplificada** del módulo `notas-mensuales` al módulo `sistema-evaluacion`, agregando **3 nuevos endpoints** que usan formato numérico (mes: 1-12, año: 2025) en lugar de strings.

### ✅ Resultado:

- El módulo `sistema-evaluacion` ahora tiene **DOS interfaces**:
  1. **Estándar** (strings): Para uso interno y avanzado
  2. **Simplificada** (números): Para frontend y uso fácil

---

## 🎯 Propósito del Módulo `notas-mensuales`

El módulo `notas-mensuales` tenía un propósito específico:

### **Interfaz User-Friendly para el Frontend:**

| Aspecto         | notas-mensuales | sistema-evaluacion (original) |
| --------------- | --------------- | ----------------------------- |
| **Mes**         | Número (2)      | String ("Febrero")            |
| **Año**         | Número (2025)   | String ("2025")               |
| **Trimestre**   | Auto-calculado  | Manual                        |
| **Actividades** | ❌ No guardaba  | ✅ Guarda todas               |
| **Niveles**     | Solo BÁSICA     | BÁSICA + BACHILLERATO         |

### **Ventaja del formato numérico:**

```typescript
// ✅ FÁCIL: Frontend usa números directamente
const payload = {
  mes_numerico: new Date().getMonth() + 1, // 2
  anio: new Date().getFullYear(), // 2025
};

// ❌ COMPLICADO: Frontend tenía que convertir
const payload = {
  mes: meses[new Date().getMonth()], // "Febrero"
  anio_academico: new Date().getFullYear().toString(), // "2025"
};
```

---

## ✨ Nueva Funcionalidad en `sistema-evaluacion`

### **3 Nuevos Endpoints Agregados:**

| Método | Endpoint                                      | Propósito                                |
| ------ | --------------------------------------------- | ---------------------------------------- |
| `POST` | `/sistema-evaluacion/nota-mensual/simple`     | Crear nota con formato numérico          |
| `GET`  | `/sistema-evaluacion/notas-mensuales/simple`  | Consultar notas con filtros numéricos    |
| `GET`  | `/sistema-evaluacion/nota-mensual/simple/:id` | Obtener nota por ID con formato numérico |

---

## 📝 Nuevos DTOs Creados

### **1. `CrearNotaSimpleDto`**

```typescript
{
  id_alumno: number;           // 1
  id_asignatura: number;       // 2
  mes_numerico: number;        // 2 (Febrero)
  anio: number;                // 2025
  trimestre: number;           // 1 (auto-calculado si no se envía)
  actividades: [
    {
      id_tipo_actividad: number;
      numero_actividad?: number;
      nota: number;
    }
  ];
  examen_mensual: number;
  examen_parcial?: number;     // Solo para Bachillerato
}
```

### **2. `ConsultarNotasSimpleDto`**

```typescript
{
  id_alumno?: number;
  id_asignatura?: number;
  mes_numerico?: number;      // 1-12
  trimestre?: number;         // 1-4
  anio?: number;              // 2025
}
```

---

## 🔧 Métodos Agregados al Service

### **1. Conversión de Formatos:**

```typescript
// Privados - para uso interno
private convertirMesNumericoANombre(mesNumerico: number): string
private convertirNombreMesANumerico(nombreMes: string): number
private calcularTrimestrePorMes(mesNumerico: number): number
```

### **2. Endpoints Públicos:**

```typescript
// Públicos - para uso desde el controller
async crearNotaSimplificada(dto: CrearNotaSimpleDto)
async consultarNotasSimplificadas(filtros: ConsultarNotasSimpleDto)
async obtenerNotaSimplificadaPorId(id_nota_mensual: number)
```

---

## 📊 Comparación: Antes vs Después

### **ANTES: Dos módulos separados**

```typescript
// notas-mensuales (obsoleto)
POST /notas-mensuales
{
  "mes": 2,
  "anio": 2025,
  "tarea_1": 8.5,
  "tarea_2": 7.5
  // ❌ No guarda actividades individuales
}

// sistema-evaluacion (completo pero complejo)
POST /sistema-evaluacion/nota-mensual
{
  "mes": "Febrero",
  "anio_academico": "2025",
  "actividades": [...]
  // ✅ Guarda actividades pero usa strings
}
```

### **DESPUÉS: Un solo módulo con ambas interfaces**

```typescript
// Interfaz simplificada (NUEVO)
POST /sistema-evaluacion/nota-mensual/simple
{
  "mes_numerico": 2,
  "anio": 2025,
  "actividades": [...]
  // ✅ Guarda actividades Y usa números
}

// Interfaz estándar (ya existía)
POST /sistema-evaluacion/nota-mensual
{
  "mes": "Febrero",
  "anio_academico": "2025",
  "actividades": [...]
  // ✅ Guarda actividades (interno)
}
```

---

## 🎯 Ventajas de la Migración

### **1. Consolidación:**

- ✅ Todo en un solo módulo
- ✅ Un solo sistema de estrategias (BÁSICA/BACHILLERATO)
- ✅ Una sola base de datos

### **2. Funcionalidad Completa:**

- ✅ Guarda actividades individuales
- ✅ Soporta BÁSICA y BACHILLERATO
- ✅ Usa Strategy Pattern correcto
- ✅ Validaciones por nivel educativo

### **3. Interfaz Amigable:**

- ✅ Formato numérico para frontend
- ✅ Cálculo automático de trimestre
- ✅ Conversión automática interna

### **4. Mantenibilidad:**

- ✅ Un solo lugar para actualizar lógica
- ✅ Reutiliza código existente
- ✅ No duplica funcionalidad

---

## 📖 Ejemplos de Uso

### **Ejemplo 1: Crear Nota (BÁSICA)**

```typescript
POST /sistema-evaluacion/nota-mensual/simple

{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes_numerico": 2,      // Febrero
  "trimestre": 1,         // Opcional: se calcula automático
  "anio": 2025,
  "actividades": [
    { "id_tipo_actividad": 1, "numero_actividad": 1, "nota": 8.5 },  // Tarea 1
    { "id_tipo_actividad": 2, "numero_actividad": null, "nota": 9.0 }, // Revisión
    { "id_tipo_actividad": 1, "numero_actividad": 2, "nota": 7.5 },  // Tarea 2
    { "id_tipo_actividad": 3, "numero_actividad": null, "nota": 8.0 }  // Lab
  ],
  "examen_mensual": 9.0
}
```

**Respuesta:**

```json
{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes": "Febrero",
  "mes_numerico": 2,
  "anio": 2025,
  "trimestre": 1,
  "actividades": [
    {
      "id_tipo_actividad": 1,
      "tipo_actividad_nombre": "Tarea",
      "numero_actividad": 1,
      "nombre_completo": "Tarea 1",
      "nota": 8.5
    }
    // ... más actividades
  ],
  "examen_mensual": 9.0,
  "promedio_puro_actividades": 8.25,
  "nota_mensual": 8.475,
  "aporte_al_trimestre": 2.37
}
```

---

### **Ejemplo 2: Consultar Notas de un Alumno**

```typescript
GET /sistema-evaluacion/notas-mensuales/simple?id_alumno=1&anio=2025
```

**Respuesta:**

```json
[
  {
    "id_nota_mensual": 1,
    "id_alumno": 1,
    "id_asignatura": 2,
    "alumno": {
      "nombre": "Juan",
      "apellido": "Pérez"
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
      }
      // ... más actividades
    ],
    "examen_mensual": 9.0,
    "nota_mensual": 8.475,
    "fecha_registro": "2025-11-08T10:30:00.000Z"
  }
]
```

---

### **Ejemplo 3: Filtrar por Mes y Asignatura**

```typescript
GET /sistema-evaluacion/notas-mensuales/simple?id_asignatura=2&mes_numerico=2&anio=2025
```

---

## 🔄 Flujo Interno

```
Frontend envía:
  mes_numerico: 2
  anio: 2025
         ↓
convertirMesNumericoANombre(2)
         ↓
  mes: "Febrero"
  anio_academico: "2025"
         ↓
calcularNotaMensual() (método existente)
         ↓
Guarda en base de datos
         ↓
Convierte respuesta a formato numérico
         ↓
Frontend recibe:
  mes_numerico: 2
  mes_nombre: "Febrero"
  anio: 2025
```

---

## 📚 Archivos Modificados/Creados

### **Nuevos Archivos:**

1. `src/sistema-evaluacion/dto/crear-nota-simple.dto.ts`
2. `src/sistema-evaluacion/dto/consultar-notas-simple.dto.ts`

### **Archivos Modificados:**

1. `src/sistema-evaluacion/dto/index.ts` - Export nuevos DTOs
2. `src/sistema-evaluacion/sistema-evaluacion.service.ts` - 3 nuevos métodos + helpers
3. `src/sistema-evaluacion/sistema-evaluacion.controller.ts` - 3 nuevos endpoints

---

## ⚠️ Módulo `notas-mensuales` - Estado Actual

El módulo `notas-mensuales` puede considerarse **OBSOLETO** porque:

1. ❌ No guarda actividades individuales
2. ❌ Solo soporta BÁSICA (70/30)
3. ❌ No usa Strategy Pattern
4. ❌ Funcionalidad duplicada

### **Opciones:**

**Opción A: Mantener como legacy (recomendado a corto plazo)**

- Dejarlo para compatibilidad
- Marcar como deprecated en Swagger
- No agregar nuevas features

**Opción B: Eliminar completamente**

- Eliminar el módulo
- Redirigir rutas a nuevos endpoints
- Actualizar frontend

**Opción C: Wrapper sobre sistema-evaluacion**

- Mantener rutas existentes
- Internamente llamar a endpoints simplificados
- Transparente para clientes legacy

---

## 🚀 Recomendación para el Frontend

### **Usar los Nuevos Endpoints Simplificados:**

```typescript
// ✅ USAR ESTO
const response = await fetch('/sistema-evaluacion/nota-mensual/simple', {
  method: 'POST',
  body: JSON.stringify({
    id_alumno: 1,
    id_asignatura: 2,
    mes_numerico: 2,      // ✅ Número
    anio: 2025,           // ✅ Número
    actividades: [...],
    examen_mensual: 9.0
  })
});

// ❌ NO USAR ESTO (obsoleto)
const response = await fetch('/notas-mensuales', {
  method: 'POST',
  body: JSON.stringify({
    mes: 2,
    anio: 2025,
    tarea_1: 8.5  // ❌ No guarda actividades individuales
  })
});
```

---

## 📊 Tabla de Migración de Endpoints

| Endpoint Obsoleto            | Nuevo Endpoint                                            | Estado           |
| ---------------------------- | --------------------------------------------------------- | ---------------- |
| `POST /notas-mensuales`      | `POST /sistema-evaluacion/nota-mensual/simple`            | ✅ Migrado       |
| `PATCH /notas-mensuales/:id` | `PATCH /sistema-evaluacion/nota-mensual/:id` + conversión | ⚠️ Usar estándar |
| `GET /notas-mensuales`       | `GET /sistema-evaluacion/notas-mensuales/simple`          | ✅ Migrado       |
| `GET /notas-mensuales/:id`   | `GET /sistema-evaluacion/nota-mensual/simple/:id`         | ✅ Migrado       |

---

## ✅ Checklist de Migración

### **Backend:**

- [x] Crear DTOs simplificados
- [x] Agregar métodos de conversión al service
- [x] Agregar métodos simplificados al service
- [x] Agregar endpoints al controller
- [x] Exportar nuevos DTOs
- [x] Documentar con Swagger

### **Frontend (Pendiente):**

- [ ] Actualizar llamadas API a nuevos endpoints
- [ ] Usar formato numérico (mes: 1-12, anio: 2025)
- [ ] Probar creación de notas
- [ ] Probar consultas con filtros
- [ ] Verificar que se guardan actividades

### **Testing (Pendiente):**

- [ ] Crear tests unitarios para nuevos métodos
- [ ] Crear tests de integración para nuevos endpoints
- [ ] Verificar conversión de formatos
- [ ] Probar cálculo automático de trimestre

### **Documentación (Completado):**

- [x] Documento de migración (este archivo)
- [x] Actualizar ACLARACION-GUARDADO-ACTIVIDADES.md
- [x] Swagger documentation en endpoints

---

## 🎉 Resultado Final

El módulo `sistema-evaluacion` ahora ofrece:

1. ✅ **Interfaz Completa:** Para uso avanzado con todos los detalles
2. ✅ **Interfaz Simplificada:** Para frontend con formato numérico
3. ✅ **Guardado Completo:** Todas las actividades se guardan
4. ✅ **Dual Nivel:** Soporta BÁSICA y BACHILLERATO
5. ✅ **Strategy Pattern:** Cálculos correctos por nivel
6. ✅ **User-Friendly:** Formato numérico fácil de usar

**El sistema está listo para que el frontend use los nuevos endpoints simplificados.** 🚀
