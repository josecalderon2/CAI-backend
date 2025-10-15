import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Contraseña actual del usuario' })
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto.' })
  currentPass: string;

  @ApiProperty({ example: 'newPassword456', description: 'Nueva contraseña del usuario' })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto.' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres.' })
  newPass: string;
}
