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
export class BachilleratoEvaluacionStrategy implements EvaluacionStrategy {
  obtenerConfiguracion(): ConfiguracionEvaluacion {
    return {
      nivel: NivelEducativo.BACHILLERATO,
      numeroPeriodos: 4,
      nombresPeriodos: ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'],
      componentesEvaluacion: [
        {
          nombre: 'Actividades Integradoras',
          porcentaje: 0.25,
          tipo: 'ACTIVIDAD',
          categorias: ['ACTIVIDAD_INTEGRADORA'],
        },
        {
          nombre: 'Tarea',
          porcentaje: 0.05,
          tipo: 'ACTIVIDAD',
          categorias: ['TAREA'],
        },
        {
          nombre: 'Coevaluación',
          porcentaje: 0.05,
          tipo: 'ACTIVIDAD',
          categorias: ['COEVALUACION'],
        },
        {
          nombre: 'Laboratorio/Práctico',
          porcentaje: 0.1,
          tipo: 'ACTIVIDAD',
          categorias: ['LABORATORIO'],
        },
        {
          nombre: 'Examen Parcial',
          porcentaje: 0.25,
          tipo: 'EXAMEN',
        },
        {
          nombre: 'Examen del Periodo',
          porcentaje: 0.3,
          tipo: 'EXAMEN',
        },
      ],
      porcentajesPeriodos: [0.25, 0.25, 0.25, 0.25], // Todos los periodos valen igual
    };
  }

  calcularNotaPeriodo(
    actividades: ActividadParaCalculo[],
    examenes: ExamenesDto,
  ): ResultadoCalculo {
    // Validar que haya actividades y examen parcial
    if (!actividades || actividades.length === 0) {
      throw new Error(
        'Debe haber al menos una actividad para calcular la nota',
      );
    }

    if (
      examenes.examen_parcial === undefined ||
      examenes.examen_parcial === null
    ) {
      throw new Error('El examen parcial es obligatorio para Bachillerato');
    }

    // Agrupar actividades por categoría
    const actIntegradoras = actividades.filter(
      (a) => a.categoria === 'ACTIVIDAD_INTEGRADORA',
    );
    const tareas = actividades.filter((a) => a.categoria === 'TAREA');
    const coevaluaciones = actividades.filter(
      (a) => a.categoria === 'COEVALUACION',
    );
    const laboratorios = actividades.filter(
      (a) => a.categoria === 'LABORATORIO',
    );

    // Calcular promedios por categoría
    const promActInt = this.promediar(actIntegradoras);
    const promTarea = this.promediar(tareas);
    const promCoev = this.promediar(coevaluaciones);
    const promLab = this.promediar(laboratorios);

    // Aplicar ponderaciones según Bachillerato:
    // Act.Int 25% + Tarea 5% + Coev 5% + Lab 10% + Ex.Parcial 25% + Ex.Periodo 30%
    const aporteActInt = promActInt * 0.25;
    const aporteTarea = promTarea * 0.05;
    const aporteCoev = promCoev * 0.05;
    const aporteLab = promLab * 0.1;
    const aporteExParcial = examenes.examen_parcial * 0.25;
    const aporteExPeriodo = examenes.examen_principal * 0.3;

    const notaPeriodo =
      aporteActInt +
      aporteTarea +
      aporteCoev +
      aporteLab +
      aporteExParcial +
      aporteExPeriodo;

    // Calcular promedio general de actividades para compatibilidad
    const promedioActividades = this.promediar(actividades);

    return {
      promedio_actividades: promedioActividades,
      aporte_actividades: aporteActInt + aporteTarea + aporteCoev + aporteLab,
      aporte_examen_principal: aporteExPeriodo,
      aporte_examen_parcial: aporteExParcial,
      nota_periodo: notaPeriodo,
      detalles: {
        formula:
          '(Act.Int × 25%) + (Tarea × 5%) + (Coev × 5%) + (Lab × 10%) + (Ex.Parcial × 25%) + (Ex.Periodo × 30%)',
        calculo: `(${promActInt.toFixed(2)} × 0.25) + (${promTarea.toFixed(2)} × 0.05) + (${promCoev.toFixed(2)} × 0.05) + (${promLab.toFixed(2)} × 0.10) + (${examenes.examen_parcial.toFixed(2)} × 0.25) + (${examenes.examen_principal.toFixed(2)} × 0.30) = ${notaPeriodo.toFixed(2)}`,
        componentesIndividuales: {
          actividadesIntegradoras: {
            promedio: promActInt,
            cantidad: actIntegradoras.length,
            aporte: aporteActInt,
          },
          tareas: {
            promedio: promTarea,
            cantidad: tareas.length,
            aporte: aporteTarea,
          },
          coevaluaciones: {
            promedio: promCoev,
            cantidad: coevaluaciones.length,
            aporte: aporteCoev,
          },
          laboratorios: {
            promedio: promLab,
            cantidad: laboratorios.length,
            aporte: aporteLab,
          },
          examenParcial: {
            nota: examenes.examen_parcial,
            aporte: aporteExParcial,
          },
          examenPeriodo: {
            nota: examenes.examen_principal,
            aporte: aporteExPeriodo,
          },
        },
      },
    };
  }

