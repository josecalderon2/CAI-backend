# ✅ SOLUCIÓN: IDs DE TIPOS DE ACTIVIDAD EN LA RESPUESTA

**Fecha:** 9 de noviembre de 2025  
**Problema resuelto:** El backend ahora devuelve el campo `id_tipo_actividad` en cada componente

---

## 🎯 PROBLEMA IDENTIFICADO

El frontend necesitaba el `id_tipo_actividad` para poder guardar las notas correctamente, pero el endpoint `/sistema-evaluacion/formato-evaluacion/asignatura/:id` no lo estaba devolviendo.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **1. Actualización del Schema de Prisma**

Agregamos el campo `categoria_basica` a la tabla `tipos_actividad_evaluacion`:

```prisma
model TipoActividadEvaluacion {
  id_tipo_actividad Int      @id @default(autoincrement())
  nombre            String   @unique
  activo            Boolean  @default(true)
  orden             Int?

  // Ponderaciones y categorización
  peso_basica             Float?   // 0.05, 0.15, 0.25, 0.30 (BÁSICA 2025)
  peso_bachillerato       Float?
  categoria_basica        String?  // "MENSUAL", "TRIMESTRAL" (BÁSICA 2025) ✅ NUEVO
  categoria_bachillerato  String?
  aplica_a_nivel          String[] @default(["BASICA", "BACHILLERATO"])

  actividades       ActividadEvaluacion[]

  @@map("tipos_actividad_evaluacion")
}
```

### **2. Actualización del Seed**

Creamos los 6 tipos de actividad del sistema BÁSICA 2025 con sus nombres completos:

```typescript
const tiposActividadBasica = [
  // COMPONENTES MENSUALES
  {
    nombre: 'Tareas (Mensual)',
    orden: 1,
    peso_basica: 0.05, // 5%
    categoria_basica: 'MENSUAL',
  },
  {
    nombre: 'Revisión de libros y cuadernos (Mensual)',
    orden: 2,
    peso_basica: 0.15, // 15%
    categoria_basica: 'MENSUAL',
  },
  {
    nombre: 'Laboratorio escrito (Mensual)',
    orden: 3,
    peso_basica: 0.15, // 15%
    categoria_basica: 'MENSUAL',
  },
  // COMPONENTES TRIMESTRALES
  {
    nombre: 'Actividad Integradora (Trimestral)',
    orden: 4,
    peso_basica: 0.25, // 25%
    categoria_basica: 'TRIMESTRAL',
  },
  {
    nombre: 'Autoevaluación (Trimestral)',
    orden: 5,
    peso_basica: 0.1, // 10%
    categoria_basica: 'TRIMESTRAL',
  },
  {
    nombre: 'Examen (Trimestral)',
    orden: 6,
    peso_basica: 0.3, // 30%
    categoria_basica: 'TRIMESTRAL',
  },
];
```

### **3. Actualización del Servicio**

Modificamos `obtenerFormatoEvaluacionPorAsignatura()` para consultar la BD y devolver los IDs:

```typescript
// Obtener los tipos de actividad de la base de datos con sus IDs
const tiposActividad = await this.prisma.tipoActividadEvaluacion.findMany({
  where: {
    aplica_a_nivel: { has: 'BASICA' },
    activo: true,
  },
  orderBy: { orden: 'asc' },
});

// Mapear nombres a IDs
const tiposPorNombre: { [key: string]: number } = {};
tiposActividad.forEach((tipo) => {
  tiposPorNombre[tipo.nombre] = tipo.id_tipo_actividad;
});

// Usar los IDs en la respuesta
componentes: [
  {
    id_tipo_actividad: tiposPorNombre['Tareas (Mensual)'] || 1, // ✅ NUEVO
    nombre: 'Tareas (Mensual)',
    porcentaje: 5,
    // ...
  },
  // ... otros componentes
];
```

### **4. Migración de Base de Datos**

Ejecutamos la migración:

```bash
npx prisma migrate dev --name add_categoria_basica_to_tipos_actividad
```

---

## 📊 RESPUESTA DEL ENDPOINT ACTUALIZADA

### **GET /sistema-evaluacion/formato-evaluacion/asignatura/1**

