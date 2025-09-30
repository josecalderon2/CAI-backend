import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const emptyToUndefined = () =>
  Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  );

export class CreateAdministrativoDto {
  @ApiProperty({ example: 'Ana' })
  @IsString()
  @trim()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Martínez' })
  @IsString()
  @trim()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: 'Colonia Escalón, San Salvador' })
  @IsString()
  @trim()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({
    example: '07207228-8',
    description: 'Formato 00000000-0',
  })
  @IsString()
  @trim()
  @IsNotEmpty()
  @Matches(/^\d{8}-\d{1}$/, { message: 'DUI inválido (00000000-0)' })
  dui: string;

  @ApiProperty({
    example: '7777-7777',
    description: 'Formato 0000-0000',
  })
  @IsString()
  @trim()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, { message: 'Teléfono inválido (7000-0000)' })
  telefono: string;

  @ApiProperty({ example: 'ana.admin@example.com' })
  @trim()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'Opcional: si no se envía, el sistema genera una contraseña temporal de 4 dígitos.',
    example: 'Admin123*',
  })
  @emptyToUndefined()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: 'Presencial',
    description: 'Modalidad de trabajo',
  })
  @IsOptional()
  @IsString()
  modalidad?: string;

  @ApiProperty({ example: 1, description: 'ID del cargo administrativo' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cargo_administrativo: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean = true;
}
