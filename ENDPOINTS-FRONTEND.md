# 📡 ENDPOINTS PARA EL FRONTEND - GUÍA COMPLETA

## El frontend NO debe calcular nada, solo consumir estos endpoints

---

## 🎯 ENDPOINTS DISPONIBLES

### 1️⃣ Obtener Promedios Mensuales (BÁSICA)

**Endpoint:**

```
GET /promedios/mensual/:alumnoId/:asignaturaId?anioAcademico=2025&trimestre=1
```

**Parámetros:**

- `alumnoId` (path): ID del alumno
- `asignaturaId` (path): ID de la asignatura
- `anioAcademico` (query): Año académico (requerido)
- `trimestre` (query): Trimestre específico (1, 2 o 3) - opcional

**Respuesta:**

```json
{
  "alumnoId": 4,
  "asignaturaId": 1,
  "anioAcademico": "2025",
  "trimestre": 1,
  "meses": [
    {
      "mes": 2,
      "trimestre": 1,
      "desglose": {
        "tareas": {
          "notas": [
            {
              "id_nota": 1,
              "calificacion": 8.2,
              "nombre_evaluacion": "Tarea - Febrero"
            }
          ],
          "promedio": 8.2,
          "peso": 0.05,
          "pesoNormalizado": 14.29,
          "contribucion": 1.17
        },
        "revisiones": {
          "notas": [...],
          "promedio": 8.2,
          "peso": 0.15,
          "pesoNormalizado": 42.86,
          "contribucion": 3.51
        },
        "laboratorios": {
          "notas": [...],
          "promedio": 8.2,
          "peso": 0.15,
          "pesoNormalizado": 42.86,
          "contribucion": 3.51
        }
      },
      "promedioMensual": 8.2,
      "formula": "PromMes = (0.05·Tareas + 0.15·Revisión + 0.15·Lab) / 0.35",
      "nota": "El promedio mensual está normalizado a escala de 10. Puede mostrarse como 100% en el frontend."
    },
    {
      "mes": 3,
      "trimestre": 1,
      "desglose": {...},
      "promedioMensual": 8.6
    },
    {
      "mes": 4,
      "trimestre": 1,
      "desglose": {...},
      "promedioMensual": 9.0
    }
  ],
  "resumen": {
    "totalMeses": 3,
    "promedioGeneral": 8.6
  }
}
```

**Uso en Frontend:**

```typescript
// Obtener todos los meses del trimestre 1
const response = await fetch(
  `/promedios/mensual/4/1?anioAcademico=2025&trimestre=1`,
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);
const data = await response.json();

// Mostrar cada mes
data.meses.forEach((mes) => {
  console.log(`Mes ${mes.mes}: ${mes.promedioMensual}`);
  console.log(
    `  Tareas (${mes.desglose.tareas.pesoNormalizado}%): ${mes.desglose.tareas.promedio}`,
  );
  console.log(
    `  Revisiones (${mes.desglose.revisiones.pesoNormalizado}%): ${mes.desglose.revisiones.promedio}`,
  );
  console.log(
    `  Laboratorios (${mes.desglose.laboratorios.pesoNormalizado}%): ${mes.desglose.laboratorios.promedio}`,
  );
});
```

---

### 2️⃣ Obtener Promedios Trimestrales (BÁSICA)

**Endpoint:**

```
GET /promedios/trimestral/:alumnoId/:asignaturaId?anioAcademico=2025&trimestre=1
```

**Parámetros:**

- `alumnoId` (path): ID del alumno
- `asignaturaId` (path): ID de la asignatura
- `anioAcademico` (query): Año académico (requerido)
- `trimestre` (query): Trimestre específico (1, 2 o 3) - opcional

**Respuesta:**

```json
{
  "alumnoId": 4,
  "asignaturaId": 1,
  "anioAcademico": "2025",
  "trimestres": [
    {
      "trimestre": 1,
      "bloques": {
        "mensual": {
          "pesoDelTrimestre": 35,
          "meses": [
            {
              "mes": 2,
              "promedio": 8.2,
              "pesoEnElBloque": 28,
              "contribucionAlBloque": 2.296
            },
            {
              "mes": 3,
              "promedio": 8.6,
              "pesoEnElBloque": 27,
              "contribucionAlBloque": 2.322
            },
            {
              "mes": 4,
              "promedio": 9.0,
              "pesoEnElBloque": 45,
              "contribucionAlBloque": 4.05
            }
          ],
          "promedioBloque": 8.668,
          "contribucionAlTrimestre": 3.034
        },
        "actividades": {
          "pesoDelTrimestre": 35,
          "actividades": [
            {
              "nombre": "Actividad Integradora",
              "calificacion": 9.5,
              "peso": 25,
              "contribucionAlTrimestre": 2.375
            },
            {
              "nombre": "Autoevaluación",
              "calificacion": 10.0,
              "peso": 10,
              "contribucionAlTrimestre": 1.0
            }
          ],
          "contribucionTotal": 3.375
        },
        "examen": {
          "pesoDelTrimestre": 30,
          "examen": {
            "nombre": "Examen Trimestral",
            "calificacion": 8.0,
            "peso": 30,
            "contribucionAlTrimestre": 2.4
          }
        }
      },
      "promedioTrimestral": 8.809,
      "aprobado": true,
      "formula": "Trimestre = 0.35·Meses + 0.25·ActInteg + 0.10·Autoeval + 0.30·Examen",
      "verificacion": {
        "sumaPorcentajes": "35% + 25% + 10% + 30% = 100%",
        "sumaContribuciones": 8.809
      }
    }
  ],
  "promedioAnual": 8.809
}
```

