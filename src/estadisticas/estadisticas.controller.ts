import { Controller, Get } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Estadísticas')
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('personal/total')
  @ApiOperation({
    summary: 'Obtiene el conteo total del personal y usuarios registrados',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna el conteo detallado de usuarios por tipo y cargo, junto con el total',
    schema: {
      example: {
        detalles: {
          administrativos: 5,
          orientadores: 10,
          administrativosPorCargo: [
            { cargo: 'Admin', cantidad: 2 },
            { cargo: 'P.A', cantidad: 3 },
            { cargo: 'Orientador', cantidad: 10 },
          ],
        },
        totalUsuariosRegistrados: 15,
      },
    },
  })
  async getPersonalTotal() {
    return this.estadisticasService.contarPersonal();
  }
}
