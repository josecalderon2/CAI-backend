# 📊 Consultas SQL de Verificación - Trimestre 3

## 1️⃣ Verificar Asistencias Creadas (Trimestre 3)

```sql
SELECT 
    a.id_asistencia,
    al.id_alumno,
    al.nombre || ' ' || al.apellido AS alumno,
    asig.nombre AS asignatura,
    a.fecha::date AS fecha,
    a.estado,
    a.observacion,
    a.trimestre,
    a.anio_academico
FROM "Asistencia" a
JOIN "Alumno" al ON a.id_alumno = al.id_alumno
JOIN "Asignatura" asig ON a.id_asignatura = asig.id_asignatura
WHERE a.trimestre = 3 
  AND a.anio_academico = '2025'
ORDER BY a.fecha, al.apellido, asig.nombre;
```

## 2️⃣ Resumen de Asistencias por Alumno (Trimestre 3)

```sql
SELECT 
    al.id_alumno,
    al.nombre || ' ' || al.apellido AS alumno,
    COUNT(*) AS total_registros,
    COUNT(*) FILTER (WHERE a.estado = 'P') AS presentes,
    COUNT(*) FILTER (WHERE a.estado = 'A') AS atrasos,
    COUNT(*) FILTER (WHERE a.estado = 'SP') AS sin_permiso,
    COUNT(*) FILTER (WHERE a.estado = 'E') AS excusadas
FROM "Asistencia" a
JOIN "Alumno" al ON a.id_alumno = al.id_alumno
WHERE a.trimestre = 3 
  AND a.anio_academico = '2025'
GROUP BY al.id_alumno, al.nombre, al.apellido
ORDER BY al.apellido;
```

## 3️⃣ Verificar Conductas Creadas (Trimestre 3)

```sql
SELECT 
    c.id_conducta,
    al.id_alumno,
    al.nombre || ' ' || al.apellido AS alumno,
    ic.articulo,
    ic.descripcion AS infraccion,
    ic.categoria,
    ic.puntos,
    c.fecha::date AS fecha,
    c.observacion,
    c.trimestre,
    c.anio_academico,
    asig.nombre AS asignatura
FROM "Conducta" c
JOIN "Alumno" al ON c.id_alumno = al.id_alumno
JOIN "InfraccionCatalogo" ic ON c.id_infraccion_catalogo = ic.id_infraccion
JOIN "Asignatura" asig ON c.id_asignatura = asig.id_asignatura
WHERE c.trimestre = 3 
  AND c.anio_academico = '2025'
ORDER BY c.fecha, al.apellido;
```

## 4️⃣ Resumen de Conductas por Alumno (Trimestre 3)

```sql
SELECT 
    al.id_alumno,
    al.nombre || ' ' || al.apellido AS alumno,
    COUNT(*) AS total_infracciones,
    SUM(ic.puntos) AS puntos_totales,
    COUNT(*) FILTER (WHERE ic.categoria = 'MENOS_GRAVE') AS leves,
    COUNT(*) FILTER (WHERE ic.categoria = 'GRAVE') AS graves,
    COUNT(*) FILTER (WHERE ic.categoria = 'MUY_GRAVE') AS muy_graves,
    STRING_AGG(ic.articulo, ', ' ORDER BY c.fecha) AS articulos
FROM "Conducta" c
JOIN "Alumno" al ON c.id_alumno = al.id_alumno
JOIN "InfraccionCatalogo" ic ON c.id_infraccion_catalogo = ic.id_infraccion
WHERE c.trimestre = 3 
  AND c.anio_academico = '2025'
GROUP BY al.id_alumno, al.nombre, al.apellido
ORDER BY puntos_totales DESC, al.apellido;
```

## 5️⃣ Datos para Probar POST /asistencia/bulk

```sql
SELECT 
    c.id_curso,
    c.nombre || ' ' || c.seccion AS curso_completo,
    asig.id_asignatura,
    asig.nombre AS asignatura,
    o.id_orientador,
    u.nombre || ' ' || u.apellido AS orientador,
    COUNT(ac.id) AS total_alumnos,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id_alumno', al.id_alumno,
            'nombre', al.nombre || ' ' || al.apellido
        ) ORDER BY al.apellido
    ) AS alumnos
FROM "Curso" c
JOIN "Asignatura" asig ON asig.id_curso = c.id_curso
JOIN "Orientador" o ON asig.id_orientador = o.id_orientador
JOIN "Usuario" u ON o.id_usuario = u.id_usuario
JOIN "AlumnoCurso" ac ON ac."cursoId" = c.id_curso AND ac.estado = 'ACTIVO'
JOIN "Alumno" al ON ac."alumnoId" = al.id_alumno
WHERE c.id_curso = 1  -- Quinto Grado A
  AND asig.anio_academico = '2025'
  AND asig.activo = true
GROUP BY c.id_curso, c.nombre, c.seccion, asig.id_asignatura, asig.nombre, o.id_orientador, u.nombre, u.apellido
ORDER BY asig.nombre;
```