**Uso en Frontend:**

```typescript
const response = await fetch(`/promedios/trimestral/4/1?anioAcademico=2025`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await response.json();

// Mostrar cada trimestre
data.trimestres.forEach((t) => {
  console.log(`Trimestre ${t.trimestre}: ${t.promedioTrimestral}`);

  // Bloque Mensual (35%)
  console.log(`  Bloque Mensual (${t.bloques.mensual.pesoDelTrimestre}%):`);
  t.bloques.mensual.meses.forEach((m) => {
    console.log(`    Mes ${m.mes} (${m.pesoEnElBloque}%): ${m.promedio}`);
  });

  // Bloque Actividades (35%)
  console.log(
    `  Bloque Actividades (${t.bloques.actividades.pesoDelTrimestre}%):`,
  );
  t.bloques.actividades.actividades.forEach((a) => {
    console.log(`    ${a.nombre} (${a.peso}%): ${a.calificacion}`);
  });

  // Bloque Examen (30%)
  console.log(`  Bloque Examen (${t.bloques.examen.pesoDelTrimestre}%):`);
  console.log(
    `    ${t.bloques.examen.examen.nombre}: ${t.bloques.examen.examen.calificacion}`,
  );
});
```

---

### 3️⃣ Obtener Promedios por Periodo (BACHILLERATO)

**Endpoint:**

```
GET /promedios/periodo/:alumnoId/:asignaturaId?anioAcademico=2025&periodo=1
```

**Parámetros:**

- `alumnoId` (path): ID del alumno
- `asignaturaId` (path): ID de la asignatura
- `anioAcademico` (query): Año académico (requerido)
- `periodo` (query): Periodo específico (1, 2, 3 o 4) - opcional

**Respuesta:**

```json
{
  "alumnoId": 11,
  "asignaturaId": 3,
  "anioAcademico": "2025",
  "periodos": [
    {
      "periodo": 1,
      "rubros": [
        {
          "nombre": "Actividad Integradora",
          "calificacion": 9.0,
          "peso": 25,
          "contribucion": 2.25
        },
        {
          "nombre": "Tareas",
          "calificacion": 8.7,
          "peso": 5,
          "contribucion": 0.435,
          "notas": [
            {
              "id_nota": 100,
              "calificacion": 8.7,
              "nombre": "Tarea 1"
            }
          ]
        },
        {
          "nombre": "Coevaluación",
          "calificacion": 8.8,
          "peso": 5,
          "contribucion": 0.44
        },
        {
          "nombre": "Laboratorio",
          "calificacion": 8.8,
          "peso": 10,
          "contribucion": 0.88
        },
        {
          "nombre": "Examen Parcial",
          "calificacion": 7.5,
          "peso": 25,
          "contribucion": 1.875
        },
        {
          "nombre": "Examen del Periodo",
          "calificacion": 8.0,
          "peso": 30,
          "contribucion": 2.4
        }
      ],
      "promedioPeriodo": 8.28,
      "formula": "Periodo = 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParc + 0.30·ExPer",
      "verificacion": {
        "sumaPorcentajes": "25% + 5% + 5% + 10% + 25% + 30% = 100%",
        "sumaContribuciones": 8.28
      }
    }
  ],
  "promedioAnual": 8.28
}
```

**Uso en Frontend:**

```typescript
const response = await fetch(`/promedios/periodo/11/3?anioAcademico=2025`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await response.json();

// Mostrar cada periodo
data.periodos.forEach((p) => {
  console.log(`Periodo ${p.periodo}: ${p.promedioPeriodo}`);

  // Mostrar rubros
  p.rubros.forEach((r) => {
    console.log(`  ${r.nombre} (${r.peso}%): ${r.calificacion}`);

    // Si tiene múltiples notas (como Tareas)
    if (r.notas && r.notas.length > 0) {
      r.notas.forEach((n) => {
        console.log(`    - ${n.nombre}: ${n.calificacion}`);
      });
    }
  });
});
```

