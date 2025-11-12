import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCalculoTrimestral() {
  console.log('🧮 PROBANDO CÁLCULO TRIMESTRAL CON FÓRMULA CORREGIDA\n');

  // Datos de ejemplo (mismos que en el script de notas)
  const promedioFeb = 8.2;
  const promedioMar = 8.6;
  const promedioAbr = 9.0;

  const actividadIntegradora = 9.5;
  const autoevaluacion = 10.0;
  const examenTrimestral = 8.0;

  console.log('📊 PROMEDIO MENSUALES:');
  console.log(`  Febrero: ${promedioFeb}`);
  console.log(`  Marzo: ${promedioMar}`);
  console.log(`  Abril: ${promedioAbr}\n`);

  console.log('📝 EVALUACIONES TRIMESTRALES:');
  console.log(`  Actividad Integradora: ${actividadIntegradora}`);
  console.log(`  Autoevaluación: ${autoevaluacion}`);
  console.log(`  Examen Trimestral: ${examenTrimestral}\n`);

  // Paso 1: Ponderar meses (28% - 27% - 45%)
  const promedioMeses =
    0.28 * promedioFeb + 0.27 * promedioMar + 0.45 * promedioAbr;

  console.log('📐 CÁLCULO:');
  console.log(
    `  Paso 1 - Meses ponderados: 0.28×${promedioFeb} + 0.27×${promedioMar} + 0.45×${promedioAbr}`,
  );
  console.log(
    `           = ${(0.28 * promedioFeb).toFixed(3)} + ${(0.27 * promedioMar).toFixed(3)} + ${(0.45 * promedioAbr).toFixed(3)}`,
  );
  console.log(`           = ${promedioMeses.toFixed(3)}\n`);

  // Paso 2: Calcular contribución de actividades (SIN normalizar)
  const contribucionActividades =
    0.25 * actividadIntegradora + 0.1 * autoevaluacion;

  console.log(
    `  Paso 2 - Actividades: 0.25×${actividadIntegradora} + 0.10×${autoevaluacion}`,
  );
  console.log(
    `           = ${(0.25 * actividadIntegradora).toFixed(3)} + ${(0.1 * autoevaluacion).toFixed(3)}`,
  );
  console.log(`           = ${contribucionActividades.toFixed(3)}\n`);

  // Paso 3: Calcular contribución del examen
  const contribucionExamen = 0.3 * examenTrimestral;

  console.log(`  Paso 3 - Examen: 0.30×${examenTrimestral}`);
  console.log(`           = ${contribucionExamen.toFixed(3)}\n`);

  // Paso 4: Fórmula ANTIGUA (incorrecta - normalizando actividades)
  console.log('❌ FÓRMULA ANTIGUA (INCORRECTA):');
  const promedioActividadesNormalizado = contribucionActividades / 0.35;
  const promedioTrimestreAntiguo =
    0.35 * promedioMeses +
    0.35 * promedioActividadesNormalizado +
    0.3 * examenTrimestral;
  console.log(
    `  Trimestre = 0.35×${promedioMeses.toFixed(2)} + 0.35×(${contribucionActividades.toFixed(2)}/0.35) + 0.30×${examenTrimestral}`,
  );
  console.log(
    `            = 0.35×${promedioMeses.toFixed(2)} + 0.35×${promedioActividadesNormalizado.toFixed(2)} + 0.30×${examenTrimestral}`,
  );
  console.log(
    `            = ${(0.35 * promedioMeses).toFixed(3)} + ${(0.35 * promedioActividadesNormalizado).toFixed(3)} + ${(0.3 * examenTrimestral).toFixed(3)}`,
  );
  console.log(`            = ${promedioTrimestreAntiguo.toFixed(3)} ❌\n`);

  // Paso 5: Fórmula NUEVA (correcta - según documento oficial)
  console.log('✅ FÓRMULA NUEVA (CORRECTA):');
  const promedioTrimestreNuevo =
    0.35 * promedioMeses + contribucionActividades + 0.3 * examenTrimestral;
  console.log(
    `  Trimestre = 0.35×${promedioMeses.toFixed(2)} + ${contribucionActividades.toFixed(2)} + 0.30×${examenTrimestral}`,
  );
  console.log(
    `            = ${(0.35 * promedioMeses).toFixed(3)} + ${contribucionActividades.toFixed(2)} + ${(0.3 * examenTrimestral).toFixed(3)}`,
  );
  console.log(`            = ${promedioTrimestreNuevo.toFixed(3)} ✅\n`);

  console.log('📊 RESUMEN:');
  console.log(`  Fórmula antigua: ${promedioTrimestreAntiguo.toFixed(2)}`);
  console.log(`  Fórmula nueva:   ${promedioTrimestreNuevo.toFixed(2)}`);
  console.log(
    `  Diferencia:      ${Math.abs(promedioTrimestreNuevo - promedioTrimestreAntiguo).toFixed(2)}\n`,
  );

  console.log('✅ VERIFICACIÓN DE PORCENTAJES:');
  console.log(`  Meses: 35%`);
  console.log(`  Actividad Integradora: 25%`);
  console.log(`  Autoevaluación: 10%`);
  console.log(`  Examen: 30%`);
  console.log(`  TOTAL: 100% ✅`);
}

testCalculoTrimestral()
  .catch((error) => {
    console.error('Error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
