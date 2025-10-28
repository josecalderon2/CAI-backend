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
import { ConductaAsistenciaService } from './conductaAsistencia.service';
import { CreateConductaDto } from './dto/create-conducta.dto';
import { UpdateConductaDto } from './dto/update-conducta.dto';
import { CreateInfraccionCatalogoDto } from './dto/create-infraccion-catalogo.dto';
import { UpdateInfraccionCatalogoDto } from './dto/update-infraccion-catalogo.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Conducta y Catálogo') // Agrupa en Swagger
@Controller('conducta')
// @UseGuards(TuGuardiaDeAutenticacion) // Descomenta para proteger todas las rutas
export class ConductaController {
  constructor(private readonly conductaService: ConductaAsistenciaService) {}

  // ======================================================
  // ===     Rutas: Catálogo de Infracciones            ===
  // ======================================================

  @Post('catalogo')
  createCatalogo(@Body() dto: CreateInfraccionCatalogoDto) {
    return this.conductaService.createCatalogo(dto);
  }

  @Get('catalogo')
  findAllCatalogo() {
    return this.conductaService.findAllCatalogo();
  }

  @Get('catalogo/:id')
  findOneCatalogo(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.findOneCatalogo(id);
  }

  @Patch('catalogo/:id')
  updateCatalogo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInfraccionCatalogoDto,
  ) {
    return this.conductaService.updateCatalogo(id, dto);
  }

  @Delete('catalogo/:id')
  removeCatalogo(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.removeCatalogo(id);
  }

  // ======================================================
  // ===      Rutas: Instancias de Conducta             ===
  // ======================================================

  @Post()
  create(@Body() dto: CreateConductaDto) {
    return this.conductaService.create(dto);
  }

  @Get()
  findAll() {
    return this.conductaService.findAll();
  }

  @Get('alumno/:id_alumno')
  findByStudent(@Param('id_alumno', ParseIntPipe) id_alumno: number) {
    return this.conductaService.findByStudent(id_alumno);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConductaDto,
  ) {
    return this.conductaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.remove(id);
  }
}
