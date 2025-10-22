// dto/create-asignacion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateAsignacionDto {
  @ApiProperty() @IsInt() @IsPositive()
  id_asignatura: number;

  @ApiProperty() @IsInt() @IsPositive()
  id_orientador: number;

  @ApiProperty({ example: '2025' })
  @IsString() @IsNotEmpty()
  anio_academico: string;

  @ApiPropertyOptional({ description: 'ISO string; si no viene, queda now()' })
  @IsOptional() @IsDateString()
  fecha_asignacion?: string;

  @ApiPropertyOptional({ description: 'Default true' })
  @IsOptional() @IsBoolean()
  activo?: boolean;

  // 👉 Front manda el curso seleccionado (para validar consistencia)
  @ApiPropertyOptional({ description: 'Curso seleccionado en el form (validación)' })
  @IsOptional() @IsInt() @IsPositive()
  id_curso?: number;

  // 👉 Front puede editar la carga horaria desde el form
  @ApiPropertyOptional({ description: 'Horas/semana a guardar en Asignatura.horas_semanas', example: 5 })
  @IsOptional() @IsInt() @Min(1)
  cargaHorariaSemanal?: number;

  // 👉 Checkbox “es orientador principal de este curso”
  @ApiPropertyOptional({ description: 'Si es el orientador principal del curso' })
  @IsOptional() @IsBoolean()
  es_orientador?: boolean;
}
