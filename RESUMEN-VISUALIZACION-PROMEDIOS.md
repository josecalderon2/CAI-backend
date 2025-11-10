# 🎯 RESUMEN: VISUALIZACIÓN DE DATOS CON PROMEDIOS - BÁSICA 2025

**Fecha:** 9 de noviembre de 2025

---

## ✅ RESPUESTA A TU PREGUNTA

> **"¿Hay algún método que muestre esos datos y los promedios para cargarlo en el front?"**

**Respuesta:** SÍ y NO.

### ❌ **NO hay un endpoint específico que devuelva los promedios calculados del NUEVO sistema BÁSICA 2025**

Los endpoints actuales (`/notas/simplificadas`, `/consolidado-mensual-alumno`) devuelven datos pero calculados con el formato VIEJO (70% actividades + 30% examen).

### ✅ **PERO PUEDES calcular los promedios en el frontend fácilmente**

La mejor solución es:

1. **Usar el endpoint de formato** para obtener la estructura:

   ```
   GET /sistema-evaluacion/formato-evaluacion/asignatura/1
   ```

   ✅ Este endpoint SÍ devuelve la estructura correcta del BÁSICA 2025

2. **Usar el endpoint de notas** para obtener las notas guardadas:

   ```
   GET /sistema-evaluacion/notas/simplificadas?alumno_id=1&asignatura_id=1&mes=11&anio=2025
   ```

   ✅ Este endpoint devuelve todas las notas guardadas

3. **Calcular los promedios en el frontend** usando JavaScript:
   ```javascript
   // Ver el Script 3 en DATOS-PRUEBA-FRONTEND-BASICA-2025.md
   ```

---

## 📊 EJEMPLO COMPLETO DE FLUJO

### **Paso 1: Al cargar el formulario**

```javascript
// Obtener estructura de componentes
const formato = await fetch(
  '/sistema-evaluacion/formato-evaluacion/asignatura/1',
).then((r) => r.json());

// formato.componentes contiene los 6 componentes con sus porcentajes
```

### **Paso 2: Mientras el usuario ingresa notas**

```javascript
// Guardar cada nota individualmente
await fetch('/sistema-evaluacion/notas/simplificadas', {
  method: 'POST',
  body: JSON.stringify({
    asignatura_id: 1,
    alumno_id: 1,
    tipo_actividad: 'Tareas (Mensual)',
    nota: 8.5,
    mes: 11,
    anio: 2025,
    periodo: 3,
  }),
});

// Mantener un estado local con las notas
setNotasLocales((prev) => ({
  ...prev,
  'Tareas (Mensual)': [...prev['Tareas (Mensual)'], 8.5],
}));
```

### **Paso 3: Calcular y mostrar promedios en tiempo real**

```javascript
// Calcular promedio de cada componente
const promedioTareas =
  notasLocales['Tareas (Mensual)'].reduce((a, b) => a + b, 0) /
  notasLocales['Tareas (Mensual)'].length;

// Calcular aporte
const aporteTareas = promedioTareas * 0.05; // 5%

// Calcular subtotal mensual
const subtotal_mensual =
  promedioTareas * 0.05 + promedioRevision * 0.15 + promedioLab * 0.15;

// Calcular subtotal trimestral
const subtotal_trimestral =
  promedioActInt * 0.25 + promedioAutoeval * 0.1 + notaExamen * 0.3;

// Nota final
const nota_final = subtotal_mensual + subtotal_trimestral;
```

### **Paso 4: Mostrar resultados**

```javascript
return (
  <div>
    <h3>Componentes Mensuales (35%)</h3>
    <p>
      Tareas: Promedio {promedioTareas} → Aporte {aporteTareas}
    </p>
    <p>
      Revisión: Promedio {promedioRevision} → Aporte {aporteRevision}
    </p>
    <p>
      Laboratorio: Promedio {promedioLab} → Aporte {aporteLab}
    </p>
    <strong>Subtotal Mensual: {subtotal_mensual}</strong>

    <h3>Componentes Trimestrales (65%)</h3>
    <p>
      Act. Integradora: {promedioActInt} → Aporte {aporteActInt}
    </p>
    <p>
      Autoevaluación: {promedioAutoeval} → Aporte {aporteAutoeval}
    </p>
    <p>
      Examen: {notaExamen} → Aporte {aporteExamen}
    </p>
    <strong>Subtotal Trimestral: {subtotal_trimestral}</strong>

    <h2>NOTA FINAL: {nota_final} / 10.0</h2>
  </div>
);
```

---

## 📂 DOCUMENTOS CREADOS

1. **`DATOS-PRUEBA-FRONTEND-BASICA-2025.md`**
   - Datos de prueba completos (alumno, notas, período)
   - Scripts bash para ingresar notas
   - Script JavaScript para calcular promedios
   - Casos de prueba y resultados esperados

2. **`ENDPOINTS-VISUALIZACION-DATOS-BASICA-2025.md`**
   - Documentación completa de todos los endpoints disponibles
   - Ejemplos de respuestas
   - Código de componente React completo
   - Función de cálculo de promedios y subtotales

---

## 🔑 CONCLUSIÓN

**No necesitas un endpoint especial del backend para visualizar los promedios.**

El frontend puede:

1. ✅ Obtener la estructura de componentes (`/formato-evaluacion/asignatura/:id`)
2. ✅ Guardar notas individuales (`POST /notas/simplificadas`)
3. ✅ Consultar notas guardadas (`GET /notas/simplificadas`)
4. ✅ **Calcular promedios y subtotales en JavaScript** (función proporcionada)
5. ✅ Mostrar los cálculos en tiempo real al usuario

**Ventajas de calcular en el frontend:**

- ⚡ Cálculos instantáneos (sin esperar al backend)
- 🔄 Actualización en tiempo real mientras el usuario ingresa datos
- 🎯 Control total sobre la visualización
- 💪 Backend solo se usa para persistencia

**¿Necesitas el código completo del componente React/Vue/Angular?**
👉 Ver `ENDPOINTS-VISUALIZACION-DATOS-BASICA-2025.md` sección "COMPONENTE REACT EJEMPLO"

---

## 🚀 PRÓXIMOS PASOS

1. Lee `DATOS-PRUEBA-FRONTEND-BASICA-2025.md` para datos de prueba
2. Copia la función `calcularPromediosYSubtotales()` de `ENDPOINTS-VISUALIZACION-DATOS-BASICA-2025.md`
3. Integra en tu componente del frontend
4. ¡Prueba con los datos de ejemplo!

**¿Listo para probar?** 🎯
