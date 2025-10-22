// dto/update-asignacion.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  IsNumber,
} from 'class-validator';

export class UpdateAsignacionDto {
  // --- AO (AsignaturaOrientador) ---
  @ApiPropertyOptional({
    description: 'Asignatura destino (misma materia pero otra fila/curso)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_asignatura?: number;

  @ApiPropertyOptional({ description: 'Docente (orientador) de la asignación' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_orientador?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anio_academico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha_asignacion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  // --- Asignatura (campos de tu SELECT) ---
  @ApiPropertyOptional({ description: 'Nombre de la asignatura (a.nombre)' })
  @IsOptional()
  @IsString()
  nombre_asignatura?: string;

  @ApiPropertyOptional({
    description: 'Horas/semana (a.horas_semanas es Float)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  cargaHorariaSemanal?: number;

  // --- Curso (campos de tu SELECT) ---
  @ApiPropertyOptional({
    description: 'Mover la asignatura al curso destino (c.id_curso)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_curso?: number;

  @ApiPropertyOptional({ description: 'Nombre del curso (c.nombre)' })
  @IsOptional()
  @IsString()
  curso_nombre?: string;

  @ApiPropertyOptional({ description: 'Sección del curso (c.seccion)' })
  @IsOptional()
  @IsString()
  seccion?: string;

  @ApiPropertyOptional({
    description: 'Orientador principal del curso (c.id_orientador)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  orientador_principal_id?: number;

  // --- Orientador (docente) nombres (de tu SELECT) ---
  @ApiPropertyOptional({ description: 'Nombre del docente (o.nombre)' })
  @IsOptional()
  @IsString()
  docente_nombre?: string;

  @ApiPropertyOptional({ description: 'Apellido del docente (o.apellido)' })
  @IsOptional()
  @IsString()
  docente_apellido?: string;

  // --- Control derivado de es_orientador (facilita toggle) ---
  @ApiPropertyOptional({
    description: 'Forzar que este AO sea/no sea orientador del curso',
  })
  @IsOptional()
  @IsBoolean()
  es_orientador?: boolean;
}
