import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, Max, IsString } from 'class-validator';

export class CalcularNotaTrimestralDto {
  @ApiProperty({
    description: 'ID del alumno',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del alumno es requerido' })
  @IsInt()
  id_alumno: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la asignatura es requerido' })
  @IsInt()
  id_asignatura: number;

  @ApiProperty({
    description: 'Trimestre a calcular (1, 2 o 3)',
    example: 1,
    minimum: 1,
    maximum: 3,
  })
  @IsNotEmpty({ message: 'El trimestre es requerido' })
  @IsInt()
  @Min(1, { message: 'El trimestre mínimo es 1' })
  @Max(3, { message: 'El trimestre máximo es 3' })
  trimestre: number;

  @ApiProperty({
    description: 'Año académico',
    example: '2025',
  })
  @IsNotEmpty({ message: 'El año académico es requerido' })
  @IsString()
  anio_academico: string;
}
