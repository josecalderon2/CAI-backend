import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { NotasMensualesService } from './notas-mensuales.service';
import {
  CreateNotaMensualDto,
  UpdateNotaMensualDto,
  QueryNotaMensualDto,
  NotaMensualResponseDto,
} from './dto';

@ApiTags('Notas Mensuales')
@Controller('notas-mensuales')
export class NotasMensualesController {
  constructor(private readonly notasMensualesService: NotasMensualesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva nota mensual',
    description:
      'Crea una nueva nota mensual para un alumno en una asignatura específica. ' +
      'El promedio se calcula automáticamente basándose en las notas ingresadas.',
  })
  @ApiBody({
    type: CreateNotaMensualDto,
    examples: {
      ejemplo1: {
        summary: 'Notas completas',
        value: {
          id_alumno: 1,
          id_asignatura: 1,
          mes: 3,
          anio: 2025,
          tarea_1: 8.5,
          revision_libros_cuadernos: 9.0,
          tarea_2: 7.5,
          laboratorio_escrito: 8.0,
          examen_mensual: 9.0,
        },
      },
      ejemplo2: {
        summary: 'Notas parciales',
        value: {
          id_alumno: 2,
          id_asignatura: 3,
          mes: 4,
          anio: 2025,
          tarea_1: 8.0,
          examen_mensual: 8.5,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Nota mensual creada exitosamente',
    type: NotaMensualResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Alumno o asignatura no encontrados',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una nota mensual para este alumno, asignatura, mes y año',
  })
  async create(
    @Body() createDto: CreateNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    return this.notasMensualesService.create(createDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar una nota mensual existente',
    description:
      'Actualiza las notas de una nota mensual existente. ' +
      'El promedio se recalcula automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota mensual a actualizar',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateNotaMensualDto,
    examples: {
      ejemplo1: {
        summary: 'Actualizar todas las notas',
        value: {
          tarea_1: 9.0,
          revision_libros_cuadernos: 9.5,
          tarea_2: 8.5,
          laboratorio_escrito: 9.0,
          examen_mensual: 9.5,
        },
      },
      ejemplo2: {
        summary: 'Actualizar solo el examen',
        value: {
          examen_mensual: 8.0,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nota mensual actualizada exitosamente',
    type: NotaMensualResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Nota mensual no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    return this.notasMensualesService.update(id, updateDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener notas mensuales con filtros opcionales',
    description:
      'Recupera todas las notas mensuales que coincidan con los filtros proporcionados. ' +
      'Si no se proporcionan filtros, devuelve todas las notas mensuales.',
  })
  @ApiQuery({
    name: 'id_alumno',
    description: 'ID del alumno',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'mes',
    description: 'Mes (1-12)',
    required: false,
    type: 'number',
    example: 3,
  })
  @ApiQuery({
    name: 'anio',
    description: 'Año académico',
    required: false,
    type: 'number',
    example: 2025,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notas mensuales recuperadas exitosamente',
    type: [NotaMensualResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
  })
  async findAll(
    @Query() query: QueryNotaMensualDto,
  ): Promise<NotaMensualResponseDto[]> {
    return this.notasMensualesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una nota mensual por ID',
    description: 'Recupera una nota mensual específica por su ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota mensual',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nota mensual recuperada exitosamente',
    type: NotaMensualResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Nota mensual no encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotaMensualResponseDto> {
    return this.notasMensualesService.findOne(id);
  }
}
