import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CalificacionesService } from './calificaciones.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { UpdateCalificacionDto } from './dto/update-calificacion.dto';

@ApiTags('Calificaciones')
@Controller('calificaciones')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class CalificacionesController {
  constructor(private readonly calificacionesService: CalificacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva calificación' })
  create(
    @Body() createCalificacionDto: CreateCalificacionDto,
    @Req() req: any,
  ) {
    return this.calificacionesService.create(
      createCalificacionDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las calificaciones de una evaluación',
  })
  findAll(
    @Query('id_evaluacion', ParseIntPipe) id_evaluacion: number,
    @Req() req: any,
  ) {
    return this.calificacionesService.findAll(id_evaluacion, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una calificación' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCalificacionDto: UpdateCalificacionDto,
    @Req() req: any,
  ) {
    return this.calificacionesService.update(
      id,
      updateCalificacionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una calificación' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.calificacionesService.remove(id, req.user.id);
  }
}
