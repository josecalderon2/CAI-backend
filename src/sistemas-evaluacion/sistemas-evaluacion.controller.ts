import { Controller, Get } from '@nestjs/common';
import { SistemasEvaluacionService } from './sistemas-evaluacion.service';

@Controller('sistemas-evaluacion')
export class SistemasEvaluacionController {
  constructor(private readonly sistemasEvaluacionService: SistemasEvaluacionService) {}

  @Get()
  async findAll() {
    return this.sistemasEvaluacionService.findAll();
  }
}