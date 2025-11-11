# Sistema de Seeds Modular

Este directorio contiene el sistema de seeds modular para la base de datos CAI.

## � Comandos Prisma Importantes

### Flujo completo (después de cambios en schema.prisma):

```bash
# 1. Crear migración (crea SQL basado en cambios en schema.prisma)
npx prisma migrate dev --name nombre_descriptivo

# 2. Generar cliente Prisma (actualiza tipos TypeScript)
npx prisma generate

# 3. Ejecutar seeds (poblar datos de prueba)
npm run prisma:seed
# o
npx prisma db seed
```

### Comandos de desarrollo:

```bash
# Ver la base de datos en navegador
npx prisma studio

# Reset completo (borra todo, aplica migraciones y ejecuta seeds)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes (producción)
npx prisma migrate deploy
```

### Comandos útiles del proyecto:

```bash
npm run prisma:seed     # Ejecutar seeds
npm run prisma:reset    # Reset completo
npm run prisma:studio   # Abrir Prisma Studio
```

## �📁 Estructura

```
prisma/seed/
├── index.ts                          # Orquestador principal
├── seeds/                            # Seeds individuales
│   ├── 01-cargos.seed.ts            # Cargos administrativos
│   ├── 02-usuarios.seed.ts          # Usuarios (Admin, P.A, Orientador)
│   ├── 03-jornadas.seed.ts          # Jornadas escolares
│   ├── 04-grados-academicos.seed.ts # Grados académicos
│   ├── 05-parentescos.seed.ts       # Tipos de parentesco
│   ├── 06-catalogos-evaluacion.seed.ts # Catálogos de evaluación
│   ├── 07-infracciones.seed.ts      # Catálogo de infracciones
│   ├── 08-cursos-asignaturas.seed.ts # Cursos y asignaturas
│   └── 09-alumnos-inscripciones.seed.ts # Alumnos e inscripciones
└── seed.ts                          # Archivo legacy (deprecado)
```

## 🚀 Uso

### Ejecutar todos los seeds

```bash
npm run prisma:seed
# o
npx prisma db seed
```

### Habilitar/Deshabilitar seeds específicos

Edita el archivo `index.ts` y modifica `SEED_CONFIG`:

```typescript
const SEED_CONFIG = {
  cargos: true, // ✅ Ejecutar
  usuarios: true, // ✅ Ejecutar
  jornadas: true, // ✅ Ejecutar
  gradosAcademicos: true, // ✅ Ejecutar
  parentescos: true, // ✅ Ejecutar
  catalogosEvaluacion: true, // ✅ Ejecutar
  infracciones: true, // ✅ Ejecutar
  cursosAsignaturas: false, // ❌ No ejecutar
  alumnosInscripciones: false, // ❌ No ejecutar
};
```

## 📝 Orden de ejecución

Los seeds se ejecutan en el siguiente orden (respetando dependencias):

1. **Cargos** → Base para usuarios
2. **Usuarios** → Admin, P.A, Orientador
3. **Jornadas** → Requerido para grados
4. **Grados Académicos** → Requerido para cursos
5. **Parentescos** → Catálogo de relaciones
6. **Catálogos de Evaluación** → Métodos, tipos y sistemas
7. **Infracciones** → Catálogo de conducta
8. **Cursos y Asignaturas** → Estructura académica
9. **Alumnos e Inscripciones** → Datos de prueba

## ✨ Características

- ✅ **Modular**: Cada seed es independiente y reutilizable
- ✅ **Idempotente**: Se pueden ejecutar múltiples veces sin duplicar datos
- ✅ **Configurable**: Habilita/deshabilita seeds según necesidad
- ✅ **Tipado**: Usa TypeScript para seguridad de tipos
- ✅ **Feedback**: Mensajes claros de progreso y errores
- ✅ **Dependencias**: Respeta el orden de ejecución

## 🔧 Crear un nuevo seed

