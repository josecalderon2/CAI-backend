#!/bin/bash

# Script para probar el flujo completo de ingreso de notas
# Simula el proceso que haría el frontend

BASE_URL="http://localhost:3000"

echo "======================================"
echo "🧪 PRUEBA DE FLUJO COMPLETO - INGRESO DE NOTAS"
echo "======================================"
echo ""

# PASO 1: Obtener nivel educativo del curso
echo "📋 PASO 1: Validar nivel educativo del curso 1"
echo "--------------------------------------"
echo "⚠️  NOTA: Este endpoint requiere autenticación JWT (por seguridad)"
echo "    En el frontend, incluir: Authorization: Bearer {token}"
echo ""
curl -s -X GET "${BASE_URL}/cursos/1/nivel-educativo" 2>&1 | head -5
echo ""
echo ""

# PASO 2: Obtener asignaturas del curso
echo "📚 PASO 2: Obtener asignaturas del curso 1"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}/asignaturas/curso/1" | jq '.[] | {id_asignatura, nombre, horas_semanas}'
echo ""
echo ""

# PASO 3: Obtener alumnos del curso
echo "👥 PASO 3: Obtener alumnos del curso 1"
echo "--------------------------------------"
echo "⚠️  NOTA: Este endpoint requiere autenticación JWT"
echo ""
curl -s -X GET "${BASE_URL}/cursos/1/alumnos" 2>&1 | head -5
echo ""
echo ""

# PASO 4: Obtener formato de evaluación
echo "📝 PASO 4: Obtener formato de evaluación (Asignatura 1 - BÁSICA)"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}/sistema-evaluacion/formato-evaluacion/asignatura/1" | jq '{nivel, formato, estructura_actividades: .estructura_actividades[0:2], examenes}'
echo ""
echo ""

# PASO 5: Guardar notas (simulación para BÁSICA)
echo "💾 PASO 5: Guardar notas mensuales (Alumno 1, Asignatura 1, Febrero)"
echo "--------------------------------------"
curl -s -X POST "${BASE_URL}/sistema-evaluacion/nota-mensual/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "mes_numerico": 2,
    "anio": 2025,
    "actividades": [
      {"id_tipo_actividad": 1, "numero_actividad": 1, "nota": 8.5},
      {"id_tipo_actividad": 2, "numero_actividad": null, "nota": 9.0},
      {"id_tipo_actividad": 1, "numero_actividad": 2, "nota": 7.5},
      {"id_tipo_actividad": 3, "numero_actividad": 1, "nota": 8.0}
    ],
    "examen_mensual": 9.0
  }' | jq '{
    alumno: .id_alumno,
    asignatura: .id_asignatura,
    mes: .mes,
    actividades: .actividades[0:2],
    examen_mensual,
    "📊 Promedios": {
      promedio_puro: .promedio_puro_actividades,
      promedio_70_actividades: .promedio_70_actividades,
      promedio_30_examen: .promedio_30_examen,
      nota_mensual: .nota_mensual,
      aporte_al_trimestre_28_porciento: .aporte_al_trimestre
    }
  }'
echo ""
echo ""

# PASO 6: Consultar notas guardadas
echo "👁️ PASO 6: Consultar notas guardadas"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}/sistema-evaluacion/notas-mensuales/simple?id_alumno=1&id_asignatura=1&mes_numerico=2&anio=2025" | jq 'if type == "array" then .[0] else . end | {
  mes: .mes_nombre,
  actividades_count: (if .actividades then (.actividades | length) else 0 end),
  examen: .examen_mensual,
  "Cálculos": {
    promedio_puro: .promedio_puro_actividades,
    "70%_actividades": .promedio_70_actividades,
    "30%_examen": .promedio_30_examen,
    nota_mensual: .nota_mensual,
    "Conversión_28%": .aporte_al_trimestre
  }
}'
echo ""
echo ""

# PASO 7: Calcular nota trimestral (necesitamos 3 meses)
echo "📈 PASO 7: Intentar calcular nota trimestral"
echo "--------------------------------------"
echo "Primero necesitamos notas de Marzo y Abril..."
echo ""

# Guardar nota de Marzo
echo "Guardando nota de Marzo..."
curl -s -X POST "${BASE_URL}/sistema-evaluacion/nota-mensual/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "mes_numerico": 3,
    "anio": 2025,
    "actividades": [
      {"id_tipo_actividad": 1, "numero_actividad": 1, "nota": 8.0},
      {"id_tipo_actividad": 2, "numero_actividad": null, "nota": 9.5},
      {"id_tipo_actividad": 1, "numero_actividad": 2, "nota": 8.5},
      {"id_tipo_actividad": 3, "numero_actividad": 1, "nota": 9.0}
    ],
    "examen_mensual": 9.5
  }' > /dev/null
echo "✓ Nota de Marzo guardada"
echo ""

# Guardar nota de Abril
echo "Guardando nota de Abril..."
curl -s -X POST "${BASE_URL}/sistema-evaluacion/nota-mensual/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "mes_numerico": 4,
    "anio": 2025,
    "actividades": [
      {"id_tipo_actividad": 1, "numero_actividad": 1, "nota": 9.0},
      {"id_tipo_actividad": 2, "numero_actividad": null, "nota": 9.0},
      {"id_tipo_actividad": 1, "numero_actividad": 2, "nota": 8.5},
      {"id_tipo_actividad": 3, "numero_actividad": 1, "nota": 9.5}
    ],
    "examen_mensual": 9.0
  }' > /dev/null
echo "✓ Nota de Abril guardada"
echo ""
echo ""

# Ahora sí, calcular nota trimestral
echo "Calculando nota trimestral (Trimestre 1)..."
curl -s -X POST "${BASE_URL}/sistema-evaluacion/nota-trimestral" \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "trimestre": 1,
    "anio_academico": "2025"
  }' | jq '{
  trimestre: .trimestre,
  "Desglose Mensual": .notas_mensuales,
  "📊 NOTA TRIMESTRAL": .nota_trimestral
}'
echo ""
echo ""

echo "======================================"
echo "✅ PRUEBA COMPLETADA"
echo "======================================"
echo ""
echo "📌 Resumen de cálculos:"
echo "   - Promedio Puro = (Suma actividades) / (Cantidad actividades)"
echo "   - Promedio 70% = Promedio Puro × 0.70"
echo "   - Promedio 30% = Examen × 0.30"
echo "   - Nota Mensual = Promedio 70% + Promedio 30%"
echo "   - Conversión 28% (Febrero) = Nota Mensual × 0.28"
echo "   - Conversión 27% (Marzo) = Nota Mensual × 0.27"
echo "   - Conversión 45% (Abril) = Nota Mensual × 0.45"
echo "   - Nota Trimestral = Suma de todas las conversiones"
echo ""