## 6️⃣ Datos para Probar GET /resumen/trimestral

```sql
-- Obtener IDs válidos para la consulta trimestral
SELECT 
    c.id_curso,
    c.nombre || ' ' || c.seccion AS curso,
    COUNT(DISTINCT ac."alumnoId") AS total_alumnos,
    COUNT(DISTINCT a.id_asistencia) AS registros_asistencia,
    COUNT(DISTINCT co.id_conducta) AS registros_conducta
FROM "Curso" c
JOIN "AlumnoCurso" ac ON ac."cursoId" = c.id_curso AND ac.estado = 'ACTIVO'
LEFT JOIN "Asistencia" a ON a.id_alumno = ac."alumnoId" 
    AND a.trimestre = 3 
    AND a.anio_academico = '2025'
LEFT JOIN "Conducta" co ON co.id_alumno = ac."alumnoId" 
    AND co.trimestre = 3 
    AND co.anio_academico = '2025'
WHERE ac."anioAcademico" = '2025'
GROUP BY c.id_curso, c.nombre, c.seccion;
```

**Ejemplo de llamada al endpoint:**
```
GET /resumen/trimestral?cursoId=1&trimestre=3&anio=2025
```

## 7️⃣ Verificar Relaciones AlumnoCurso

```sql
SELECT 
    ac.id,
    ac."alumnoId",
    al.nombre || ' ' || al.apellido AS alumno,
    ac."cursoId",
    c.nombre || ' ' || c.seccion AS curso,
    ac."anioAcademico",
    ac.estado,
    ac."fechaInscripcion"::date
FROM "AlumnoCurso" ac
JOIN "Alumno" al ON ac."alumnoId" = al.id_alumno
JOIN "Curso" c ON ac."cursoId" = c.id_curso
WHERE ac."anioAcademico" = '2025'
  AND ac.estado = 'ACTIVO'
ORDER BY c.nombre, c.seccion, al.apellido;
```

## 8️⃣ Estadísticas Generales del Sistema

```sql
SELECT 
    'Alumnos Activos' AS concepto,
    COUNT(*)::text AS cantidad
FROM "Alumno"
WHERE activo = true

UNION ALL

SELECT 
    'Inscripciones 2025',
    COUNT(*)::text
FROM "AlumnoCurso"
WHERE "anioAcademico" = '2025' AND estado = 'ACTIVO'

UNION ALL

SELECT 
    'Asistencias Trimestre 3',
    COUNT(*)::text
FROM "Asistencia"
WHERE trimestre = 3 AND anio_academico = '2025'

UNION ALL

SELECT 
    'Conductas Trimestre 3',
    COUNT(*)::text
FROM "Conducta"
WHERE trimestre = 3 AND anio_academico = '2025'

UNION ALL

SELECT 
    'Infracciones Catálogo',
    COUNT(*)::text
FROM "InfraccionCatalogo"
WHERE activo = true;
```

---

## 📝 Notas Importantes

1. **Asistencias creadas**: 75 registros (5 alumnos × 3 asignaturas × 5 fechas)
2. **Conductas creadas**: 3 registros de infracciones distribuidas entre alumnos
3. **Fechas de asistencia**: 
   - 2025-08-01: Todos presentes
   - 2025-08-15: Algunas ausencias (SP y A)
   - 2025-08-20: Ausencia justificada (E)
   - 2025-09-05: Todos presentes
   - 2025-09-10: Un atraso (A)

4. **Datos listos para probar**:
   - ✅ POST `/asistencia/bulk` (usar query #5 para obtener IDs)
   - ✅ GET `/resumen/trimestral?cursoId=1&trimestre=3&anio=2025`
   - ✅ POST `/conducta` (usar query #7 del documento anterior para infracciones)
   - ✅ GET `/conducta/alumno/:id` (usar id_alumno de query #4)
