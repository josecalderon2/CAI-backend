-- Script para actualizar el nivel_educativo de los grados académicos
-- Este script asigna correctamente BASICA o BACHILLERATO a cada grado

-- ========================================
-- EDUCACIÓN BÁSICA (1º a 9º grado)
-- ========================================

-- Primera Infancia / Parvularia / Preescolar
UPDATE "grados_academicos" 
SET nivel_educativo = 'BASICA'
WHERE nombre ILIKE '%primera infancia%'
   OR nombre ILIKE '%parvularia%'
   OR nombre ILIKE '%preescolar%'
   OR nombre ILIKE '%kinder%'
   OR nombre ILIKE '%preparatoria%';

-- Primaria (1º a 6º grado)
UPDATE "grados_academicos" 
SET nivel_educativo = 'BASICA'
WHERE nombre ILIKE '%primaria%'
   OR nombre ILIKE '1º grado%'
   OR nombre ILIKE '2º grado%'
   OR nombre ILIKE '3º grado%'
   OR nombre ILIKE '4º grado%'
   OR nombre ILIKE '5º grado%'
   OR nombre ILIKE '6º grado%'
   OR nombre ILIKE 'primer grado%'
   OR nombre ILIKE 'segundo grado%'
   OR nombre ILIKE 'tercer grado%'
   OR nombre ILIKE 'cuarto grado%'
   OR nombre ILIKE 'quinto grado%'
   OR nombre ILIKE 'sexto grado%';

-- Secundaria / Básica (7º a 9º grado)
UPDATE "grados_academicos" 
SET nivel_educativo = 'BASICA'
WHERE nombre ILIKE '%secundaria%'
   OR nombre ILIKE '7º grado%'
   OR nombre ILIKE '8º grado%'
   OR nombre ILIKE '9º grado%'
   OR nombre ILIKE 'séptimo grado%'
   OR nombre ILIKE 'octavo grado%'
   OR nombre ILIKE 'noveno grado%'
   OR nombre ILIKE '%tercer ciclo%';

-- ========================================
-- BACHILLERATO (1º y 2º año)
-- ========================================

UPDATE "grados_academicos" 
SET nivel_educativo = 'BACHILLERATO'
WHERE nombre ILIKE '%bachillerato%'
   OR nombre ILIKE '1º año%'
   OR nombre ILIKE '2º año%'
   OR nombre ILIKE 'primer año%'
   OR nombre ILIKE 'segundo año%'
   OR nombre ILIKE '10º grado%'
   OR nombre ILIKE '11º grado%'
   OR nombre ILIKE 'décimo grado%'
   OR nombre ILIKE 'undécimo grado%';

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Mostrar el resultado de la actualización
SELECT 
    id_grado_academico,
    nombre,
    nivel_educativo,
    CASE 
        WHEN nivel_educativo = 'BASICA' THEN '✅ Básica (1º-9º)'
        WHEN nivel_educativo = 'BACHILLERATO' THEN '✅ Bachillerato (1º-2º año)'
        ELSE '❌ SIN CONFIGURAR'
    END as descripcion
FROM "grados_academicos"
ORDER BY 
    CASE nivel_educativo 
        WHEN 'BASICA' THEN 1 
        WHEN 'BACHILLERATO' THEN 2 
        ELSE 3 
    END,
    nombre;

-- Mostrar grados que no tienen nivel_educativo configurado
SELECT 
    id_grado_academico,
    nombre,
    '⚠️ REQUIERE CONFIGURACIÓN MANUAL' as estado
FROM "grados_academicos"
WHERE nivel_educativo IS NULL;

-- Contar grados por nivel educativo
SELECT 
    nivel_educativo,
    COUNT(*) as cantidad,
    string_agg(nombre, ', ') as grados
FROM "grados_academicos"
GROUP BY nivel_educativo
ORDER BY nivel_educativo;
