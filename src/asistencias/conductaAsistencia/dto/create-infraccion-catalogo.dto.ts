import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { CategoriaInfraccion } from '@prisma/client';

export class CreateInfraccionCatalogoDto {
  @IsEnum(CategoriaInfraccion)
  @IsNotEmpty()
  categoria: CategoriaInfraccion;

  @IsString()
  @IsNotEmpty()
  articulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @Min(0)
  puntos: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
