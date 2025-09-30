import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ActividadesRecientesService } from './actividades-recientes.service';
import {
  ActividadRecienteDto,
  ActividadRecienteResponseDto,
} from './dto/actividad-reciente.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Actividades Recientes')
@Controller('actividad')
export class ActividadesRecientesController {
  constructor(
    private readonly actividadesRecientesService: ActividadesRecientesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista de actividades recientes' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de actividades a retornar',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de actividades recientes obtenida correctamente',
    type: ActividadRecienteResponseDto,
  })
  async obtenerActividades(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<ActividadRecienteResponseDto> {
    const actividades =
      await this.actividadesRecientesService.obtenerActividadesRecientes(limit);

    return {
      items: actividades,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva actividad' })
  @ApiResponse({
    status: 201,
    description: 'Actividad registrada correctamente',
  })
  async registrarActividad(
    @Body()
    actividad: {
      descripcion: string;
      tipo: 'success' | 'info' | 'warning';
    },
  ): Promise<void> {
    await this.actividadesRecientesService.registrarActividad(actividad);
  }
}
