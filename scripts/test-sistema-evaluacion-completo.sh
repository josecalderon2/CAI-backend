#!/bin/bash

# Script de pruebas completas del Sistema de Evaluación Dual
# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/sistema-evaluacion"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PRUEBAS SISTEMA EVALUACIÓN DUAL     ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Función para hacer requests
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}TEST:${NC} $description"
    echo -e "${BLUE}→${NC} $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

# ====================================
# 1. CONFIGURACIONES
# ====================================
echo -e "${GREEN}=== 1. CONFIGURACIONES ===${NC}\n"

test_endpoint "GET" "/configuracion-evaluacion/2" "" \
    "Configuración de asignatura BÁSICA (id=2)"

test_endpoint "GET" "/configuracion-evaluacion/6" "" \
    "Configuración de asignatura BACHILLERATO (id=6)"

# ====================================
# 2. REGISTRO DE NOTAS - BÁSICA
# ====================================
echo -e "${GREEN}=== 2. REGISTRO NOTAS BÁSICA ===${NC}\n"

test_endpoint "POST" "/nota-mensual" '{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes": "Febrero",
  "trimestre": 1,
  "anio_academico": "2025",
  "actividades": [
    {"id_tipo_actividad": 1, "numero_actividad": 1, "nota": 8.5},
    {"id_tipo_actividad": 2, "numero_actividad": 1, "nota": 9.0}
  ],
  "examen_mensual": 8.8
}' "Registrar nota Febrero - Alumno 1 (BÁSICA)"

test_endpoint "POST" "/nota-mensual" '{
  "id_alumno": 1,
  "id_asignatura": 2,
  "mes": "Marzo",
  "trimestre": 1,
  "anio_academico": "2025",
  "actividades": [
    {"id_tipo_actividad": 1, "numero_actividad": 1, "nota": 9.0},
    {"id_tipo_actividad": 3, "numero_actividad": 1, "nota": 8.5}
  ],
  "examen_mensual": 9.0
}' "Registrar nota Marzo - Alumno 1 (BÁSICA)"

# ====================================
# 3. REGISTRO DE NOTAS - BACHILLERATO
# ====================================
echo -e "${GREEN}=== 3. REGISTRO NOTAS BACHILLERATO ===${NC}\n"

test_endpoint "POST" "/nota-mensual" '{
  "id_alumno": 2,
  "id_asignatura": 6,
  "mes": "Periodo 1",
  "trimestre": 1,
  "anio_academico": "2025",
  "actividades": [
    {"id_tipo_actividad": 5, "numero_actividad": 1, "nota": 8.5},
    {"id_tipo_actividad": 7, "numero_actividad": 1, "nota": 9.0},
    {"id_tipo_actividad": 9, "numero_actividad": 1, "nota": 8.0},
    {"id_tipo_actividad": 12, "numero_actividad": 1, "nota": 8.7}
  ],
  "examen_mensual": 8.8,
  "examen_parcial": 9.0
}' "Registrar Periodo 1 - Alumno 2 (BACHILLERATO)"

test_endpoint "POST" "/nota-mensual" '{
  "id_alumno": 2,
  "id_asignatura": 7,
  "mes": "Periodo 1",
  "trimestre": 1,
  "anio_academico": "2025",
  "actividades": [
    {"id_tipo_actividad": 6, "numero_actividad": 1, "nota": 9.0},
    {"id_tipo_actividad": 8, "numero_actividad": 1, "nota": 8.5},
    {"id_tipo_actividad": 10, "numero_actividad": 1, "nota": 8.8},
    {"id_tipo_actividad": 13, "numero_actividad": 1, "nota": 9.2}
  ],
  "examen_mensual": 9.0,
  "examen_parcial": 8.7
}' "Registrar Periodo 1 - Alumno 2 Asignatura 7 (BACHILLERATO)"

# ====================================
# 4. VALIDACIONES
# ====================================
echo -e "${GREEN}=== 4. VALIDACIONES ===${NC}\n"

test_endpoint "POST" "/nota-mensual" '{
  "id_alumno": 2,
  "id_asignatura": 6,
  "mes": "Periodo 2",
  "trimestre": 2,
  "anio_academico": "2025",
  "actividades": [
    {"id_tipo_actividad": 5, "numero_actividad": 1, "nota": 8.5}
  ],
  "examen_mensual": 8.8
}' "❌ ERROR ESPERADO: Falta examen_parcial en Bachillerato"

test_endpoint "POST" "/nota-mensual" '{
  "id_alumno": 2,
  "id_asignatura": 6,
  "mes": "Periodo 2",
  "trimestre": 2,
  "anio_academico": "2025",
  "actividades": [
    {"id_tipo_actividad": 5, "numero_actividad": 1, "nota": 8.5}
  ],
  "examen_mensual": 8.8,
  "examen_parcial": 9.0
}' "❌ ERROR ESPERADO: Faltan categorías (solo Act.Int)"

# ====================================
# 5. CONSOLIDADOS (BOLETAS)
# ====================================
echo -e "${GREEN}=== 5. CONSOLIDADOS MENSUALES (BOLETAS) ===${NC}\n"

test_endpoint "GET" "/consolidado-mensual-alumno/1?mes=Febrero&trimestre=1&anio_academico=2025" "" \
    "Consolidado Febrero - Alumno 1 (BÁSICA)"

test_endpoint "GET" "/consolidado-mensual-alumno/2?mes=Periodo%201&trimestre=1&anio_academico=2025" "" \
    "Consolidado Periodo 1 - Alumno 2 (BACHILLERATO)"

# ====================================
# 6. REPORTES TRIMESTRALES
# ====================================
echo -e "${GREEN}=== 6. REPORTES TRIMESTRALES ===${NC}\n"

test_endpoint "GET" "/reporte-trimestral-alumno/1/2?trimestre=1&anio_academico=2025" "" \
    "Reporte Trimestre 1 - Alumno 1, Asignatura 2 (BÁSICA)"

test_endpoint "GET" "/reporte-trimestral-alumno/2/6?trimestre=1&anio_academico=2025" "" \
    "Reporte Periodo 1 - Alumno 2, Asignatura 6 (BACHILLERATO)"

# ====================================
# RESUMEN
# ====================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}         PRUEBAS COMPLETADAS           ${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${GREEN}✅ Funcionalidades probadas:${NC}"
echo "  • Configuración adaptativa por nivel"
echo "  • Registro de notas BÁSICA (70/30)"
echo "  • Registro de notas BACHILLERATO (6 componentes)"
echo "  • Validaciones de examen_parcial"
echo "  • Validaciones de categorías"
echo "  • Consolidados mensuales adaptativos"
echo "  • Reportes trimestrales"

echo -e "\n${YELLOW}📋 Verificar manualmente:${NC}"
echo "  • Formato de respuesta BÁSICA: actividades[], calculo{}"
echo "  • Formato de respuesta BACHILLERATO: componentes{}"
echo "  • Errores 400 en validaciones"
echo "  • Porcentajes en formato decimal (0.28, 0.25)"

echo -e "\n${BLUE}Ver documentación completa en:${NC}"
echo "  DOCUMENTACION-API-SISTEMA-EVALUACION.md"
echo ""
