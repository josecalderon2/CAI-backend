import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TiposEvaluacionService } from './tipos-evaluacion.service';

@Controller('tipos-evaluacion')
export class TiposEvaluacionController {
  constructor(
    private readonly tiposEvaluacionService: TiposEvaluacionService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.tiposEvaluacionService.findAll();
  }

  @Get('asignatura/:id_asignatura')
  @UseGuards(AuthGuard('jwt'))
  async getTiposByAsignatura(
    @Param('id_asignatura', ParseIntPipe) id_asignatura: number,
  ) {
    return this.tiposEvaluacionService.getTiposEvaluacionByAsignatura(
      id_asignatura,
    );
  }
}
