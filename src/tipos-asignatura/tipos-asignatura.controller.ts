import { Controller, Get } from '@nestjs/common';
import { TiposAsignaturaService } from './tipos-asignatura.service';

@Controller('tipos-asignatura')
export class TiposAsignaturaController {
  constructor(private readonly tiposAsignaturaService: TiposAsignaturaService) {}

  @Get()
  async findAll() {
    return this.tiposAsignaturaService.findAll();
  }
}