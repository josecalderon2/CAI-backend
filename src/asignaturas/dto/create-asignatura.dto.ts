import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, ValidateIf } from 'class-validator';

export class CreateAsignaturaDto {
  
  @ApiProperty({
    description: 'Nombre de la asignatura',
    example: 'Matemática I',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @ApiProperty({
    description: 'Código para ordenar la asignatura en reportes',
    example: '01',
    required: false,
  })
  @IsOptional()
  @IsString()
  orden_en_reporte?: string;
  
  @ApiProperty({
    description: 'Cantidad de horas semanales de la asignatura',
    example: 5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Las horas semanales deben ser un número' })
  @Min(0, { message: 'Las horas semanales no pueden ser negativas' })
  horas_semanas?: number;
  
  @ApiProperty({
    description: 'ID del método de evaluación. Puede ser nulo.',
    example: 1,
    required: false,
    nullable: true, 
  })
  @IsOptional()
  @ValidateIf((o, value) => value !== null) 
  @IsNumber({}, { message: 'El ID del método de evaluación debe ser un número' })
  id_metodo_evaluacion?: number | null;
  
  @ApiProperty({
    description: 'ID del tipo de asignatura. Puede ser nulo.',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, value) => value !== null) 
  @IsNumber({}, { message: 'El ID del tipo de asignatura debe ser un número' })
  id_tipo_asignatura?: number | null;
  
  @ApiProperty({
    description: 'ID del sistema de evaluación. Puede ser nulo.',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o, value) => value !== null) 
  @IsNumber({}, { message: 'El ID del sistema de evaluación debe ser un número' })
  id_sistema_evaluacion?: number | null;
  
  @ApiProperty({
    description: 'ID del curso al que pertenece la asignatura. Puede ser nulo.',
    example: 1,
    required: false,
    nullable: true, 
  })
  @IsOptional()
  @ValidateIf((o, value) => value !== null) 
  @IsNumber({}, { message: 'El ID del curso debe ser un número' })
  id_curso?: number | null; 
}