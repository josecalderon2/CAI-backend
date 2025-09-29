// src/orientador/dto/create-orientador.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const emptyToUndefined = () =>
  Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  );

export class CreateOrientadorDto {
  @ApiProperty({ example: 'Kendel' })
  @IsString()
  @trim()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Arevalo' })
  @IsString()
  @trim()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: '07207228-8', description: 'Formato 00000000-0' })
  @IsString()
  @trim()
  @IsNotEmpty()
  @Matches(/^\d{8}-\d{1}$/, { message: 'DUI inválido (00000000-0)' })
  dui: string;

  @ApiProperty({ example: '7777-7777', description: 'Formato 0000-0000' })
  @IsString()
  @trim()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, { message: 'Teléfono inválido (0000-0000)' })
  telefono: string;

  @ApiProperty({ example: 'Colonia Altavista, San Salvador' })
  @IsString()
  @trim()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ example: 'kendel@example.com' })
  @trim()
  @IsEmail()
  email: string;

  
  @ApiProperty({ example: 3, description: 'FK de cargo_administrativo' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cargo_administrativo: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;
}
