-- Ver todos los tipos de actividad configurados
SELECT 
  id_tipo_actividad,
  nombre,
  activo,
  orden,
  peso_basica,
  peso_bachillerato,
  categoria_bachillerato,
  aplica_a_nivel
FROM tipos_actividad_evaluacion
ORDER BY orden, nombre;
