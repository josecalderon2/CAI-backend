import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActividadRecienteDto } from './dto/actividad-reciente.dto';

@Injectable()
export class ActividadesRecientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene una lista de actividades recientes
   * @param limit Límite de actividades a retornar
   * @returns Lista de actividades recientes
   */
  async obtenerActividadesRecientes(
    limit = 10,
  ): Promise<ActividadRecienteDto[]> {
    try {
      // Consultar las actividades recientes de la base de datos
      const actividades = await this.prisma.actividadReciente.findMany({
        orderBy: {
          fecha: 'desc', // Ordenar por fecha, más recientes primero
        },
        take: limit, // Limitar la cantidad de resultados
      });

      // Mapear a DTO
      return actividades.map((actividad) => ({
        descripcion: actividad.descripcion,
        fecha: actividad.fecha,
        tipo: actividad.tipo as 'success' | 'info' | 'warning',
      }));
    } catch (error) {
      console.error('Error al obtener actividades recientes:', error);
      // En caso de error, devolver un array vacío
      return [];
    }
  }

  /**
   * Registra una nueva actividad en el sistema
   * @param datos Datos de la actividad a registrar
   */
  async registrarActividad(datos: {
    descripcion: string;
    tipo: 'success' | 'info' | 'warning';
    entidad?: string;
    entidad_id?: number;
    usuario?: string;
  }): Promise<void> {
    try {
      await this.prisma.actividadReciente.create({
        data: {
          descripcion: datos.descripcion,
          tipo: datos.tipo,
          entidad: datos.entidad,
          entidad_id: datos.entidad_id,
          usuario: datos.usuario,
          // fecha se asigna automáticamente con @default(now())
        },
      });
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      // Podríamos lanzar una excepción aquí o manejar el error de otra manera
    }
  }
}
