import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class InscribirAlumnoCursoDto {
  @ApiProperty({
    example: 1,
    description: 'ID del curso al que se inscribe el alumno',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  cursoId: number;

  @ApiProperty({
    example: '2025',
    description: 'Año académico de la inscripción',
  })
  @IsNotEmpty()
  @IsString()
  anioAcademico: string;

  @ApiPropertyOptional({
    example: 'Sección A',
    description: 'Sección asignada (opcional, por defecto usa la del curso)',
  })
  @IsOptional()
  @IsString()
  seccionAsignada?: string;

  @ApiPropertyOptional({
    example: 'Alumno regular',
    description: 'Observaciones sobre la inscripción',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    example: 'ACTIVO',
    description: 'Estado inicial de la inscripción',
    default: 'ACTIVO',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}
