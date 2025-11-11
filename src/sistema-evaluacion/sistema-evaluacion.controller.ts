import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Patch,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SistemaEvaluacionService } from './sistema-evaluacion.service';
import {
  CalcularNotaMensualDto,
  CalcularNotaTrimestralDto,
  NotaMensualResponseDto,
  NotaTrimestralResponseDto,
} from './dto';

@ApiTags('Sistema de Evaluación')
@Controller('sistema-evaluacion')
export class SistemaEvaluacionController {
  constructor(
    private readonly sistemaEvaluacionService: SistemaEvaluacionService,
  ) {}

  @Post('nota-mensual')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear y calcular nota mensual/periodo de un alumno',
    description:
      'Crea un nuevo registro de nota mensual y calcula la nota del periodo según el nivel educativo:\n' +
      '- BÁSICA (1º-9º): 70% actividades + 30% examen mensual, 3 trimestres\n' +
      '- BACHILLERATO (1º-2º año): 6 componentes ponderados (Act.Int 25%, Tarea 5%, Coev 5%, Lab 10%, Examen Parcial 25%, Examen Periodo 30%), 4 periodos',
  })
  @ApiBody({
    type: CalcularNotaMensualDto,
    examples: {
      'BÁSICA - Alumno 1 - Matemática - Febrero': {
        summary: 'Básica: Alumno1 en Matemática - Febrero (sin examen_parcial)',
        value: {
          id_alumno: 1,
          id_asignatura: 2, // Asignatura de curso Básica
          mes: 'Febrero',
          trimestre: 1,
          anio_academico: '2025',
          actividades: [
            { id_tipo_actividad: 1, numero_actividad: 1, nota: 8.0 },
            { id_tipo_actividad: 2, numero_actividad: null, nota: 9.0 },
            { id_tipo_actividad: 1, numero_actividad: 2, nota: 7.5 },
          ],
          examen_mensual: 9.0,
        },
      },
      'BACHILLERATO - Alumno 2 - Matemática - Periodo 1': {
        summary:
          'Bachillerato: Alumno2 en Matemática - Periodo 1 (requiere examen_parcial)',
        value: {
          id_alumno: 2,
          id_asignatura: 6, // Asignatura de curso Bachillerato
          mes: 'Febrero',
          trimestre: 1,
          anio_academico: '2025',
          actividades: [
            { id_tipo_actividad: 5, numero_actividad: 1, nota: 8.5 }, // Act.Integradora
            { id_tipo_actividad: 7, numero_actividad: 1, nota: 9.0 }, // Tarea
            { id_tipo_actividad: 9, numero_actividad: 1, nota: 8.0 }, // Coevaluación
            { id_tipo_actividad: 12, numero_actividad: 1, nota: 8.5 }, // Laboratorio
          ],
          examen_mensual: 9.0, // Examen del Periodo (30%)
          examen_parcial: 8.5, // Examen Parcial (25%)
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Nota mensual calculada exitosamente',
    type: NotaMensualResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o mes no válido para el trimestre',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno o asignatura no encontrado',
  })
  async calcularNotaMensual(
    @Body() calcularNotaMensualDto: CalcularNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    return this.sistemaEvaluacionService.calcularNotaMensual(
      calcularNotaMensualDto,
    );
  }

  @Patch('nota-mensual/:id_nota_mensual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar nota mensual existente',
    description:
      'Actualiza una nota mensual existente recalculando todos los valores según el nivel educativo.',
  })
  @ApiParam({
    name: 'id_nota_mensual',
    description: 'ID de la nota mensual a actualizar',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: CalcularNotaMensualDto,
    description:
      'Datos actualizados de la nota mensual (actividades, exámenes, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota mensual actualizada exitosamente',
    type: NotaMensualResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Nota mensual no encontrada',
  })
  async actualizarNotaMensual(
    @Param('id_nota_mensual', ParseIntPipe) id_nota_mensual: number,
    @Body() calcularNotaMensualDto: CalcularNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    return this.sistemaEvaluacionService.actualizarNotaMensual(
      id_nota_mensual,
      calcularNotaMensualDto,
    );
  }

  @Post('nota-trimestral')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular nota trimestral/periodo de un alumno',
    description:
      'Calcula la nota del trimestre/periodo según el nivel educativo:\n' +
      '- BÁSICA: Suma ponderada de 3 meses (Ej: Trimestre 1 = Feb 28% + Mar 27% + Abr 45%)\n' +
      '- BACHILLERATO: Cada periodo representa 25% de la nota anual',
  })
  @ApiBody({
    type: CalcularNotaTrimestralDto,
    examples: {
      'Alumno 2 - Matemática I - Trimestre 1': {
        summary: 'Alumno2 en Matemática I - Trimestre 1',
        value: {
          id_alumno: 2,
          id_asignatura: 1,
          trimestre: 1,
          anio_academico: '2025',
        },
      },
      'Alumno 2 - Lenguaje y Literatura - Trimestre 1': {
        summary: 'Alumno2 en Lenguaje - Trimestre 1',
        value: {
          id_alumno: 2,
          id_asignatura: 2,
          trimestre: 1,
          anio_academico: '2025',
        },
      },
      'Alumno 3 - Matemática I - Trimestre 1': {
        summary: 'Alumno3 en Matemática I - Trimestre 1',
        value: {
          id_alumno: 3,
          id_asignatura: 1,
          trimestre: 1,
          anio_academico: '2025',
        },
      },
      'Alumno 10 - Matemática I - Trimestre 1': {
        summary: 'Alumno10 en Matemática I - Trimestre 1',
        value: {
          id_alumno: 10,
          id_asignatura: 1,
          trimestre: 1,
          anio_academico: '2025',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Nota trimestral calculada exitosamente',
    type: NotaTrimestralResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno o asignatura no encontrado',
  })
  async calcularNotaTrimestral(
    @Body() calcularNotaTrimestralDto: CalcularNotaTrimestralDto,
  ): Promise<NotaTrimestralResponseDto> {
    return this.sistemaEvaluacionService.calcularNotaTrimestral(
      calcularNotaTrimestralDto,
    );
  }

  @Get('notas-mensuales/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener historial de notas mensuales',
    description:
      'Recupera todas las notas mensuales de un alumno para una asignatura específica',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 2,
    examples: {
      'Alumno 2': { value: 2, description: 'Alumno2 Prueba2' },
      'Alumno 3': { value: 3, description: 'Alumno3 Prueba3' },
      'Alumno 10': { value: 10, description: 'Alumno10 Prueba10' },
    },
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
    examples: {
      'Matemática I': { value: 1, description: 'Matemática I' },
      'Lenguaje y Literatura': {
        value: 2,
        description: 'Lenguaje y Literatura',
      },
    },
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Número de trimestre (1, 2 o 3)',
    type: 'number',
    required: true,
    example: 1,
    examples: {
      'Trimestre 1': { value: 1, description: 'Febrero, Marzo, Abril' },
      'Trimestre 2': { value: 2, description: 'Mayo, Junio, Julio' },
      'Trimestre 3': { value: 3, description: 'Agosto, Septiembre, Octubre' },
    },
  })
  @ApiQuery({
    name: 'anio_academico',
    description: 'Año académico',
    type: 'string',
    required: true,
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de notas mensuales recuperado exitosamente',
  })
  async obtenerNotasMensuales(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any[]> {
    return this.sistemaEvaluacionService.obtenerNotasMensuales(
      +id_alumno,
      +id_asignatura,
      +trimestre,
      anio_academico,
    );
  }

  @Get('detalle-evaluacion/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener detalle completo de evaluación',
    description:
      'Recupera el detalle completo de evaluación de un alumno, ' +
      'incluyendo notas mensuales, trimestrales y nota anual',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 2,
    examples: {
      'Alumno 2': { value: 2, description: 'Alumno2 Prueba2' },
      'Alumno 3': { value: 3, description: 'Alumno3 Prueba3' },
      'Alumno 10': { value: 10, description: 'Alumno10 Prueba10' },
    },
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
    examples: {
      'Matemática I': { value: 1, description: 'Matemática I' },
      'Lenguaje y Literatura': {
        value: 2,
        description: 'Lenguaje y Literatura',
      },
    },
  })
  @ApiQuery({
    name: 'anio_academico',
    description: 'Año académico',
    type: 'string',
    required: true,
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de evaluación recuperado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno o asignatura no encontrado',
  })
  async obtenerDetalleEvaluacion(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerDetalleEvaluacion(
      +id_alumno,
      +id_asignatura,
      anio_academico,
    );
  }

  @Get('porcentajes-trimestre/:trimestre')
  @ApiOperation({
    summary: '[BÁSICA ONLY] Obtener porcentajes de los meses de un trimestre',
    description:
      'Devuelve los porcentajes que cada mes aporta al trimestre especificado. ' +
      'NOTA: Este endpoint es específico para Educación Básica. ' +
      'Para obtener configuración de cualquier nivel, use GET /configuracion-evaluacion/:id_asignatura',
  })
  @ApiParam({
    name: 'trimestre',
    description: 'Número de trimestre (1, 2 o 3)',
    type: 'number',
    example: 1,
    examples: {
      'Trimestre 1': { value: 1, description: 'Febrero, Marzo, Abril' },
      'Trimestre 2': { value: 2, description: 'Mayo, Junio, Julio' },
      'Trimestre 3': { value: 3, description: 'Agosto, Septiembre, Octubre' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Porcentajes recuperados exitosamente',
    schema: {
      type: 'object',
      example: {
        trimestre: 1,
        meses: {
          Febrero: 28,
          Marzo: 27,
          Abril: 45,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Número de trimestre inválido',
  })
  async obtenerPorcentajesTrimestre(
    @Param('trimestre') trimestre: string,
  ): Promise<any> {
    const trimestreNum = +trimestre;
    const porcentajes = {
      1: { Febrero: 28, Marzo: 27, Abril: 45 },
      2: { Mayo: 28, Junio: 27, Julio: 45 },
      3: { Agosto: 28, Septiembre: 27, Octubre: 45 },
    };

    if (!porcentajes[trimestreNum]) {
      throw new BadRequestException('Trimestre inválido. Debe ser 1, 2 o 3');
    }

    return {
      trimestre: trimestreNum,
      meses: porcentajes[trimestreNum],
    };
  }

  @Get('configuracion-evaluacion/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener configuración de evaluación de una asignatura',
    description:
      'Devuelve la configuración completa del sistema de evaluación según el nivel educativo:\n' +
      '- BÁSICA: 3 trimestres, porcentajes mensuales, 2 componentes (70% actividades + 30% examen)\n' +
      '- BACHILLERATO: 4 periodos, 6 componentes con ponderaciones específicas',
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 2,
    examples: {
      'Asignatura Básica': {
        value: 2,
        description: 'Matemática - Educación Básica',
      },
      'Asignatura Bachillerato': {
        value: 6,
        description: 'Matemática - Bachillerato',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración recuperada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Asignatura no encontrada o nivel educativo no determinado',
  })
  async obtenerConfiguracionEvaluacion(
    @Param('id_asignatura') id_asignatura: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerConfiguracionEvaluacion(
      +id_asignatura,
    );
  }

  @Get('actividades-mes/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener actividades de un mes específico',
    description:
      'Recupera todas las actividades de evaluación de un alumno para una asignatura en un mes específico',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 2,
    examples: {
      'Alumno 2': { value: 2, description: 'Alumno2 Prueba2' },
      'Alumno 3': { value: 3, description: 'Alumno3 Prueba3' },
      'Alumno 10': { value: 10, description: 'Alumno10 Prueba10' },
    },
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
    examples: {
      'Matemática I': { value: 1, description: 'Matemática I' },
      'Lenguaje y Literatura': {
        value: 2,
        description: 'Lenguaje y Literatura',
      },
    },
  })
  @ApiQuery({
    name: 'mes',
    description: 'Nombre del mes',
    type: 'string',
    required: true,
    example: 'Febrero',
    examples: {
      Febrero: { value: 'Febrero', description: 'Trimestre 1 - 28%' },
      Marzo: { value: 'Marzo', description: 'Trimestre 1 - 27%' },
      Abril: { value: 'Abril', description: 'Trimestre 1 - 45%' },
      Mayo: { value: 'Mayo', description: 'Trimestre 2 - 28%' },
      Junio: { value: 'Junio', description: 'Trimestre 2 - 27%' },
      Julio: { value: 'Julio', description: 'Trimestre 2 - 45%' },
      Agosto: { value: 'Agosto', description: 'Trimestre 3 - 28%' },
      Septiembre: { value: 'Septiembre', description: 'Trimestre 3 - 27%' },
      Octubre: { value: 'Octubre', description: 'Trimestre 3 - 45%' },
    },
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Número de trimestre (1, 2 o 3)',
    type: 'number',
    required: true,
    example: 1,
    examples: {
      'Trimestre 1': { value: 1, description: 'Febrero, Marzo, Abril' },
      'Trimestre 2': { value: 2, description: 'Mayo, Junio, Julio' },
      'Trimestre 3': { value: 3, description: 'Agosto, Septiembre, Octubre' },
    },
  })
  @ApiQuery({
    name: 'anio_academico',
    description: 'Año académico',
    type: 'string',
    required: true,
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Actividades del mes recuperadas exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró nota mensual',
  })
  async obtenerActividadesMensual(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('mes') mes: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerActividadesMensual(
      +id_alumno,
      +id_asignatura,
      mes,
      +trimestre,
      anio_academico,
    );
  }

  @Get('reporte-trimestre/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener reporte completo de actividades del trimestre',
    description:
      'Genera un reporte completo con todas las actividades, notas mensuales y nota trimestral',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 2,
    examples: {
      'Alumno 2': { value: 2, description: 'Alumno2 Prueba2' },
      'Alumno 3': { value: 3, description: 'Alumno3 Prueba3' },
      'Alumno 10': { value: 10, description: 'Alumno10 Prueba10' },
    },
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
    examples: {
      'Matemática I': { value: 1, description: 'Matemática I' },
      'Lenguaje y Literatura': {
        value: 2,
        description: 'Lenguaje y Literatura',
      },
    },
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Número de trimestre (1, 2 o 3)',
    type: 'number',
    required: true,
    example: 1,
    examples: {
      'Trimestre 1': { value: 1, description: 'Febrero, Marzo, Abril' },
      'Trimestre 2': { value: 2, description: 'Mayo, Junio, Julio' },
      'Trimestre 3': { value: 3, description: 'Agosto, Septiembre, Octubre' },
    },
  })
  @ApiQuery({
    name: 'anio_academico',
    description: 'Año académico',
    type: 'string',
    required: true,
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte del trimestre generado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno o asignatura no encontrado',
  })
  async obtenerReporteActividadesTrimestre(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerReporteActividadesTrimestre(
      +id_alumno,
      +id_asignatura,
      +trimestre,
      anio_academico,
    );
  }

  @Get('estadisticas/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener estadísticas del alumno en la asignatura',
    description:
      'Genera estadísticas generales del desempeño del alumno en una asignatura durante el año académico',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 2,
    examples: {
      'Alumno 2': { value: 2, description: 'Alumno2 Prueba2' },
      'Alumno 3': { value: 3, description: 'Alumno3 Prueba3' },
      'Alumno 10': { value: 10, description: 'Alumno10 Prueba10' },
    },
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
    examples: {
      'Matemática I': { value: 1, description: 'Matemática I' },
      'Lenguaje y Literatura': {
        value: 2,
        description: 'Lenguaje y Literatura',
      },
    },
  })
  @ApiQuery({
    name: 'anio_academico',
    description: 'Año académico',
    type: 'string',
    required: true,
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generadas exitosamente',
    schema: {
      type: 'object',
      example: {
        id_alumno: 1,
        id_asignatura: 1,
        anio_academico: '2025',
        total_actividades: 15,
        promedio_general_actividades: 8.2,
        nota_maxima: 9.5,
        nota_minima: 6.5,
        meses_evaluados: 9,
      },
    },
  })
  async obtenerEstadisticasAlumno(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerEstadisticasAlumno(
      +id_alumno,
      +id_asignatura,
      anio_academico,
    );
  }

  /**
   * ======================================================
   * ============= REPORTES POR ASIGNATURA ================
   * ======================================================
   */

  /**
   * ======================================================
   * ============= REPORTES PARA ALUMNOS/PADRES ===========
   * ======================================================
   */

  @Get('reporte-mensual-alumno/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: '1. Reporte mensual de una asignatura para un alumno',
    description:
      'Muestra las actividades y nota mensual de un alumno en una asignatura específica',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 3,
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
  })
  @ApiQuery({ name: 'mes', required: true, example: 'Febrero' })
  @ApiQuery({ name: 'trimestre', required: true, example: 1 })
  @ApiQuery({ name: 'anio_academico', required: true, example: '2025' })
  async obtenerReporteMensualAlumnoAsignatura(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('mes') mes: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerReporteMensualAlumnoAsignatura(
      +id_alumno,
      +id_asignatura,
      mes,
      +trimestre,
      anio_academico,
    );
  }

  @Get('consolidado-mensual-alumno/:id_alumno')
  @ApiOperation({
    summary: '2. Consolidado mensual de todas las asignaturas de un alumno',
    description:
      'Muestra las notas mensuales de todas las asignaturas del curso del alumno',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 3,
  })
  @ApiQuery({ name: 'mes', required: true, example: 'Febrero' })
  @ApiQuery({ name: 'trimestre', required: true, example: 1 })
  @ApiQuery({ name: 'anio_academico', required: true, example: '2025' })
  async obtenerConsolidadoMensualAlumno(
    @Param('id_alumno') id_alumno: string,
    @Query('mes') mes: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerConsolidadoMensualAlumno(
      +id_alumno,
      mes,
      +trimestre,
      anio_academico,
    );
  }

  @Get('reporte-trimestral-alumno/:id_alumno/:id_asignatura')
  @ApiOperation({
    summary: '3. Reporte trimestral de una asignatura para un alumno',
    description:
      'Muestra el desglose mensual y nota trimestral de un alumno en una asignatura',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 3,
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
  })
  @ApiQuery({ name: 'trimestre', required: true, example: 1 })
  @ApiQuery({ name: 'anio_academico', required: true, example: '2025' })
  async obtenerReporteTrimestralAlumnoAsignatura(
    @Param('id_alumno') id_alumno: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerReporteTrimestralAlumnoAsignatura(
      +id_alumno,
      +id_asignatura,
      +trimestre,
      anio_academico,
    );
  }

  @Get('consolidado-trimestral-alumno/:id_alumno')
  @ApiOperation({
    summary: '4. Consolidado trimestral de todas las asignaturas de un alumno',
    description:
      'Muestra las notas trimestrales de todas las asignaturas del curso del alumno',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
    example: 3,
  })
  @ApiQuery({ name: 'trimestre', required: true, example: 1 })
  @ApiQuery({ name: 'anio_academico', required: true, example: '2025' })
  async obtenerConsolidadoTrimestralAlumno(
    @Param('id_alumno') id_alumno: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerConsolidadoTrimestralAlumno(
      +id_alumno,
      +trimestre,
      anio_academico,
    );
  }

  /**
   * ======================================================
   * ======= REPORTES PARA ADMINISTRADORES/ORIENTADORES ===
   * ======================================================
   */

  @Get('consolidado-mensual-curso/:id_curso/:id_asignatura')
  @ApiOperation({
    summary: '5. Consolidado mensual de una asignatura por curso',
    description:
      'Muestra las notas mensuales de TODOS los alumnos de un curso en una asignatura',
  })
  @ApiParam({
    name: 'id_curso',
    description: 'ID del curso',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
  })
  @ApiQuery({ name: 'mes', required: true, example: 'Febrero' })
  @ApiQuery({ name: 'trimestre', required: true, example: 1 })
  @ApiQuery({ name: 'anio_academico', required: true, example: '2025' })
  async obtenerConsolidadoMensualAsignaturaCurso(
    @Param('id_curso') id_curso: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('mes') mes: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerConsolidadoMensualAsignaturaCurso(
      +id_curso,
      +id_asignatura,
      mes,
      +trimestre,
      anio_academico,
    );
  }

  @Get('consolidado-trimestral-curso/:id_curso/:id_asignatura')
  @ApiOperation({
    summary: '6. Consolidado trimestral de una asignatura por curso',
    description:
      'Muestra las notas trimestrales de TODOS los alumnos de un curso en una asignatura',
  })
  @ApiParam({
    name: 'id_curso',
    description: 'ID del curso',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
    example: 1,
  })
  @ApiQuery({ name: 'trimestre', required: true, example: 1 })
  @ApiQuery({ name: 'anio_academico', required: true, example: '2025' })
  async obtenerConsolidadoTrimestralAsignaturaCurso(
    @Param('id_curso') id_curso: string,
    @Param('id_asignatura') id_asignatura: string,
    @Query('trimestre') trimestre: string,
    @Query('anio_academico') anio_academico: string,
  ): Promise<any> {
    return this.sistemaEvaluacionService.obtenerConsolidadoTrimestralAsignaturaCurso(
      +id_curso,
      +id_asignatura,
      +trimestre,
      anio_academico,
    );
  }

  // ========================================
  // CATÁLOGOS Y CONFIGURACIÓN
  // ========================================

  @Get('catalogo/sistemas')
  @ApiOperation({
    summary: 'Obtener catálogo de sistemas de evaluación disponibles',
    description:
      'Lista todos los tipos de sistemas de evaluación configurados (Básica, Bachillerato, etc.) con su número de etapas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sistemas de evaluación',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id_sistema_evaluacion: { type: 'number', example: 1 },
          nombre: { type: 'string', example: 'Educacion Basica - 3 etapas' },
          etapas: { type: 'number', example: 3 },
        },
      },
    },
  })
  async obtenerCatalogoSistemas() {
    return this.sistemaEvaluacionService.obtenerCatalogoSistemas();
  }

  @Get('catalogo/tipos-actividad/:nivel_educativo')
  @ApiOperation({
    summary: 'Obtener tipos de actividad según nivel educativo',
    description:
      'Lista todos los tipos de actividad de evaluación disponibles para un nivel educativo específico (BASICA o BACHILLERATO).\n\n' +
      '**BÁSICA (1º-9º grado):**\n' +
      '- Actividades generales sin categorización\n' +
      '- Promedio simple (todas tienen el mismo peso)\n' +
      '- Ejemplos: Tareas, Laboratorios, Exposiciones, etc.\n\n' +
      '**BACHILLERATO (1º-2º año):**\n' +
      '- Actividades categorizadas con ponderaciones específicas:\n' +
      '  - ACTIVIDAD_INTEGRADORA: 25%\n' +
      '  - TAREA: 5%\n' +
      '  - COEVALUACION: 5%\n' +
      '  - LABORATORIO: 10%',
  })
  @ApiParam({
    name: 'nivel_educativo',
    enum: ['BASICA', 'BACHILLERATO'],
    description: 'Nivel educativo del grado académico',
    example: 'BASICA',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de actividad disponibles para el nivel',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id_tipo_actividad: { type: 'number', example: 1 },
          nombre: { type: 'string', example: 'Tarea' },
          categoria: { type: 'string', example: 'TAREA', nullable: true },
          peso: { type: 'number', example: 0.05, nullable: true },
          activo: { type: 'boolean', example: true },
          orden: { type: 'number', example: 1, nullable: true },
          nivel_educativo: { type: 'string', example: 'BASICA' },
          permite_multiples_instancias: {
            type: 'boolean',
            example: true,
            description:
              'Indica si se puede agregar múltiples veces (ej: Tarea 1, Tarea 2, Tarea 3)',
          },
        },
      },
    },
    examples: {
      BASICA: {
        summary: 'Tipos de actividad para Básica',
        value: [
          {
            id_tipo_actividad: 1,
            nombre: 'Tarea',
            categoria: null,
            peso: null,
            activo: true,
            orden: 1,
            nivel_educativo: 'BASICA',
            permite_multiples_instancias: true,
          },
          {
            id_tipo_actividad: 2,
            nombre: 'Revisión de libros y cuadernos',
            categoria: null,
            peso: null,
            activo: true,
            orden: 2,
            nivel_educativo: 'BASICA',
            permite_multiples_instancias: false,
          },
          {
            id_tipo_actividad: 3,
            nombre: 'Laboratorio escrito',
            categoria: null,
            peso: null,
            activo: true,
            orden: 3,
            nivel_educativo: 'BASICA',
            permite_multiples_instancias: true,
          },
        ],
      },
      BACHILLERATO: {
        summary: 'Tipos de actividad para Bachillerato',
        value: [
          {
            id_tipo_actividad: 5,
            nombre: 'Actividad Integradora',
            categoria: 'ACTIVIDAD_INTEGRADORA',
            peso: 0.25,
            activo: true,
            orden: 1,
            nivel_educativo: 'BACHILLERATO',
            permite_multiples_instancias: false,
          },
          {
            id_tipo_actividad: 7,
            nombre: 'Tarea',
            categoria: 'TAREA',
            peso: 0.05,
            activo: true,
            orden: 2,
            nivel_educativo: 'BACHILLERATO',
            permite_multiples_instancias: true,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nivel educativo inválido',
  })
  async obtenerTiposActividadPorNivel(
    @Param('nivel_educativo') nivel_educativo: string,
  ) {
    // Validar nivel educativo
    if (!['BASICA', 'BACHILLERATO'].includes(nivel_educativo)) {
      throw new BadRequestException(
        'Nivel educativo debe ser BASICA o BACHILLERATO',
      );
    }

    return this.sistemaEvaluacionService.obtenerTiposActividadPorNivel(
      nivel_educativo as 'BASICA' | 'BACHILLERATO',
    );
  }
}
