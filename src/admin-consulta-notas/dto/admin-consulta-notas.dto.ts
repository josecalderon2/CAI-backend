import { IsInt, IsString, IsOptional } from 'class-validator';

export class ObtenerEvaluacionesCursoDto {
  @IsInt()
  cursoId: number;

  @IsString()
  anioAcademico: string;

  @IsInt()
  @IsOptional()
  asignaturaId?: number;
}

export class ObtenerCalificacionesPorEvaluacionDto {
  @IsInt()
  evaluacionId: number;

  @IsString()
  anioAcademico: string;
}
