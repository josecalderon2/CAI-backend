import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { ApiTags } from '@nestjs/swagger';
import { BulkAsistenciaDto } from './dto/bulk-asistencia.dto';

@ApiTags('Asistencia') // Agrupa en Swagger
@Controller('asistencia')
// @UseGuards(TuGuardiaDeAutenticacion) // Descomenta para proteger
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  /**
   * Endpoint principal para la toma de asistencia masiva por parte del docente.
   */
  @Post('bulk')
  createBulk(@Body() bulkAsistenciaDto: BulkAsistenciaDto) {
    return this.asistenciaService.createBulk(bulkAsistenciaDto);
  }

  /**
   * Crea un único registro de asistencia (corrección).
   */
  @Post()
  create(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.asistenciaService.create(createAsistenciaDto);
  }

  @Get()
  findAll() {
    return this.asistenciaService.findAll();
  }

  @Get('alumno/:id_alumno')
  findByStudent(@Param('id_alumno', ParseIntPipe) id_alumno: number) {
    return this.asistenciaService.findByStudent(id_alumno);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciaService.update(id, updateAsistenciaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.remove(id);
  }
}
