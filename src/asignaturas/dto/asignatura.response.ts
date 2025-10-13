import { ApiProperty } from '@nestjs/swagger';


class MetodoEvaluacionResponse {
  @ApiProperty()
  id_metodo_evaluacion: number;

  @ApiProperty()
  nombre: string;
}

class TipoAsignaturaResponse {
  @ApiProperty()
  id_tipo_asignatura: number;

  @ApiProperty()
  nombre: string;
}

class SistemaEvaluacionResponse {
  @ApiProperty()
  id_sistema_evaluacion: number;

  @ApiProperty()
  nombre: string;
  
  @ApiProperty()
  etapas: number;
}

class CursoResponse {
  @ApiProperty()
  id_curso: number;

  @ApiProperty()
  nombre: string;
  
  @ApiProperty({ required: false, nullable: true })
  seccion?: string;
}



export class AsignaturaResponse {
  @ApiProperty({ description: 'El ID único de la asignatura' })
  id_asignatura: number;

  @ApiProperty({ description: 'Nombre de la asignatura', example: 'Álgebra Lineal' })
  nombre: string;

  @ApiProperty({ description: 'Orden en el reporte de notas', required: false, nullable: true })
  orden_en_reporte?: string;

  @ApiProperty({ description: 'Horas por semana', required: false, nullable: true })
  horas_semanas?: number;

  @ApiProperty({ description: 'ID del método de evaluación', required: false, nullable: true })
  id_metodo_evaluacion?: number;

  @ApiProperty({ description: 'ID del tipo de asignatura', required: false, nullable: true })
  id_tipo_asignatura?: number;

  @ApiProperty({ description: 'ID del sistema de evaluación', required: false, nullable: true })
  id_sistema_evaluacion?: number;

  @ApiProperty({ description: 'ID del curso asociado', required: false, nullable: true })
  id_curso?: number;
  
  @ApiProperty({ description: 'Indica si la asignatura está activa', default: true })
  activo: boolean;
  
  @ApiProperty({ type: MetodoEvaluacionResponse, required: false, nullable: true })
  metodoEvaluacion?: MetodoEvaluacionResponse;

  @ApiProperty({ type: TipoAsignaturaResponse, required: false, nullable: true })
  tipoAsignatura?: TipoAsignaturaResponse;

  @ApiProperty({ type: SistemaEvaluacionResponse, required: false, nullable: true })
  sistemaEvaluacion?: SistemaEvaluacionResponse;

  @ApiProperty({ type: CursoResponse, required: false, nullable: true })
  curso?: CursoResponse;
}