1. Crea un archivo en `seeds/` con el formato `NN-nombre.seed.ts`
2. Exporta una función async que reciba `PrismaClient`
3. Importa y ejecuta en `index.ts`

### Ejemplo:

```typescript
// seeds/10-mi-nuevo-seed.seed.ts
import { PrismaClient } from '@prisma/client';

export async function seedMiNuevoModulo(prisma: PrismaClient) {
  console.log('🔹 Seeding: Mi Nuevo Módulo...');

  // Tu lógica aquí

  console.log('✅ Mi Nuevo Módulo OK');
}
```

Luego en `index.ts`:

```typescript
import { seedMiNuevoModulo } from './seeds/10-mi-nuevo-seed.seed';

const SEED_CONFIG = {
  // ... otros seeds
  miNuevoModulo: true,
};

// En la función main()
if (SEED_CONFIG.miNuevoModulo) {
  await seedMiNuevoModulo(prisma);
}
```

## 🗑️ Limpiar y re-seed

```bash
# Reset completo de la base de datos (CUIDADO: Borra todos los datos)
npx prisma migrate reset
# Esto ejecutará automáticamente:
# 1. DROP de todas las tablas
# 2. Aplicación de todas las migraciones
# 3. Ejecución automática de seeds

# Solo ejecutar seeds (sin borrar datos)
npm run prisma:seed
# o
npx prisma db seed
```

## 🔄 Workflow típico de desarrollo

```bash
# 1. Modificas schema.prisma
# 2. Creas migración
npx prisma migrate dev --name agregar_campo_X

# 3. Si todo está bien, los seeds se ejecutan automáticamente
# 4. Si no, ejecuta manualmente:
npm run prisma:seed

# 5. Ver cambios en Prisma Studio
npx prisma studio
```

## 📊 Datos de prueba incluidos

- **Usuarios**: 3 usuarios (Admin, P.A, Orientador)
- **Cursos**: 1 curso (Quinto Grado A)
- **Asignaturas**: 2 asignaturas (Matemática, Lenguaje)
- **Alumnos**: 10 alumnos de prueba
- **Infracciones**: 18 tipos de infracciones
- **Catálogos**: Métodos, tipos y sistemas de evaluación

## ⚠️ Importante

- El seed usa `upsert` para evitar duplicados
- Los passwords de prueba están hasheados con bcrypt
- Los seeds están diseñados para desarrollo, no producción
- **Después de `migrate dev`**: Los seeds se ejecutan automáticamente
- **Después de `migrate reset`**: Los seeds se ejecutan automáticamente
- Para **solo ejecutar seeds**: Usa `npm run prisma:seed`

## 📚 Referencia Rápida de Comandos

| Comando                           | Descripción                               |
| --------------------------------- | ----------------------------------------- |
| `npx prisma migrate dev --name X` | Crear nueva migración con nombre X        |
| `npx prisma generate`             | Generar cliente Prisma (actualizar tipos) |
| `npx prisma db seed`              | Ejecutar seeds manualmente                |
| `npx prisma migrate reset`        | Borrar todo, migrar y seed                |
| `npx prisma studio`               | Abrir interfaz visual de la BD            |
| `npx prisma migrate status`       | Ver estado de migraciones                 |
| `npx prisma migrate deploy`       | Aplicar migraciones (producción)          |
| `npm run prisma:seed`             | Alias para ejecutar seeds                 |
| `npm run prisma:reset`            | Alias para reset completo                 |
| `npm run prisma:studio`           | Alias para abrir studio                   |

## 🆘 Troubleshooting

### Error: "Already exists in the database"

```bash
# La migración ya está aplicada, genera el cliente:
npx prisma generate
```

### Error: "Schema and database are out of sync"

```bash
# Reset y volver a empezar:
npx prisma migrate reset
```

### Seeds no se ejecutan automáticamente

```bash
# Ejecutar manualmente:
npm run prisma:seed
```

### Cambios en schema no se reflejan en código

```bash
# Regenerar cliente Prisma:
npx prisma generate
```
