import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsInt } from 'class-validator';

export class CreateCalificacionDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  @IsInt()
  id_evaluacion: number;

  @ApiProperty({ description: 'ID del alumno' })
  @IsInt()
  id_alumno: number;

  @ApiProperty({ description: 'Calificación del alumno (0-10)' })
  @IsNumber()
  @Min(0)
  @Max(10)
  calificacion: number;
}
