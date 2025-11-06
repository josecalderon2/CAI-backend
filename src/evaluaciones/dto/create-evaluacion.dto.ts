import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluacionDto {
  @ApiProperty({
    description: 'Nombre de la evaluación',
    example: 'Examen de Matemáticas - Primer Trimestre',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Puntaje mínimo de la evaluación',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El puntaje mínimo debe ser un número' })
  @Min(0, { message: 'El puntaje mínimo no puede ser negativo' })
  puntaje_minimo?: number;

  @ApiProperty({
    description: 'Puntaje máximo de la evaluación',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El puntaje máximo debe ser un número' })
  @Min(0, { message: 'El puntaje máximo no puede ser negativo' })
  puntaje_maximo?: number;

  @ApiProperty({
    description: 'ID del tipo de evaluación',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del tipo de evaluación debe ser un número' })
  @IsNotEmpty({ message: 'El tipo de evaluación es requerido' })
  id_tipo_evaluacion: number;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID de la asignatura debe ser un número' })
  @IsNotEmpty({ message: 'La asignatura es requerida' })
  id_asignatura: number;
}