  calcularNotaAnual(periodos: NotaPeriodoParaCalculo[]): number {
    // En Bachillerato: promedio simple de 4 periodos (25% cada uno)
    if (periodos.length === 0) return 0;

    return (
      periodos.reduce((sum, p) => sum + p.nota_periodo, 0) / periodos.length
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

    // Validar que haya al menos una actividad de cada categoría
    const categorias = [
      'ACTIVIDAD_INTEGRADORA',
      'TAREA',
      'COEVALUACION',
      'LABORATORIO',
    ];
    const categoriasPresentes = new Set(
      actividades.map((a) => a.categoria).filter(Boolean),
    );

    for (const cat of categorias) {
      if (!categoriasPresentes.has(cat)) {
        const nombreAmigable = {
          ACTIVIDAD_INTEGRADORA: 'Actividades Integradoras',
          TAREA: 'Tareas',
          COEVALUACION: 'Coevaluaciones',
          LABORATORIO: 'Laboratorios/Prácticos',
        };
        errores.push(
          `Debe registrar al menos una actividad de tipo: ${nombreAmigable[cat]}`,
        );
      }
    }

    // Validar rangos de notas
    for (let i = 0; i < actividades.length; i++) {
      const act = actividades[i];
      if (act.nota < 0 || act.nota > 10) {
        errores.push(
          `Actividad ${i + 1}: La nota debe estar entre 0 y 10 (recibido: ${act.nota})`,
        );
      }

      if (!act.categoria) {
        errores.push(
          `Actividad ${i + 1}: Debe especificar la categoría (ACTIVIDAD_INTEGRADORA, TAREA, COEVALUACION, LABORATORIO)`,
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
      errores.push('Debe registrar el examen del periodo');
    } else if (
      examenes.examen_principal < 0 ||
      examenes.examen_principal > 10
    ) {
      errores.push(
        `El examen del periodo debe estar entre 0 y 10 (recibido: ${examenes.examen_principal})`,
      );
    }

    if (
      examenes.examen_parcial === undefined ||
      examenes.examen_parcial === null
    ) {
      errores.push(
        'Debe registrar el examen parcial (obligatorio para Bachillerato)',
      );
    } else if (examenes.examen_parcial < 0 || examenes.examen_parcial > 10) {
      errores.push(
        `El examen parcial debe estar entre 0 y 10 (recibido: ${examenes.examen_parcial})`,
      );
    }

    return {
      valido: errores.length === 0,
      errores: errores.length > 0 ? errores : undefined,
    };
  }

  obtenerNombrePeriodo(indice: number): string {
    if (indice < 1 || indice > 4) {
      return `Periodo ${indice}`;
    }
    return `Periodo ${indice}`;
  }

  obtenerPorcentajeAportePeriodo(periodo: number): number {
    // En Bachillerato todos los periodos valen 25%
    return periodo >= 1 && periodo <= 4 ? 0.25 : 0;
  }

  /**
   * Método auxiliar para calcular promedio
   */
  private promediar(actividades: ActividadParaCalculo[]): number {
    if (!actividades || actividades.length === 0) return 0;
    return (
      actividades.reduce((sum, act) => sum + act.nota, 0) / actividades.length
    );
  }
}
