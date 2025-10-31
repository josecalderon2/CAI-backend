#!/bin/bash

# Script de prueba para los nuevos endpoints de historial de asistencia
# Ejecutar: chmod +x test-historial-endpoints.sh && ./test-historial-endpoints.sh

echo "🧪 Probando endpoints de historial de asistencia..."
echo ""

# Variables de configuración
BASE_URL="http://localhost:3000"
# TOKEN="tu_token_jwt_aqui" # Descomenta y agrega tu token si los guards están activos

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Test 1: Buscar asistencias con filtros${NC}"
echo "GET /asistencia/buscar/filtros?cursoId=1&fechaDesde=2025-10-01&fechaHasta=2025-10-31"
curl -X GET "${BASE_URL}/asistencia/buscar/filtros?cursoId=1&fechaDesde=2025-10-01&fechaHasta=2025-10-31" \
  -H "Content-Type: application/json" \
  # -H "Authorization: Bearer ${TOKEN}" \
  -w "\n\nStatus: %{http_code}\n\n"

echo ""
echo -e "${YELLOW}📋 Test 2: Buscar asistencias por estado${NC}"
echo "GET /asistencia/buscar/filtros?estado=SP"
curl -X GET "${BASE_URL}/asistencia/buscar/filtros?estado=SP" \
  -H "Content-Type: application/json" \
  # -H "Authorization: Bearer ${TOKEN}" \
  -w "\n\nStatus: %{http_code}\n\n"

echo ""
echo -e "${YELLOW}📋 Test 3: Obtener historial de un registro (ID: 1)${NC}"
echo "GET /asistencia/historial/1"
curl -X GET "${BASE_URL}/asistencia/historial/1" \
  -H "Content-Type: application/json" \
  # -H "Authorization: Bearer ${TOKEN}" \
  -w "\n\nStatus: %{http_code}\n\n"

echo ""
echo -e "${YELLOW}📋 Test 4: Obtener historial de un alumno (ID: 1)${NC}"
echo "GET /asistencia/historial/alumno/1"
curl -X GET "${BASE_URL}/asistencia/historial/alumno/1" \
  -H "Content-Type: application/json" \
  # -H "Authorization: Bearer ${TOKEN}" \
  -w "\n\nStatus: %{http_code}\n\n"

echo ""
echo -e "${YELLOW}📋 Test 5: Modificar una asistencia (ID: 1)${NC}"
echo "PATCH /asistencia/1"
curl -X PATCH "${BASE_URL}/asistencia/1" \
  -H "Content-Type: application/json" \
  # -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "estado": "E",
    "observacion": "Test: Cambio de SP a E - Constancia médica presentada"
  }' \
  -w "\n\nStatus: %{http_code}\n\n"

echo ""
echo -e "${GREEN}✅ Pruebas completadas!${NC}"
echo ""
echo -e "${YELLOW}📝 Notas:${NC}"
echo "- Si recibes 401 Unauthorized, descomenta la línea de Authorization y agrega tu token"
echo "- Si recibes 404 Not Found, verifica que existan registros con esos IDs"
echo "- Status 200 = Éxito"
echo "- Status 404 = Recurso no encontrado"
echo "- Status 401 = No autenticado"
echo ""
