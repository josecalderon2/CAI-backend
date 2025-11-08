-- Script para limpiar solo datos de evaluación manteniendo la estructura
-- Ejecutar con: PGPASSWORD=admin psql -h localhost -U postgres -d CAI -f reset-evaluacion-data.sql

BEGIN;

-- 1. Eliminar notas y actividades
DELETE FROM "actividades_evaluacion";
DELETE FROM "notas_mensuales";
DELETE FROM "notas_trimestrales";

-- 2. Corregir inscripciones duplicadas - mantener solo 1 activa por alumno/año
-- Desactivar inscripciones extra del alumno 2
UPDATE "AlumnoCurso" 
SET estado = 'INACTIVO' 
WHERE "alumnoId" = 2 
  AND "cursoId" = 1 
  AND "anioAcademico" = '2025';

-- Verificar que cada alumno tenga solo 1 inscripción activa en 2025
DO $$
DECLARE
    alumno_record RECORD;
    conteo INT;
BEGIN
    FOR alumno_record IN 
        SELECT "alumnoId", "anioAcademico", COUNT(*) as total
        FROM "AlumnoCurso"
        WHERE estado = 'ACTIVO'
        GROUP BY "alumnoId", "anioAcademico"
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Alumno % tiene % inscripciones activas en %', 
                     alumno_record."alumnoId", 
                     alumno_record.total, 
                     alumno_record."anioAcademico";
    END LOOP;
END $$;

-- 3. Mostrar distribución final
SELECT 
    a."id_alumno",
    a.nombre,
    c.nombre as curso,
    ga."nivel_educativo",
    ac."anioAcademico",
    ac.estado
FROM "AlumnoCurso" ac
JOIN "Alumno" a ON ac."alumnoId" = a."id_alumno"
JOIN "Curso" c ON ac."cursoId" = c."id_curso"
JOIN "Grado_Academico" ga ON c."id_grado_academico" = ga."id_grado_academico"
WHERE ac."anioAcademico" = '2025' 
  AND ac.estado = 'ACTIVO'
ORDER BY ga."nivel_educativo", a."id_alumno";

COMMIT;

-- Resumen
SELECT 
    ga."nivel_educativo",
    COUNT(DISTINCT ac."alumnoId") as total_alumnos
FROM "AlumnoCurso" ac
JOIN "Curso" c ON ac."cursoId" = c."id_curso"
JOIN "Grado_Academico" ga ON c."id_grado_academico" = ga."id_grado_academico"
WHERE ac."anioAcademico" = '2025' 
  AND ac.estado = 'ACTIVO'
GROUP BY ga."nivel_educativo";
