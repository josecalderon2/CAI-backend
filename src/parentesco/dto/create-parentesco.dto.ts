import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParentescoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;
}