---

### 4️⃣ Obtener Desglose Completo del Alumno

**Endpoint:**

```
GET /promedios/desglose-completo/:alumnoId?anioAcademico=2025
```

**Parámetros:**

- `alumnoId` (path): ID del alumno
- `anioAcademico` (query): Año académico (requerido)

**Respuesta:**

```json
{
  "alumno": {
    "id": 4
  },
  "anioAcademico": "2025",
  "curso": {
    "id": 1,
    "nombre": "1° Primaria A",
    "gradoAcademico": "Primaria"
  },
  "sistema": "BASICA",
  "asignaturas": [
    {
      "asignatura": {
        "id": 1,
        "nombre": "Matemática I"
      },
      "sistema": "BASICA",
      "trimestres": [
        {
          "trimestre": 1,
          "bloques": {...},
          "promedioTrimestral": 8.809,
          "aprobado": true
        },
        {
          "trimestre": 2,
          "bloques": {...},
          "promedioTrimestral": 8.809,
          "aprobado": true
        },
        {
          "trimestre": 3,
          "bloques": {...},
          "promedioTrimestral": 8.809,
          "aprobado": true
        }
      ],
      "promedioAnual": 8.809
    },
    {
      "asignatura": {
        "id": 2,
        "nombre": "Lenguaje y Literatura"
      },
      "sistema": "BASICA",
      "trimestres": [...],
      "promedioAnual": 8.809
    }
  ],
  "promedioGeneral": 8.809
}
```

**Uso en Frontend:**

```typescript
const response = await fetch(
  `/promedios/desglose-completo/4?anioAcademico=2025`,
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);
const data = await response.json();

// Mostrar información del alumno
console.log(`Alumno ID: ${data.alumno.id}`);
console.log(`Curso: ${data.curso.nombre}`);
console.log(`Sistema: ${data.sistema}`);
console.log(`Promedio General: ${data.promedioGeneral}`);

// Mostrar cada asignatura
data.asignaturas.forEach((asig) => {
  console.log(`\nAsignatura: ${asig.asignatura.nombre}`);
  console.log(`Promedio Anual: ${asig.promedioAnual}`);

  if (asig.sistema === 'BASICA') {
    // Mostrar trimestres
    asig.trimestres.forEach((t) => {
      console.log(`  Trimestre ${t.trimestre}: ${t.promedioTrimestral}`);
    });
  } else {
    // Mostrar periodos
    asig.periodos.forEach((p) => {
      console.log(`  Periodo ${p.periodo}: ${p.promedioPeriodo}`);
    });
  }
});
```

---

## 🎨 COMPONENTES RECOMENDADOS PARA EL FRONTEND

### Componente 1: Vista Mensual (BÁSICA)

