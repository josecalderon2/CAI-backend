import { ApiProperty } from '@nestjs/swagger';

export class EvaluacionPendienteDto {
  @ApiProperty({ description: 'Tipo de evaluación pendiente' })
  tipo: string;

  @ApiProperty({ description: 'Trimestre (si aplica)', required: false })
  trimestre?: number;

  @ApiProperty({ description: 'Periodo (si aplica)', required: false })
  periodo?: number;

  @ApiProperty({ description: 'Mes (si aplica)', required: false })
  mes?: number;

  @ApiProperty({ description: 'Año académico' })
  anioAcademico: string;
}

export class AlumnoSinCalificarDto {
  @ApiProperty({ description: 'ID del alumno' })
  id_alumno: number;

  @ApiProperty({ description: 'Nombre completo del alumno' })
  nombreCompleto: string;

  @ApiProperty({
    description:
      'Evaluaciones pendientes de calificar con información detallada',
    type: [EvaluacionPendienteDto],
  })
  evaluacionesPendientes: EvaluacionPendienteDto[];

  @ApiProperty({
    description: 'Motivo por el cual no tiene calificaciones (opcional)',
    required: false,
  })
  motivo?: string;
}

export class EvaluacionFaltanteDto {
  @ApiProperty({ description: 'Nombre del tipo de evaluación faltante' })
  tipoEvaluacion: string;

  @ApiProperty({ description: 'Cantidad esperada' })
  esperadas: number;

  @ApiProperty({ description: 'Cantidad creada' })
  creadas: number;
}

export class AdvertenciaCierreDto {
  @ApiProperty({
    description: 'Tipo de advertencia',
    enum: [
      'EVALUACIONES_FALTANTES',
      'ALUMNOS_SIN_CALIFICAR',
      'SIN_PROMEDIOS_CALCULADOS',
    ],
  })
  tipo: string;

  @ApiProperty({ description: 'Mensaje descriptivo de la advertencia' })
  mensaje: string;

  @ApiProperty({
    description: 'Evaluaciones faltantes (si aplica)',
    type: [EvaluacionFaltanteDto],
    required: false,
  })
  evaluacionesFaltantes?: EvaluacionFaltanteDto[];

  @ApiProperty({
    description: 'Alumnos sin calificar (si aplica)',
    type: [AlumnoSinCalificarDto],
    required: false,
  })
  alumnosSinCalificar?: AlumnoSinCalificarDto[];
}

export class EstadisticasCierreDto {
  @ApiProperty({ description: 'Total de alumnos en el curso' })
  totalAlumnos: number;

  @ApiProperty({ description: 'Alumnos con todas las notas completas' })
  alumnosConTodasLasNotas: number;

  @ApiProperty({ description: 'Alumnos sin algunas notas' })
  alumnosSinNotas: number;

  @ApiProperty({ description: 'Total de evaluaciones que deberían existir' })
  totalEvaluacionesEsperadas: number;

  @ApiProperty({ description: 'Evaluaciones creadas' })
  evaluacionesCreadas: number;

  @ApiProperty({
    description: 'Total de calificaciones registradas',
  })
  totalCalificacionesRegistradas: number;

  @ApiProperty({
    description: 'Total de calificaciones esperadas',
  })
  totalCalificacionesEsperadas: number;
}

export class VerificacionCierreResponseDto {
  @ApiProperty({
    description:
      'Indica si se puede cerrar las calificaciones sin advertencias críticas',
  })
  puedesCerrar: boolean;

  @ApiProperty({
    description:
      'Lista de advertencias encontradas (pueden ser informativas o críticas)',
    type: [AdvertenciaCierreDto],
  })
  advertencias: AdvertenciaCierreDto[];

  @ApiProperty({
    description: 'Estadísticas generales del estado de calificaciones',
    type: EstadisticasCierreDto,
  })
  estadisticas: EstadisticasCierreDto;

  @ApiProperty({
    description: 'Mensaje general sobre el estado',
  })
  mensaje: string;
}
