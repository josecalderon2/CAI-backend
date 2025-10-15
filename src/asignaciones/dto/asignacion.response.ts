import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PersonaMini {
  @ApiProperty() id_orientador: number;
  @ApiProperty() nombreCompleto: string;
}

class AsignaturaMini {
  @ApiProperty() id_asignatura: number;
  @ApiProperty() nombre: string;
  @ApiPropertyOptional() orden_en_reporte?: string | null;
  @ApiPropertyOptional() horas_semanas?: number | null;
}

class CursoMini {
  @ApiProperty() id_curso: number;
  @ApiProperty() nombre: string;
  @ApiPropertyOptional() seccion?: string | null;
  @ApiPropertyOptional() id_orientador?: number | null;
  @ApiPropertyOptional({ type: () => PersonaMini, nullable: true })
  orientador?: PersonaMini | null;
}

export class AsignacionResponse {
  @ApiProperty() id_asignatura_orientador: number;

  @ApiProperty({ type: () => PersonaMini })
  docente: PersonaMini;

  @ApiProperty({ type: () => CursoMini })
  curso: CursoMini;

  @ApiProperty({ type: () => AsignaturaMini })
  asignatura: AsignaturaMini;

  @ApiProperty({ description: 'Horas/semana provenientes de Asignatura.horas_semanas' })
  cargaHorariaSemanal: number;

  @ApiProperty({ description: 'Fecha ISO de asignación (AsignaturaOrientador.fecha_asignacion)' })
  fechaAsignacion: string;

  @ApiProperty({ example: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO';

  @ApiProperty({ description: 'Si el docente es el orientador del curso' })
  esOrientador: boolean;

  @ApiPropertyOptional() anio_academico?: string | null;
}

export class PaginadoAsignaciones {
  @ApiProperty() page: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() total: number;
  @ApiProperty() count: number;
  @ApiProperty({ type: () => [AsignacionResponse] })
  data: AsignacionResponse[];
}