```typescript
interface PromediMensualComponentProps {
  alumnoId: number;
  asignaturaId: number;
  anioAcademico: string;
  trimestre: number;
}

function PromediMensualComponent({ alumnoId, asignaturaId, anioAcademico, trimestre }: Props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/promedios/mensual/${alumnoId}/${asignaturaId}?anioAcademico=${anioAcademico}&trimestre=${trimestre}`)
      .then(res => res.json())
      .then(setData);
  }, [alumnoId, asignaturaId, anioAcademico, trimestre]);

  if (!data) return <Loading />;

  return (
    <div>
      <h2>Promedios Mensuales - Trimestre {trimestre}</h2>
      {data.meses.map(mes => (
        <div key={mes.mes}>
          <h3>Mes {mes.mes}: {mes.promedioMensual.toFixed(2)}</h3>
          <ul>
            <li>
              Tareas ({mes.desglose.tareas.pesoNormalizado.toFixed(1)}%):
              {mes.desglose.tareas.promedio?.toFixed(2) || 'N/A'}
            </li>
            <li>
              Revisiones ({mes.desglose.revisiones.pesoNormalizado.toFixed(1)}%):
              {mes.desglose.revisiones.promedio?.toFixed(2) || 'N/A'}
            </li>
            <li>
              Laboratorios ({mes.desglose.laboratorios.pesoNormalizado.toFixed(1)}%):
              {mes.desglose.laboratorios.promedio?.toFixed(2) || 'N/A'}
            </li>
          </ul>
          <p><small>{mes.nota}</small></p>
        </div>
      ))}
    </div>
  );
}
```

### Componente 2: Vista Trimestral (BÁSICA)

```typescript
function PromediTrimestralComponent({ alumnoId, asignaturaId, anioAcademico }: Props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/promedios/trimestral/${alumnoId}/${asignaturaId}?anioAcademico=${anioAcademico}`)
      .then(res => res.json())
      .then(setData);
  }, [alumnoId, asignaturaId, anioAcademico]);

  if (!data) return <Loading />;

  return (
    <div>
      <h2>Promedios Trimestrales</h2>
      <p>Promedio Anual: {data.promedioAnual.toFixed(2)}</p>

      {data.trimestres.map(t => (
        <div key={t.trimestre}>
          <h3>Trimestre {t.trimestre}: {t.promedioTrimestral.toFixed(2)}</h3>

          {/* Bloque Mensual */}
          <div>
            <h4>Bloque Mensual ({t.bloques.mensual.pesoDelTrimestre}%)</h4>
            <ul>
              {t.bloques.mensual.meses.map(m => (
                <li key={m.mes}>
                  Mes {m.mes} ({m.pesoEnElBloque}%): {m.promedio.toFixed(2)}
                </li>
              ))}
            </ul>
            <p>Contribución: {t.bloques.mensual.contribucionAlTrimestre.toFixed(3)}</p>
          </div>

          {/* Bloque Actividades */}
          <div>
            <h4>Bloque Actividades ({t.bloques.actividades.pesoDelTrimestre}%)</h4>
            <ul>
              {t.bloques.actividades.actividades.map(a => (
                <li key={a.nombre}>
                  {a.nombre} ({a.peso}%): {a.calificacion.toFixed(2)}
                </li>
              ))}
            </ul>
            <p>Contribución: {t.bloques.actividades.contribucionTotal.toFixed(3)}</p>
          </div>

          {/* Bloque Examen */}
          <div>
            <h4>Bloque Examen ({t.bloques.examen.pesoDelTrimestre}%)</h4>
            <p>{t.bloques.examen.examen.nombre}: {t.bloques.examen.examen.calificacion.toFixed(2)}</p>
            <p>Contribución: {t.bloques.examen.examen.contribucionAlTrimestre.toFixed(3)}</p>
          </div>

          <p><small>{t.formula}</small></p>
          <p><small>Verificación: {t.verificacion.sumaPorcentajes}</small></p>
        </div>
      ))}
    </div>
  );
}
```

### Componente 3: Vista Periodo (BACHILLERATO)

```typescript
function PromedioPeriodoComponent({ alumnoId, asignaturaId, anioAcademico }: Props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/promedios/periodo/${alumnoId}/${asignaturaId}?anioAcademico=${anioAcademico}`)
      .then(res => res.json())
      .then(setData);
  }, [alumnoId, asignaturaId, anioAcademico]);

  if (!data) return <Loading />;

  return (
    <div>
      <h2>Promedios por Periodo</h2>
      <p>Promedio Anual: {data.promedioAnual.toFixed(2)}</p>

      {data.periodos.map(p => (
        <div key={p.periodo}>
          <h3>Periodo {p.periodo}: {p.promedioPeriodo.toFixed(2)}</h3>

          <table>
            <thead>
              <tr>
                <th>Rubro</th>
                <th>Peso</th>
                <th>Calificación</th>
                <th>Contribución</th>
              </tr>
            </thead>
            <tbody>
              {p.rubros.map(r => (
                <tr key={r.nombre}>
                  <td>{r.nombre}</td>
                  <td>{r.peso}%</td>
                  <td>{r.calificacion.toFixed(2)}</td>
                  <td>{r.contribucion.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p><small>{p.formula}</small></p>
          <p><small>Verificación: {p.verificacion.sumaPorcentajes}</small></p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 REGLAS DE ORO PARA EL FRONTEND

1. ✅ **NUNCA calcules porcentajes manualmente**
2. ✅ **Siempre usa los endpoints del backend**
3. ✅ **Muestra los datos tal como vienen**
4. ✅ **Usa los campos `pesoNormalizado` o `peso` según corresponda**
5. ✅ **Verifica que `sumaPorcentajes` siempre sea 100%**
6. ✅ **No dividas ni multipliques los porcentajes**
7. ✅ **Solo formatea números (toFixed) para mostrar**

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Implementar componente para vista mensual (BÁSICA)
- [ ] Implementar componente para vista trimestral (BÁSICA)
- [ ] Implementar componente para vista periodo (BACHILLERATO)
- [ ] Implementar vista de desglose completo
- [ ] Agregar manejo de errores (401, 404, etc.)
- [ ] Agregar estados de carga
- [ ] Verificar que los porcentajes siempre sumen 100%
- [ ] Probar con datos reales
- [ ] Validar con el documento oficial

---

Con estos endpoints, el frontend **NUNCA** debe calcular nada.
Solo debe **CONSUMIR** y **MOSTRAR** los datos que el backend ya calculó correctamente. 🎯
