# Ejemplo para actualizar asignatura

## Comando curl

```bash
curl -X PATCH \
  "http://localhost:3000/asignaturas/3" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Matemática I",
    "orden_en_reporte": "01",
    "horas_semanas": 5,
    "id_metodo_evaluacion": 1,
    "id_tipo_asignatura": 1,
    "id_sistema_evaluacion": 1,
    "id_curso": 1
}'
```

## Ejemplo con valores nulos

```bash
curl -X PATCH \
  "http://localhost:3000/asignaturas/3" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Matemática I",
    "id_curso": null
}'
```

## Ejemplo con solo el nombre

```bash
curl -X PATCH \
  "http://localhost:3000/asignaturas/3" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Matemática Actualizada"
}'
```

## PowerShell

```powershell
Invoke-RestMethod -Method PATCH `
  -Uri "http://localhost:3000/asignaturas/3" `
  -Headers @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
  } `
  -Body '{
    "nombre": "Matemática I",
    "orden_en_reporte": "01",
    "horas_semanas": 5,
    "id_metodo_evaluacion": 1,
    "id_tipo_asignatura": 1,
    "id_sistema_evaluacion": 1,
    "id_curso": 1
  }'
```

## Consideraciones importantes

1. **ID de la asignatura**: Reemplaza el número `3` en la URL con el ID real de la asignatura que deseas actualizar.

2. **IDs de referencias**: Asegúrate de que todos los IDs referenciados (`id_metodo_evaluacion`, `id_tipo_asignatura`, `id_sistema_evaluacion`, `id_curso`) existan en tus tablas correspondientes.

3. **Campos parciales**: Puedes enviar solo los campos que deseas actualizar, no necesitas enviar todos.

4. **Valores nulos**: Si deseas establecer un campo como nulo, inclúyelo explícitamente como `null`.