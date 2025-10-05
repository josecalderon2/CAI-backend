import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '7e0f7b2a1d9f4e0a8c3b9...' })
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 8, example: 'NuevaClaveSegura123!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
