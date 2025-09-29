import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCargoAdministrativoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}