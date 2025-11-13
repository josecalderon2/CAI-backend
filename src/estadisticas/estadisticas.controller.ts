import { Controller, Get } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Estadísticas')
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('personal/total')
  @ApiOperation({
    summary: 'Obtiene el conteo total del personal y usuarios registrados',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna el conteo detallado de usuarios por tipo y cargo, junto con el total',
    schema: {
      example: {
        detalles: {
          administrativos: 5,
          orientadores: 10,
          administrativosPorCargo: [
            { cargo: 'Admin', cantidad: 2 },
            { cargo: 'P.A', cantidad: 3 },
            { cargo: 'Orientador', cantidad: 10 },
          ],
        },
        totalUsuariosRegistrados: 15,
      },
    },
  })
  async getPersonalTotal() {
    return this.estadisticasService.contarPersonal();
  }

  @Get('dashboard/general')
  @ApiOperation({
    summary: 'Obtiene estadísticas generales del dashboard administrativo',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna estadísticas generales del sistema',
    schema: {
      example: {
        totalAlumnos: 17,
        alumnosActivos: 16,
        cursosActivos: 5,
        asignaturasTotal: 12,
        docentesActivos: 8,
        cambioAlumnos: 3,
        cambioCursos: 0,
        cambioAsignaturas: 0,
        cambioDocentes: 1,
      },
    },
  })
  async getDashboardGeneral() {
    return this.estadisticasService.getDashboardGeneral();
  }

  @Get('dashboard/tareas-pendientes')
  @ApiOperation({
    summary: 'Obtiene tareas pendientes con prioridades',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna lista de tareas pendientes organizadas por prioridad',
    schema: {
      example: {
        total: 3,
        tareas: [
          {
            id: 2,
            titulo: 'Cursos sin orientador',
            descripcion: '2 curso(s) activo(s) sin orientador asignado',
            prioridad: 'alta',
            cantidad: 2,
            tipo: 'cursos',
          },
          {
            id: 3,
            titulo: 'Alumnos sin curso',
            descripcion: '5 alumno(s) activo(s) sin curso asignado',
            prioridad: 'alta',
            cantidad: 5,
            tipo: 'alumnos',
          },
          {
            id: 1,
            titulo: 'Alumnos inactivos',
            descripcion: 'Hay 1 alumno(s) marcado(s) como inactivo(s)',
            prioridad: 'media',
            cantidad: 1,
            tipo: 'alumnos',
          },
        ],
      },
    },
  })
  async getTareasPendientes() {
    return this.estadisticasService.getTareasPendientes();
  }

  @Get('dashboard/resumen-mensual')
  @ApiOperation({
    summary: 'Obtiene resumen de actividades del mes actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna resumen mensual de actividades del sistema',
    schema: {
      example: {
        mes: 'noviembre 2025',
        nuevasMatriculas: 3,
        nuevosDocentes: 1,
        asistenciasRegistradas: 245,
        calificacionesRegistradas: 180,
        alumnosActivos: 17,
        cursosActivos: 5,
        resumen: {
          totalActividades: 429,
        },
      },
    },
  })
  async getResumenMensual() {
    return this.estadisticasService.getResumenMensual();
  }
}
