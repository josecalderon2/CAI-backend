#!/bin/bash

# Script para probar el sistema de evaluaciones BASICA actualizado
# Fecha: 9 de noviembre de 2025

BASE_URL="http://localhost:3000"
ASIGNATURA_ID=2  # Asignatura de BASICA
ALUMNO_ID=1

echo "========================================="
echo "🧪 PRUEBAS DEL SISTEMA DE EVALUACIÓN BASICA"
echo "========================================="
echo ""

# Test 1: Obtener configuración de evaluación
echo "📋 Test 1: Obtener configuración de evaluación de la asignatura"
echo "GET /sistema-evaluacion/configuracion-evaluacion/$ASIGNATURA_ID"
echo ""
curl -s -X GET "$BASE_URL/sistema-evaluacion/configuracion-evaluacion/$ASIGNATURA_ID" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Obtener formato de evaluación (estructura para el frontend)
echo "📋 Test 2: Obtener formato/estructura de evaluación"
echo "GET /sistema-evaluacion/formato-evaluacion/asignatura/$ASIGNATURA_ID"
echo ""
curl -s -X GET "$BASE_URL/sistema-evaluacion/formato-evaluacion/asignatura/$ASIGNATURA_ID" | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Verificar datos de la asignatura
echo "📋 Test 3: Verificar información de la asignatura"
echo "GET /asignaturas/$ASIGNATURA_ID"
echo ""
curl -s -X GET "$BASE_URL/asignaturas/$ASIGNATURA_ID" | jq '{id_asignatura, nombre, curso: {id_curso, nombre, grado_academico: {nombre, nivel_educativo}}}'
echo ""
echo "---"
echo ""

# Test 4: Listar notas mensuales existentes
echo "📋 Test 4: Consultar notas mensuales existentes"
echo "GET /sistema-evaluacion/notas/simplificadas?alumno_id=$ALUMNO_ID&asignatura_id=$ASIGNATURA_ID"
echo ""
curl -s -X GET "$BASE_URL/sistema-evaluacion/notas/simplificadas?alumno_id=$ALUMNO_ID&asignatura_id=$ASIGNATURA_ID" | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Consultar notas de febrero si existen
echo "📋 Test 5: Consultar notas de Febrero (mes 2)"
echo "GET /sistema-evaluacion/notas/simplificadas?alumno_id=$ALUMNO_ID&asignatura_id=$ASIGNATURA_ID&mes=2&anio=2025"
echo ""
curl -s -X GET "$BASE_URL/sistema-evaluacion/notas/simplificadas?alumno_id=$ALUMNO_ID&asignatura_id=$ASIGNATURA_ID&mes=2&anio=2025" | jq '.'
echo ""
echo "---"
echo ""

# Test 6: Consultar consolidado mensual del alumno
echo "📋 Test 6: Consolidado mensual del alumno (todas las asignaturas)"
echo "GET /sistema-evaluacion/consolidado-mensual-alumno/$ALUMNO_ID?mes=2&anio=2025&trimestre=1"
echo ""
curl -s -X GET "$BASE_URL/sistema-evaluacion/consolidado-mensual-alumno/$ALUMNO_ID?mes=Febrero&trimestre=1&anio_academico=2025" | jq '.'
echo ""
echo "========================================="
echo "✅ Pruebas completadas"
echo "========================================="
