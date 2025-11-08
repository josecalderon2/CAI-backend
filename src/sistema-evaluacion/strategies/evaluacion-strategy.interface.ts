/**
 * Interfaz para las estrategias de evaluación
 * Define el contrato que deben cumplir tanto Básica como Bachillerato
 */

// Enum temporal hasta que se ejecute la migración de Prisma
export enum NivelEducativo {
  BASICA = 'BASICA',
  BACHILLERATO = 'BACHILLERATO',
}

export interface ComponenteEvaluacion {
  nombre: string;
  porcentaje: number;
  tipo: 'ACTIVIDAD' | 'EXAMEN';
  categorias?: string[]; // Para agrupar tipos de actividades en Bachillerato
}

export interface ConfiguracionEvaluacion {
  nivel: NivelEducativo;
  numeroPeriodos: number;
  nombresPeriodos: string[];
  componentesEvaluacion: ComponenteEvaluacion[];
  porcentajesPeriodos: any; // Puede ser array simple o array de objetos según el nivel
}

export interface ActividadParaCalculo {
  nota: number;
  categoria?: string; // Para Bachillerato
}

export interface ExamenesDto {
  examen_principal: number;
  examen_parcial?: number; // Solo para Bachillerato
}

export interface ResultadoCalculo {
  promedio_actividades: number;
  aporte_actividades: number;
  aporte_examen_principal: number;
  aporte_examen_parcial?: number; // Solo para Bachillerato
  nota_periodo: number;
  detalles?: any; // Información adicional específica del nivel
}

/**
 * Interfaz principal que deben implementar las estrategias
 */
export interface EvaluacionStrategy {
  /**
   * Retorna la configuración del sistema de evaluación
   */
  obtenerConfiguracion(): ConfiguracionEvaluacion;

  /**
   * Calcula la nota de un periodo/mes basándose en actividades y exámenes
   */
  calcularNotaPeriodo(
    actividades: ActividadParaCalculo[],
    examenes: ExamenesDto,
  ): ResultadoCalculo;

  /**
   * Calcula la nota anual basándose en las notas de los periodos
   */
  calcularNotaAnual(periodos: NotaPeriodoParaCalculo[]): number;

  /**
   * Valida que las actividades sean correctas para este nivel
   */
  validarActividades(actividades: ActividadParaCalculo[]): {
    valido: boolean;
    errores?: string[];
  };

  /**
   * Valida que los exámenes sean correctos para este nivel
   */
  validarExamenes(examenes: ExamenesDto): {
    valido: boolean;
    errores?: string[];
  };

  /**
   * Retorna el nombre del periodo según el índice
   * Ej: 1 -> "Febrero" (Básica) o "Periodo 1" (Bachillerato)
   */
  obtenerNombrePeriodo(indice: number): string;

  /**
   * Retorna el porcentaje de aporte del periodo a la nota anual
   */
  obtenerPorcentajeAportePeriodo(periodo: number, mes?: string): number;
}

export interface NotaPeriodoParaCalculo {
  nota_periodo: number;
  periodo: number;
  mes?: string; // Para Básica (identificar Febrero, Marzo, etc.)
}
