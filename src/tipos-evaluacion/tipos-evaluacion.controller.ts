import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TiposEvaluacionService } from './tipos-evaluacion.service';

@Controller('tipos-evaluacion')
export class TiposEvaluacionController {
  constructor(private readonly tiposEvaluacionService: TiposEvaluacionService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.tiposEvaluacionService.findAll();
  }
}
