import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTipoEvaluacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;
}
