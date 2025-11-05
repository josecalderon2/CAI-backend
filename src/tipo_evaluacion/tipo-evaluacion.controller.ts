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
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TipoEvaluacionService } from './tipo-evaluacion.service';
import { CreateTipoEvaluacionDto } from './dto/create-tipo-evaluacion.dto';
import { UpdateTipoEvaluacionDto } from './dto/update-tipo-evaluacion.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tipos-evaluacion')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TipoEvaluacionController {
  constructor(private readonly tipoEvaluacionService: TipoEvaluacionService) {}

  /**
   * GET /tipos-evaluacion
   * Obtener todos los tipos de evaluación
   * Acceso: Todos los usuarios autenticados
   * - Admin: Obtiene todos (activos e inactivos)
   * - Orientador: Obtiene solo activos
   */
  @Get()
  findAll(@Req() req: any) {
    const userRole = req.user?.role || req.user?.rol;
    const isAdmin = userRole === 'Admin';
    return this.tipoEvaluacionService.findAll(isAdmin);
  }

  /**
   * GET /tipos-evaluacion/:id
   * Obtener un tipo de evaluación por ID
   * Acceso: Todos los usuarios autenticados
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoEvaluacionService.findOne(id);
  }

  /**
   * POST /tipos-evaluacion
   * Crear un nuevo tipo de evaluación
   * Acceso: Solo administradores
   */
  @Post()
  @Roles('Admin')
  create(@Body() createDto: CreateTipoEvaluacionDto) {
    return this.tipoEvaluacionService.create(createDto);
  }

  /**
   * PATCH /tipos-evaluacion/:id
   * Actualizar un tipo de evaluación
   * Acceso: Solo administradores
   */
  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTipoEvaluacionDto,
  ) {
    return this.tipoEvaluacionService.update(id, updateDto);
  }

  /**
   * DELETE /tipos-evaluacion/:id
   * Desactivar un tipo de evaluación
   * Acceso: Solo administradores
   */
  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoEvaluacionService.remove(id);
  }
}
