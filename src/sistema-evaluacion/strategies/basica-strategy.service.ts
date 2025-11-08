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
        {
          nombre: 'Actividades de Aprendizaje',
          porcentaje: 0.7,
          tipo: 'ACTIVIDAD',
        },
        {
          nombre: 'Examen Mensual',
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

    // Calcular promedio simple de actividades
    const promedioActividades =
      actividades.reduce((sum, act) => sum + act.nota, 0) / actividades.length;

    // Aplicar ponderaciones: 70% actividades + 30% examen
    const aporte70 = promedioActividades * 0.7;
    const aporte30 = examenes.examen_principal * 0.3;
    const notaPeriodo = aporte70 + aporte30;

    return {
      promedio_actividades: promedioActividades,
      aporte_actividades: aporte70,
      aporte_examen_principal: aporte30,
      nota_periodo: notaPeriodo,
      detalles: {
        formula: '(Promedio Actividades × 70%) + (Examen × 30%)',
        calculo: `(${promedioActividades.toFixed(2)} × 0.70) + (${examenes.examen_principal.toFixed(2)} × 0.30) = ${notaPeriodo.toFixed(2)}`,
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
