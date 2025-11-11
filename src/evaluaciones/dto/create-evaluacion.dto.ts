import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluacionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ default: 10 })
  @IsNumber()
  @IsOptional()
  @Max(10)
  @Min(0)
  puntaje_maximo: number;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  puntaje_minimo: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id_tipo_evaluacion: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id_asignatura: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  mes?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  trimestre?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  periodo?: number;
}