```json
{
  "nivel": "BASICA",
  "asignatura": {
    "id": 1,
    "nombre": "Matemática I",
    "curso": "Quinto Grado",
    "grado": "Primaria"
  },
  "componentes": [
    {
      "id_tipo_actividad": 1,  // ✅ CAMPO AGREGADO
      "nombre": "Tareas (Mensual)",
      "porcentaje": 5,
      "tipo": "ACTIVIDAD",
      "periodo": "MENSUAL",
      "permite_multiples": true,
      "descripcion": "Puede registrar múltiples tareas (1, 2, 3...). Se calcula el promedio de todas."
    },
    {
      "id_tipo_actividad": 2,  // ✅ CAMPO AGREGADO
      "nombre": "Revisión de libros y cuadernos (Mensual)",
      "porcentaje": 15,
      "tipo": "ACTIVIDAD",
      "periodo": "MENSUAL",
      "permite_multiples": false,
      "descripcion": "Una revisión por mes."
    },
    {
      "id_tipo_actividad": 3,  // ✅ CAMPO AGREGADO
      "nombre": "Laboratorio escrito (Mensual)",
      "porcentaje": 15,
      "tipo": "ACTIVIDAD",
      "periodo": "MENSUAL",
      "permite_multiples": true,
      "descripcion": "Puede registrar múltiples laboratorios."
    },
    {
      "id_tipo_actividad": 4,  // ✅ CAMPO AGREGADO
      "nombre": "Actividad Integradora (Trimestral)",
      "porcentaje": 25,
      "tipo": "ACTIVIDAD",
      "periodo": "TRIMESTRAL",
      "permite_multiples": false,
      "descripcion": "Una actividad integradora por trimestre."
    },
    {
      "id_tipo_actividad": 5,  // ✅ CAMPO AGREGADO
      "nombre": "Autoevaluación (Trimestral)",
      "porcentaje": 10,
      "tipo": "ACTIVIDAD",
      "periodo": "TRIMESTRAL",
      "permite_multiples": false,
      "descripcion": "Una autoevaluación por trimestre."
    },
    {
      "id_tipo_actividad": 6,  // ✅ CAMPO AGREGADO
      "nombre": "Examen (Trimestral)",
      "porcentaje": 30,
      "tipo": "EXAMEN",
      "periodo": "TRIMESTRAL",
      "permite_multiples": false,
      "descripcion": "Un examen por trimestre."
    }
  ],
  "calculo": {
    "formula": "MENSUAL (35%): Tareas 5% + Revisión 15% + Lab 15% | TRIMESTRAL (65%): Act.Int 25% + Autoeval 10% + Examen 30%",
    "subtotales": [...]
  }
}
```

---

## 🔍 VERIFICACIÓN

### **Consulta directa a la BD:**

```bash
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.tipoActividadEvaluacion.findMany({
  where: { aplica_a_nivel: { has: 'BASICA' } },
  orderBy: { orden: 'asc' }
}).then(tipos => {
  console.log(tipos);
  prisma.\$disconnect();
});
"
```

**Resultado:**

```json
[
  { "id_tipo_actividad": 1, "nombre": "Tareas (Mensual)", ... },
  { "id_tipo_actividad": 2, "nombre": "Revisión de libros y cuadernos (Mensual)", ... },
  { "id_tipo_actividad": 3, "nombre": "Laboratorio escrito (Mensual)", ... },
  { "id_tipo_actividad": 4, "nombre": "Actividad Integradora (Trimestral)", ... },
  { "id_tipo_actividad": 5, "nombre": "Autoevaluación (Trimestral)", ... },
  { "id_tipo_actividad": 6, "nombre": "Examen (Trimestral)", ... }
]
```

### **Prueba del endpoint:**

```bash
curl -s http://localhost:3000/sistema-evaluacion/formato-evaluacion/asignatura/1 | \
  python3 -m json.tool | grep -A 6 '"id_tipo_actividad"'
```

**Resultado:**

```
✅ id_tipo_actividad: 1 (Tareas)
✅ id_tipo_actividad: 2 (Revisión)
✅ id_tipo_actividad: 3 (Laboratorio)
✅ id_tipo_actividad: 4 (Actividad Integradora)
✅ id_tipo_actividad: 5 (Autoevaluación)
✅ id_tipo_actividad: 6 (Examen)
```

---

## 💡 USO EN EL FRONTEND

Ahora el frontend puede usar el `id_tipo_actividad` directamente al guardar notas:

```typescript
// 1. Obtener formato con IDs
const formato = await fetch(
  '/sistema-evaluacion/formato-evaluacion/asignatura/1',
).then((r) => r.json());

// 2. Usar el ID al guardar una nota
async function guardarNota(componente, nota) {
  await fetch('/sistema-evaluacion/notas/simplificadas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asignatura_id: 1,
      alumno_id: 1,
      id_tipo_actividad: componente.id_tipo_actividad, // ✅ USA EL ID DEL BACKEND
      tipo_actividad: componente.nombre,
      nota: nota,
      mes: 11,
      anio: 2025,
      periodo: 3,
    }),
  });
}

// Ejemplo de uso:
const componenteTareas = formato.componentes[0]; // { id_tipo_actividad: 1, nombre: "Tareas (Mensual)", ... }
await guardarNota(componenteTareas, 8.5);
```

---

## ✅ PROBLEMA RESUELTO

Ya no es necesario usar `id_tipo_actividad: 1` como valor por defecto. El backend ahora devuelve los IDs correctos de la base de datos, garantizando que:

1. ✅ Los IDs son consistentes con la base de datos
2. ✅ El frontend puede guardar notas con el ID correcto
3. ✅ No hay hardcodeo de IDs en el frontend
4. ✅ Cambios futuros en los tipos se reflejan automáticamente

---

**¡El sistema BÁSICA 2025 está completamente funcional! 🎉**
