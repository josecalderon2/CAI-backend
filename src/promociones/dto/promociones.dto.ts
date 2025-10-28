import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PromoverAlumnoDto {
  @ApiProperty({ description: 'ID del alumno a promover', example: 1 })
  @IsNumber()
  alumnoId: number;

  @ApiProperty({ description: 'ID del curso de destino', example: 2 })
  @IsNumber()
  cursoDestinoId: number;

  @ApiProperty({ description: 'Año académico actual', example: '2025' })
  @IsString()
  anioActual: string;

  @ApiProperty({ description: 'Año académico de destino', example: '2026' })
  @IsString()
  anioDestino: string;

  @ApiProperty({
    description: 'Estado final del alumno en el curso actual',
    example: 'APROBADO',
    required: false,
  })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({ description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({
    description: 'Nota promedio final',
    required: false,
    example: 8.5,
  })
  @IsNumber()
  @IsOptional()
  notaPromedio?: number;
}

export class AlumnoPromocionDto {
  @ApiProperty({ description: 'ID del alumno', example: 1 })
  @IsNumber()
  alumnoId: number;

  @ApiProperty({ description: 'Estado final del alumno', example: 'APROBADO' })
  @IsString()
  estado: string;

  @ApiProperty({
    description: 'Nota promedio final',
    example: 8.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  notaPromedio?: number;

  @ApiProperty({ description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class PromocionCursoDto {
  @ApiProperty({ description: 'ID del curso origen', example: 1 })
  @IsNumber()
  cursoOrigenId: number;

  @ApiProperty({ description: 'ID del curso destino', example: 2 })
  @IsNumber()
  cursoDestinoId: number;

  @ApiProperty({
    description: 'Lista de alumnos a promover con su estado y notas',
    type: [AlumnoPromocionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlumnoPromocionDto)
  @ArrayMinSize(1)
  alumnos: AlumnoPromocionDto[];
}

export class PromocionMasivaDto {
  @ApiProperty({ description: 'Año académico actual', example: '2025' })
  @IsString()
  anioActual: string;

  @ApiProperty({ description: 'Año académico de destino', example: '2026' })
  @IsString()
  anioSiguiente: string;

  @ApiProperty({
    description: 'Lista de promociones por curso',
    type: [PromocionCursoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromocionCursoDto)
  @ArrayMinSize(1)
  promocionesPorCurso: PromocionCursoDto[];
}

export class FinalizarAlumnoDto {
  @ApiProperty({
    description:
      'ID del alumno a finalizar estudios o marcar como no reinscrito',
    example: 1,
  })
  @IsNumber()
  alumnoId: number;

  @ApiProperty({ description: 'Año académico actual', example: '2025' })
  @IsString()
  anioActual: string;

  @ApiProperty({
    description:
      'Estado final del alumno. Valores válidos: "NO_REINSCRITO" (cuando no regresa al siguiente año), "FINALIZADO" (cuando completa todos sus estudios/graduado), "RETIRADO", etc.',
    example: 'FINALIZADO',
    enum: ['NO_REINSCRITO', 'FINALIZADO', 'RETIRADO', 'TRASLADADO'],
    required: false,
  })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({
    description: 'Nota promedio final',
    example: 8.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  notaPromedio?: number;

  @ApiProperty({ description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({
    description:
      'Marcar al alumno como inactivo en el sistema. Si es true, se actualiza activo=false en la tabla alumnos y estado=INACTIVO en alumnoCurso',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  marcarInactivo?: boolean;
}
