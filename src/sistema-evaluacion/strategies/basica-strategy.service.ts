import { Injectable } from '@nestjs/common';
import {
  EvaluacionStrategy,
  ConfiguracionEvaluacion,
  ActividadParaCalculo,
  ExamenesDto,
  ResultadoCalculo,
  NotaPeriodoParaCalculo,
  NivelEducativo,
} from './evaluacion-strategy.interface';

@Injectable()
export class BasicaEvaluacionStrategy implements EvaluacionStrategy {
  // Configuración de ponderaciones mensuales por trimestre
  private readonly PONDERACIONES_MENSUALES = {
    1: { Febrero: 0.28, Marzo: 0.27, Abril: 0.45 },
    2: { Mayo: 0.28, Junio: 0.27, Julio: 0.45 },
    3: { Agosto: 0.28, Septiembre: 0.27, Octubre: 0.45 },
  };

  obtenerConfiguracion(): ConfiguracionEvaluacion {
    return {
      nivel: NivelEducativo.BASICA,
      numeroPeriodos: 3,
      nombresPeriodos: ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'],
      componentesEvaluacion: [
        // COMPONENTES MENSUALES (35% del total)
        {
          nombre: 'Tareas (Mensual)',
          porcentaje: 0.05,
          tipo: 'ACTIVIDAD',
        },
        {
          nombre: 'Revisión de libros y cuadernos (Mensual)',
          porcentaje: 0.15,
          tipo: 'ACTIVIDAD',
        },
        {
          nombre: 'Laboratorio escrito (Mensual)',
          porcentaje: 0.15,
          tipo: 'ACTIVIDAD',
        },
        // COMPONENTES TRIMESTRALES (65% del total)
        {
          nombre: 'Actividad Integradora (Trimestral)',
          porcentaje: 0.25,
          tipo: 'ACTIVIDAD',
        },
        {
          nombre: 'Autoevaluación (Trimestral)',
          porcentaje: 0.1,
          tipo: 'ACTIVIDAD',
        },
        {
          nombre: 'Examen (Trimestral)',
          porcentaje: 0.3,
          tipo: 'EXAMEN',
        },
      ],
      porcentajesPeriodos: this.PONDERACIONES_MENSUALES,
    };
  }

  calcularNotaPeriodo(
    actividades: ActividadParaCalculo[],
    examenes: ExamenesDto,
  ): ResultadoCalculo {
    // Validar que haya actividades
    if (!actividades || actividades.length === 0) {
      throw new Error(
        'Debe haber al menos una actividad para calcular la nota',
      );
    }

    // Agrupar actividades por categoría (nombre del componente)
    const actividadesPorComponente = new Map<string, number[]>();
    actividades.forEach((act) => {
      const categoria = act.categoria || 'Sin categoría';
      if (!actividadesPorComponente.has(categoria)) {
        actividadesPorComponente.set(categoria, []);
      }
      actividadesPorComponente.get(categoria)!.push(act.nota);
    });

    // Función auxiliar para calcular promedio
    const calcularPromedio = (valores: number[]): number => {
      if (valores.length === 0) return 0;
      return valores.reduce((sum, val) => sum + val, 0) / valores.length;
    };

    // ========== COMPONENTES MENSUALES (35% del total) ==========
    const notasTareas = actividadesPorComponente.get('Tareas (Mensual)') || [];
    const promedioTareas = calcularPromedio(notasTareas);
    const aporteTareas = promedioTareas * 0.05; // 5%

    const notasRevision =
      actividadesPorComponente.get(
        'Revisión de libros y cuadernos (Mensual)',
      ) || [];
    const promedioRevision = calcularPromedio(notasRevision);
    const aporteRevision = promedioRevision * 0.15; // 15%

    const notasLaboratorio =
      actividadesPorComponente.get('Laboratorio escrito (Mensual)') || [];
    const promedioLaboratorio = calcularPromedio(notasLaboratorio);
    const aporteLaboratorio = promedioLaboratorio * 0.15; // 15%

    const subtotalMensual = aporteTareas + aporteRevision + aporteLaboratorio; // 35%

    // ========== COMPONENTES TRIMESTRALES (65% del total) ==========
    const notasActIntegradora =
      actividadesPorComponente.get('Actividad Integradora (Trimestral)') || [];
    const promedioActIntegradora = calcularPromedio(notasActIntegradora);
    const aporteActIntegradora = promedioActIntegradora * 0.25; // 25%

    const notasAutoevaluacion =
      actividadesPorComponente.get('Autoevaluación (Trimestral)') || [];
    const promedioAutoevaluacion = calcularPromedio(notasAutoevaluacion);
    const aporteAutoevaluacion = promedioAutoevaluacion * 0.1; // 10%

    const aporteExamen = examenes.examen_principal * 0.3; // 30%

    const subtotalTrimestral =
      aporteActIntegradora + aporteAutoevaluacion + aporteExamen; // 65%

    // ========== NOTA FINAL DEL PERIODO ==========
    const notaPeriodo = subtotalMensual + subtotalTrimestral; // 100%

    return {
      promedio_actividades:
        (subtotalMensual + subtotalTrimestral - aporteExamen) / 0.7, // Para compatibilidad
      aporte_actividades:
        subtotalMensual + aporteActIntegradora + aporteAutoevaluacion,
      aporte_examen_principal: aporteExamen,
      nota_periodo: notaPeriodo,
      detalles: {
        formula:
          'MENSUAL (35%): Tareas 5% + Revisión 15% + Lab 15% | TRIMESTRAL (65%): Act.Int 25% + Autoeval 10% + Examen 30%',
        calculo: `Mensual: (${promedioTareas.toFixed(2)}×0.05 + ${promedioRevision.toFixed(2)}×0.15 + ${promedioLaboratorio.toFixed(2)}×0.15) = ${subtotalMensual.toFixed(2)} | Trimestral: (${promedioActIntegradora.toFixed(2)}×0.25 + ${promedioAutoevaluacion.toFixed(2)}×0.10 + ${examenes.examen_principal.toFixed(2)}×0.30) = ${subtotalTrimestral.toFixed(2)} | Total: ${notaPeriodo.toFixed(2)}`,
        subtotal_mensual: subtotalMensual,
        subtotal_trimestral: subtotalTrimestral,
        componentes_mensuales: {
          tareas: {
            promedio: promedioTareas,
            cantidad: notasTareas.length,
            aporte: aporteTareas,
          },
          revision: {
            promedio: promedioRevision,
            cantidad: notasRevision.length,
            aporte: aporteRevision,
          },
          laboratorio: {
            promedio: promedioLaboratorio,
            cantidad: notasLaboratorio.length,
            aporte: aporteLaboratorio,
          },
        },
        componentes_trimestrales: {
          actividad_integradora: {
            promedio: promedioActIntegradora,
            cantidad: notasActIntegradora.length,
            aporte: aporteActIntegradora,
          },
          autoevaluacion: {
            promedio: promedioAutoevaluacion,
            cantidad: notasAutoevaluacion.length,
            aporte: aporteAutoevaluacion,
          },
          examen: { nota: examenes.examen_principal, aporte: aporteExamen },
        },
      },
    };
  }

