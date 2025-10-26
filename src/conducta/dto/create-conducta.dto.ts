import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConductaDto {
  @ApiProperty({ example: 12, description: 'ID del alumno' })
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  id_alumno: number;

  @ApiProperty({ example: 7, description: 'ID del orientador que registra la conducta' })
  @IsInt({ message: 'El ID del orientador debe ser un número entero' })
  id_orientador: number;

  @ApiProperty({
    example: 'MENOS_GRAVE',
    description: 'Gravedad de la falta (MENOS_GRAVE, GRAVE, MUY_GRAVE)',
  })
  @IsNotEmpty({ message: 'La gravedad es obligatoria' })
  gravedad: 'MENOS_GRAVE' | 'GRAVE' | 'MUY_GRAVE';

  @ApiProperty({
    example: 'Interrumpió la clase varias veces',
    description: 'Descripción del incidente o comportamiento observado',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(255, { message: 'La descripción no debe superar los 255 caracteres' })
  descripcion: string;

  @ApiProperty({
    example: '2025-10-22',
    description: 'Fecha del incidente (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  fecha: string;

  @ApiProperty({
    example: '2025',
    description: 'Año académico en que ocurrió la falta',
  })
  @IsOptional()
  anio_academico?: string;

  @ApiProperty({
    example: 1,
    description: 'Trimestre (1, 2 o 3)',
  })
  @IsOptional()
  trimestre?: number;
}
