import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@ApiTags('Evaluaciones')
@Controller('evaluaciones')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  create(@Body() createEvaluacionDto: CreateEvaluacionDto, @Req() req: any) {
    const id_orientador = req.user.id;
    return this.evaluacionesService.create(createEvaluacionDto, id_orientador);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las evaluaciones',
  })
  findAll(@Req() req: any) {
    return this.evaluacionesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una evaluación por ID',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.evaluacionesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una evaluación',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
    @Req() req: any,
  ) {
    return this.evaluacionesService.update(
      id,
      updateEvaluacionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una evaluación',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.evaluacionesService.remove(id, req.user.id);
  }
}
