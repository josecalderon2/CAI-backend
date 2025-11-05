import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateTipoEvaluacionDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;
}