  calcularNotaAnual(periodos: NotaPeriodoParaCalculo[]): number {
    // Agrupar por trimestre
    const trimestres = new Map<number, NotaPeriodoParaCalculo[]>();

    for (const periodo of periodos) {
      if (!trimestres.has(periodo.periodo)) {
        trimestres.set(periodo.periodo, []);
      }
      const lista = trimestres.get(periodo.periodo);
      if (lista) {
        lista.push(periodo);
      }
    }

    // Calcular nota de cada trimestre aplicando ponderaciones mensuales
    const notasTrimestrales: number[] = [];

    for (let trim = 1; trim <= 3; trim++) {
      const mesesTrimestre = trimestres.get(trim) || [];
      if (mesesTrimestre.length === 0) continue;

      let notaTrimestre = 0;
      const ponderaciones = this.PONDERACIONES_MENSUALES[trim];

      for (const mes of mesesTrimestre) {
        const porcentaje = ponderaciones[mes.mes] || 0;
        notaTrimestre += mes.nota_periodo * porcentaje;
      }

      notasTrimestrales.push(notaTrimestre);
    }

    // Promedio simple de los 3 trimestres
    return (
      notasTrimestrales.reduce((sum, nota) => sum + nota, 0) /
      notasTrimestrales.length
    );
  }

  validarActividades(actividades: ActividadParaCalculo[]): {
    valido: boolean;
    errores?: string[];
  } {
    const errores: string[] = [];

    if (!actividades || actividades.length === 0) {
      errores.push('Debe registrar al menos una actividad');
    }

    for (let i = 0; i < actividades.length; i++) {
      const act = actividades[i];
      if (act.nota < 0 || act.nota > 10) {
        errores.push(
          `Actividad ${i + 1}: La nota debe estar entre 0 y 10 (recibido: ${act.nota})`,
        );
      }
    }

    return {
      valido: errores.length === 0,
      errores: errores.length > 0 ? errores : undefined,
    };
  }

  validarExamenes(examenes: ExamenesDto): {
    valido: boolean;
    errores?: string[];
  } {
    const errores: string[] = [];

    if (
      examenes.examen_principal === undefined ||
      examenes.examen_principal === null
    ) {
      errores.push('Debe registrar el examen mensual');
    } else if (
      examenes.examen_principal < 0 ||
      examenes.examen_principal > 10
    ) {
      errores.push(
        `El examen mensual debe estar entre 0 y 10 (recibido: ${examenes.examen_principal})`,
      );
    }

    if (
      examenes.examen_parcial !== undefined &&
      examenes.examen_parcial !== null
    ) {
      errores.push('El sistema de Educación Básica no utiliza examen parcial');
    }

    return {
      valido: errores.length === 0,
      errores: errores.length > 0 ? errores : undefined,
    };
  }

  obtenerNombrePeriodo(indice: number): string {
    // En Básica, los periodos son meses
    // Este método se usa para el nombre del mes dentro del trimestre
    const mesesPorTrimestre = {
      1: ['Febrero', 'Marzo', 'Abril'],
      2: ['Mayo', 'Junio', 'Julio'],
      3: ['Agosto', 'Septiembre', 'Octubre'],
    };

    // Si indice está entre 1-3, es trimestre, retornar primer mes
    if (indice >= 1 && indice <= 3) {
      return mesesPorTrimestre[indice][0];
    }

    return `Mes ${indice}`;
  }

  obtenerPorcentajeAportePeriodo(periodo: number, mes?: string): number {
    if (!mes || periodo < 1 || periodo > 3) {
      return 0;
    }

    const ponderaciones = this.PONDERACIONES_MENSUALES[periodo];
    return ponderaciones[mes] || 0;
  }
}
