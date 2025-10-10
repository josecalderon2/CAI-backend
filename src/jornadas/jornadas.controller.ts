import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { JornadasService } from './jornadas.service';
import { JornadaDto } from './dto/jornada.dto';

@Controller('jornadas')
export class JornadasController {
  constructor(private readonly jornadasService: JornadasService) {}

  /**
   * Obtiene todas las jornadas
   * @returns Lista de jornadas
   */
  @Get()
  async findAll(): Promise<JornadaDto[]> {
    return this.jornadasService.findAll();
  }

  /**
   * Obtiene una jornada por su ID
   * @param id ID de la jornada
   * @returns Jornada encontrada
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JornadaDto> {
    const jornada = await this.jornadasService.findOne(+id);

    if (!jornada) {
      throw new NotFoundException(`Jornada con ID ${id} no encontrada`);
    }

    return jornada;
  }
}
