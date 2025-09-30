import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el conteo de administrativos y orientadores
   * @returns Objeto con el conteo de administrativos, orientadores y el total
   */
  async contarPersonal() {
    // Contar administrativos activos
    const totalAdministrativos = await this.prisma.administrativo.count({
      where: {
        activo: true,
      },
    });

    // Contar orientadores activos
    const totalOrientadores = await this.prisma.orientador.count({
      where: {
        activo: true,
      },
    });

    // Calcular el total general de usuarios registrados
    const totalPersonal = totalAdministrativos + totalOrientadores;

    // Obtener todos los cargos administrativos
    const cargos = await this.prisma.cargo_administrativo.findMany();

    // Contar administrativos por tipo de cargo
    const administrativosPorCargo = await Promise.all(
      cargos.map(async (cargo) => {
        const count = await this.prisma.administrativo.count({
          where: {
            id_cargo_administrativo: cargo.id_cargo_administrativo,
            activo: true,
          },
        });

        return {
          cargo: cargo.nombre,
          cantidad: count,
        };
      }),
    );

    return {
      detalles: {
        administrativos: totalAdministrativos,
        orientadores: totalOrientadores,
        administrativosPorCargo,
      },
      totalUsuariosRegistrados: totalPersonal,
    };
  }
}
