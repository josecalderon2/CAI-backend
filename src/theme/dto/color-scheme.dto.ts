import { ApiProperty } from '@nestjs/swagger';

export class ColorDto {
  @ApiProperty({ description: 'Componente rojo (0-255)', example: 31 })
  red: number;

  @ApiProperty({ description: 'Componente verde (0-255)', example: 119 })
  green: number;

  @ApiProperty({ description: 'Componente azul (0-255)', example: 184 })
  blue: number;

  @ApiProperty({ description: 'Valor hexadecimal', example: '#1F77B8' })
  hex: string;

  @ApiProperty({ description: 'Valor RGB CSS', example: 'rgb(31, 119, 184)' })
  rgb: string;
}

export class ColorSchemeDto {
  @ApiProperty({ description: 'Color primario azul', type: ColorDto })
  primaryBlue: ColorDto;

  @ApiProperty({ description: 'Color acento naranja', type: ColorDto })
  accentOrange: ColorDto;

  @ApiProperty({ description: 'Color éxito verde', type: ColorDto })
  successGreen: ColorDto;

  @ApiProperty({ description: 'Color error rojo', type: ColorDto })
  errorRed: ColorDto;
}
