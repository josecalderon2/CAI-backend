import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateActividadEvaluacionDto {
  @ApiProperty({
    description: 'ID del tipo de actividad del catálogo',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del tipo de actividad es requerido' })
  @IsInt()
  id_tipo_actividad: number;

  @ApiProperty({
    description: 'Número secuencial de la actividad (ej: 1 para "Tarea 1")',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  numero_actividad?: number;

  @ApiProperty({
    description: 'Nota obtenida en la actividad (escala 0-10)',
    example: 8.0,
    minimum: 0,
    maximum: 10,
  })
  @IsNotEmpty({ message: 'La nota es requerida' })
  @IsNumber()
  @Min(0, { message: 'La nota mínima es 0' })
  @Max(10, { message: 'La nota máxima es 10' })
  nota: number;
}
