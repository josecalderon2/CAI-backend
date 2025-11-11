# Guía de Scripts - Sistema de Calificaciones

## Scripts para BÁSICA (1° a 9° grado)

### 1 Generar Evaluaciones

```bash
npx ts-node scripts/generar-evaluaciones-documento.ts
```

**¿Qué hace?** Crea 72 evaluaciones (36 por cada asignatura) según el documento oficial.

---

### 2 Ingresar Notas de Ejemplo

```bash
npx ts-node scripts/setup-notas-ejemplo-completo.ts
```

**¿Qué hace?** Limpia todo y pone las notas exactas del documento para el alumno 4.

**Resultado esperado:** Promedio = **8.813**

---

## 🎓 Scripts para BACHILLERATO

### 1 Crear Alumnos

```bash
npx ts-node scripts/crear-alumnos-bachillerato.ts
```

**¿Qué hace?** Crea 3 alumnos de prueba (Carlos, María, José) en Primer Año de Bachillerato.

---

### 2 Generar Evaluaciones

```bash
npx ts-node scripts/generar-evaluaciones-bachillerato.ts
```

**¿Qué hace?** Crea 24 evaluaciones (6 por cada periodo × 4 periodos).

---

### 3 Ingresar Notas de Ejemplo

```bash
npx ts-node scripts/ingresar-notas-bachillerato.ts
```

**¿Qué hace?** Pone las notas exactas del documento para el alumno Carlos Martínez (ID: 11).

**Resultado esperado:** Promedio = **8.28**

---

### 4 Consultar Información (Opcional)

```bash
npx ts-node scripts/consultar-bachillerato.ts
```

**¿Qué hace?** Muestra cursos, asignaturas, alumnos y evaluaciones de Bachillerato.

---

## Cómo Usar (Paso a Paso)

### Para BÁSICA:

```bash
# 1. Generar evaluaciones
npx ts-node scripts/generar-evaluaciones-documento.ts

# 2. Ingresar notas
npx ts-node scripts/setup-notas-ejemplo-completo.ts

# 3. Iniciar servidor
npm run start:dev

# 4. Probar (en test-promedios.http)
POST /promedios/recalcular/4?anioAcademico=2025
GET /promedios/alumno/4?anioAcademico=2025
```

### Para BACHILLERATO:

```bash
# 1. Crear alumnos
npx ts-node scripts/crear-alumnos-bachillerato.ts

# 2. Generar evaluaciones
npx ts-node scripts/generar-evaluaciones-bachillerato.ts

# 3. Ingresar notas
npx ts-node scripts/ingresar-notas-bachillerato.ts

# 4. Iniciar servidor
npm run start:dev

# 5. Probar (en test-promedios.http)
POST /promedios/recalcular/11?anioAcademico=2025
GET /promedios/alumno/11?anioAcademico=2025
```

---

## Resultados Esperados

### BÁSICA (Alumno ID: 4)

- **Trimestre 1:** 8.813
- **Estado:** APROBADO

### BACHILLERATO (Alumno ID: 11)

- **Periodo 1, 2, 3, 4:** 8.28 cada uno
- **Promedio Final:** 8.28
- **Estado:** APROBADO

---

## Notas Importantes

✅ Los scripts están listos para usar
✅ Usan los ejemplos exactos del documento oficial
✅ Si ya corriste un script, puedes correrlo de nuevo (limpia y regenera)
✅ No necesitas modificar nada en el código

**Tip:** Si algo sale mal, simplemente vuelve a correr el script desde el paso 1.
