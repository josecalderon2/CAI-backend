# Prueba del Endpoint de Notas Mensuales

## Datos de Prueba:
- tarea_1: 8.0
- revision_libros_cuadernos: 9.0
- tarea_2: 7.5
- laboratorio_escrito: 8.5
- examen_mensual: 9.0

## Cálculos Esperados:

### 1. Promedio Puro de Actividades
```
Actividades: 8.0, 9.0, 7.5, 8.5
Suma: 8.0 + 9.0 + 7.5 + 8.5 = 33.0
Cantidad: 4
Promedio Puro = 33.0 / 4 = 8.250
```
✅ **promedio_puro_actividades = 8.250**

### 2. Promedio Actividades 70%
```
Promedio 70% = 8.250 × 0.70 = 5.775
```
✅ **promedio_70_actividades = 5.775**

### 3. Promedio Examen 30%
```
Promedio 30% = 9.0 × 0.30 = 2.700
```
✅ **promedio_30_examen = 2.700**

### 4. Nota Mensual Final
```
Nota Mensual = 5.775 + 2.700 = 8.475
```
✅ **nota_mensual (promedio) = 8.475**

---

## Comando cURL para Prueba

```bash
curl -X POST http://localhost:3000/notas-mensuales \
  -H "Content-Type: application/json" \
  -d '{
    "id_alumno": 1,
    "id_asignatura": 1,
    "mes": 3,
    "anio": 2025,
    "tarea_1": 8.0,
    "revision_libros_cuadernos": 9.0,
    "tarea_2": 7.5,
    "laboratorio_escrito": 8.5,
    "examen_mensual": 9.0
  }'
```

---

## PowerShell para Prueba

```powershell
$body = @{
    id_alumno = 1
    id_asignatura = 1
    mes = 3
    anio = 2025
    tarea_1 = 8.0
    revision_libros_cuadernos = 9.0
    tarea_2 = 7.5
    laboratorio_escrito = 8.5
    examen_mensual = 9.0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/notas-mensuales" -Method POST -Body $body -ContentType "application/json"
```

---

## Respuesta Esperada

```json
{
  "id": 1,
  "id_alumno": 1,
  "id_asignatura": 1,
  "mes": 3,
  "anio": 2025,
  "tarea_1": 8.0,
  "revision_libros_cuadernos": 9.0,
  "tarea_2": 7.5,
  "laboratorio_escrito": 8.5,
  "examen_mensual": 9.0,
  "promedio_puro_actividades": 8.250,
  "promedio_70_actividades": 5.775,
  "promedio_30_examen": 2.700,
  "promedio": 8.475,
  "fecha_creacion": "2025-11-08T...",
  "fecha_actualizacion": "2025-11-08T..."
}
```
