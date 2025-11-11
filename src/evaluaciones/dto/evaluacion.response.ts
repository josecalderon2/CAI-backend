import { ApiProperty } from '@nestjs/swagger';

class TipoEvaluacionResponse {
  @ApiProperty()
  id_tipo_evaluacion: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  porcentaje: number;
}

class AsignaturaResponse {
  @ApiProperty()
  id_asignatura: number;

  @ApiProperty()
  nombre: string;
}

class OrientadorResponse {
  @ApiProperty()
  id_orientador: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;
}

export class EvaluacionResponse {
  @ApiProperty()
  id_evaluacion: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  puntaje_maximo: number;

  @ApiProperty()
  puntaje_minimo: number;

  @ApiProperty()
  calificacion?: number;

  @ApiProperty()
  anio_academico: string;

  @ApiProperty({ required: false })
  mes?: number;

  @ApiProperty({ required: false })
  trimestre?: number;

  @ApiProperty({ required: false })
  periodo?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: TipoEvaluacionResponse })
  tipoEvaluacion: TipoEvaluacionResponse;

  @ApiProperty({ type: AsignaturaResponse })
  asignatura: AsignaturaResponse;

  @ApiProperty({ type: OrientadorResponse })
  orientador: OrientadorResponse;
}
