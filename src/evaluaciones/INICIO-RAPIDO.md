# 🚀 Guía de Inicio Rápido - Módulo de Evaluaciones

## ✅ Verificación de Instalación

El módulo ya está completamente integrado en el sistema. Para verificar:

```bash
# 1. Verificar que no hay errores de compilación
npm run build

# 2. Iniciar el servidor en modo desarrollo
npm run start:dev

# 3. El servidor debería iniciar sin errores en:
# http://localhost:3000
```

## 📝 Configuración Inicial

### 1. Verificar Tipos de Evaluación
Antes de crear evaluaciones, asegúrate de tener tipos de evaluación activos:

```bash
GET http://localhost:3000/tipo-evaluacion
Authorization: Bearer <tu-token>
```

Si no hay tipos, créalos primero:
```bash
POST http://localhost:3000/tipo-evaluacion
{
  "nombre": "Examen",
  "activo": true
}
```

### 2. Obtener Token de Autenticación
Necesitas autenticarte primero:

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "tu-email@ejemplo.com",
  "password": "tu-password"
}
```

Guarda el token que recibes en la respuesta.

## 🎯 Primer Uso - Orientador

### Paso 1: Crear tu primera evaluación
```bash
POST http://localhost:3000/evaluaciones
Authorization: Bearer <tu-token>
Content-Type: application/json

{
  "nombre": "Examen Trimestral I - Matemáticas",
  "puntaje_minimo": 0,
  "puntaje_maximo": 10,
  "id_tipo_evaluacion": 1
}
```

**Respuesta esperada:**
```json
{
  "message": "Evaluación creada exitosamente",
  "evaluacion": {
    "id_evaluacion": 1,
    "nombre": "Examen Trimestral I - Matemáticas",
    "puntaje_minimo": 0,
    "puntaje_maximo": 10,
    "id_tipo_evaluacion": 1,
    "tipoEvaluacion": {
      "id_tipo_evaluacion": 1,
      "nombre": "Examen",
      "activo": true
    }
  }
}
```

### Paso 2: Ver tus evaluaciones
```bash
GET http://localhost:3000/evaluaciones
Authorization: Bearer <tu-token>
```

### Paso 3: Ver evaluaciones por tipo
```bash
GET http://localhost:3000/evaluaciones/tipo/1
Authorization: Bearer <tu-token>
```

## 📊 Primer Uso - Personal Administrativo

### Paso 1: Ver estadísticas generales
```bash
GET http://localhost:3000/evaluaciones/estadisticas
Authorization: Bearer <tu-token>
```

### Paso 2: Ver historial
```bash
GET http://localhost:3000/evaluaciones/historial?limite=10
Authorization: Bearer <tu-token>
```

### Paso 3: Filtrar por tipo
```bash
GET http://localhost:3000/evaluaciones/historial?id_tipo_evaluacion=1
Authorization: Bearer <tu-token>
```

## 🔧 Importar Colección en Postman

1. Abre Postman
2. Click en "Import"
3. Selecciona el archivo: `src/evaluaciones/Evaluaciones.postman_collection.json`
4. Configura las variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: Tu token de autenticación

## 🧪 Probar con Thunder Client (VS Code)

1. Instala la extensión "Thunder Client" en VS Code
2. Click en "Collections"
3. Import -> Selecciona `Evaluaciones.postman_collection.json`
4. Actualiza las variables de entorno

## 🐛 Solución de Problemas Comunes

### Error: "Tipo de evaluación no encontrado"
**Solución:** Crea tipos de evaluación primero usando el módulo `tipo-evaluacion`

```bash
POST http://localhost:3000/tipo-evaluacion
{
  "nombre": "Examen",
  "activo": true
}
```

### Error: "Unauthorized"
**Solución:** Verifica que tu token sea válido:
1. Obtén un nuevo token con login
2. Asegúrate de incluir "Bearer " antes del token
3. Verifica que tu usuario tenga el rol adecuado

### Error: "Ya existe una evaluación con ese nombre"
**Solución:** Los nombres deben ser únicos por tipo de evaluación. Usa un nombre diferente o actualiza la existente.

### Error: "No se puede eliminar porque tiene notas asociadas"
**Solución:** Esta evaluación ya tiene calificaciones registradas. No se puede eliminar para mantener la integridad de los datos históricos.

## 📱 Swagger Documentation

El módulo está documentado en Swagger. Accede a:

```
http://localhost:3000/api
```

Busca la sección "Evaluaciones" para ver todos los endpoints con ejemplos interactivos.

## 🔐 Roles y Permisos

### Orientador
- ✅ Crear evaluaciones
- ✅ Ver evaluaciones
- ✅ Actualizar evaluaciones
- ✅ Eliminar evaluaciones
- ❌ Ver historial completo (solo sus evaluaciones)

### Personal Administrativo (P.A)
- ❌ Crear evaluaciones
- ✅ Ver evaluaciones
- ❌ Actualizar evaluaciones
- ❌ Eliminar evaluaciones
- ✅ Ver historial completo
- ✅ Ver estadísticas

### Admin
- ✅ Acceso completo a todas las funcionalidades

## 📋 Checklist de Verificación

Antes de usar en producción, verifica:

- [ ] Tipos de evaluación creados y activos
- [ ] Usuarios con roles correctos asignados
- [ ] Base de datos configurada correctamente
- [ ] Variables de entorno configuradas
- [ ] Token de autenticación funcionando
- [ ] Endpoints respondiendo correctamente
- [ ] Permisos por rol funcionando

## 🎓 Flujo de Trabajo Recomendado

### Para el Orientador:
1. **Inicio de Trimestre:**
   - Revisar tipos de evaluación disponibles
   - Crear evaluaciones del trimestre
   - Verificar que todas estén creadas correctamente

2. **Durante el Trimestre:**
   - Consultar evaluaciones cuando sea necesario
   - Actualizar puntajes si hay cambios
   - Verificar que las notas se registren correctamente

3. **Fin de Trimestre:**
   - Revisar que todas las evaluaciones tengan notas
   - No eliminar evaluaciones con datos

### Para Personal Administrativo:
1. **Seguimiento:**
   - Consultar historial semanalmente
   - Revisar estadísticas generales
   - Identificar evaluaciones sin notas

2. **Reportes:**
   - Generar reportes por período
   - Comparar estadísticas entre trimestres
   - Analizar promedio por tipo de evaluación

## 📞 Contacto y Soporte

Para dudas o problemas:
1. Revisa la documentación en `README.md`
2. Consulta los ejemplos en `EJEMPLOS-USO.md`
3. Verifica el `RESUMEN-IMPLEMENTACION.md`

## 🎉 ¡Listo para Usar!

El módulo está completamente configurado y listo para usar. Empieza creando tu primera evaluación siguiendo los pasos de "Primer Uso - Orientador".

**¡Éxito con tu implementación! 🚀**
