import { Controller, Get } from '@nestjs/common';
import { MetodosEvaluacionService } from './metodos-evaluacion.service';

@Controller('metodos-evaluacion')
export class MetodosEvaluacionController {
  constructor(private readonly metodosEvaluacionService: MetodosEvaluacionService) {}

  @Get()
  async findAll() {
    return this.metodosEvaluacionService.findAll();
  }
}