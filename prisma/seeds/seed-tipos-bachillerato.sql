-- ============================================
-- SEED: Tipos de Actividad para Bachillerato
-- ============================================

-- Insertar tipos de actividad específicos para Bachillerato
INSERT INTO tipos_actividad_evaluacion 
  (nombre, activo, orden, peso_basica, peso_bachillerato, categoria_bachillerato, aplica_a_nivel)
VALUES 
  -- Actividades Integradoras (25%)
  ('Actividad Integradora', true, 101, NULL, 0.25, 'ACTIVIDAD_INTEGRADORA', ARRAY['BACHILLERATO']),
  ('Proyecto Integrador', true, 102, NULL, 0.25, 'ACTIVIDAD_INTEGRADORA', ARRAY['BACHILLERATO']),
  
  -- Tareas (5%)
  ('Tarea Bachillerato', true, 103, NULL, 0.05, 'TAREA', ARRAY['BACHILLERATO']),
  ('Investigación', true, 104, NULL, 0.05, 'TAREA', ARRAY['BACHILLERATO']),
  
  -- Coevaluación (5%)
  ('Coevaluación', true, 105, NULL, 0.05, 'COEVALUACION', ARRAY['BACHILLERATO']),
  ('Autoevaluación', true, 106, NULL, 0.05, 'COEVALUACION', ARRAY['BACHILLERATO']),
  ('Evaluación entre pares', true, 107, NULL, 0.05, 'COEVALUACION', ARRAY['BACHILLERATO']),
  
  -- Laboratorio/Práctico (10%)
  ('Laboratorio Bachillerato', true, 108, NULL, 0.10, 'LABORATORIO', ARRAY['BACHILLERATO']),
  ('Práctica de Campo', true, 109, NULL, 0.10, 'LABORATORIO', ARRAY['BACHILLERATO']),
  ('Experimento', true, 110, NULL, 0.10, 'LABORATORIO', ARRAY['BACHILLERATO']),
  ('Trabajo Práctico', true, 111, NULL, 0.10, 'LABORATORIO', ARRAY['BACHILLERATO'])
ON CONFLICT (nombre) DO NOTHING;

-- Actualizar tipos existentes para que solo apliquen a Básica
UPDATE tipos_actividad_evaluacion 
SET aplica_a_nivel = ARRAY['BASICA']
WHERE categoria_bachillerato IS NULL
  AND nombre NOT IN (
    'Actividad Integradora', 'Proyecto Integrador',
    'Tarea Bachillerato', 'Investigación',
    'Coevaluación', 'Autoevaluación', 'Evaluación entre pares',
    'Laboratorio Bachillerato', 'Práctica de Campo', 'Experimento', 'Trabajo Práctico'
  );

-- Verificar la inserción
SELECT 
  id_tipo_actividad,
  nombre, 
  categoria_bachillerato, 
  peso_bachillerato, 
  aplica_a_nivel 
FROM tipos_actividad_evaluacion 
WHERE 'BACHILLERATO' = ANY(aplica_a_nivel)
ORDER BY orden;
