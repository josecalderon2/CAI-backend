import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemeService } from './theme.service';
import { ColorSchemeDto } from './dto/color-scheme.dto';

@ApiTags('Theme')
@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('colors')
  @ApiOperation({
    summary: 'Obtener esquema de colores de la aplicación',
    description:
      'Retorna los colores definidos para la aplicación móvil EcoPoints',
  })
  @ApiResponse({
    status: 200,
    description: 'Esquema de colores obtenido correctamente',
    type: ColorSchemeDto,
  })
  getColorScheme(): ColorSchemeDto {
    return this.themeService.getColorScheme();
  }
}
