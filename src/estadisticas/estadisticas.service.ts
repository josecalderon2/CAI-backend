import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  cantidad: number;
  tipo: string;
}

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

  /**
   * Obtiene estadísticas generales del dashboard administrativo
   * @returns Objeto con estadísticas generales del sistema
   */
  async getDashboardGeneral() {
    // Obtener fecha de inicio del mes actual
    const now = new Date();
    const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);

    // Contar totales
    const totalAlumnos = await this.prisma.alumno.count();
    const alumnosActivos = await this.prisma.alumno.count({
      where: { activo: true },
    });
    const cursosActivos = await this.prisma.curso.count({
      where: { activo: true },
    });
    const asignaturasTotal = await this.prisma.asignatura.count();
    const docentesActivos = await this.prisma.orientador.count({
      where: { activo: true },
    });

    // Calcular cambios del mes actual
    const cambioAlumnos = await this.prisma.alumno.count({
      where: {
        fechaMatricula: {
          gte: inicioMesActual,
        },
      },
    });

    const cambioDocentes = await this.prisma.orientador.count({
      where: {
        createdAt: {
          gte: inicioMesActual,
        },
      },
    });

    // Cambios de cursos y asignaturas son 0 (no tienen fecha de creación)
    const cambioCursos = 0;
    const cambioAsignaturas = 0;

    return {
      totalAlumnos,
      alumnosActivos,
      cursosActivos,
      asignaturasTotal,
      docentesActivos,
      cambioAlumnos,
      cambioCursos,
      cambioAsignaturas,
      cambioDocentes,
    };
  }

  /**
   * Obtiene tareas pendientes con prioridades
   * @returns Array de tareas pendientes organizadas por prioridad
   */
  async getTareasPendientes() {
    const tareas: Tarea[] = [];

    // Alumnos inactivos que requieren atención
    const alumnosInactivos = await this.prisma.alumno.count({
      where: { activo: false },
    });

    if (alumnosInactivos > 0) {
      tareas.push({
        id: 1,
        titulo: 'Alumnos inactivos',
        descripcion: `Hay ${alumnosInactivos} alumno(s) marcado(s) como inactivo(s)`,
        prioridad: 'media',
        cantidad: alumnosInactivos,
        tipo: 'alumnos',
      });
    }

    // Cursos sin orientador asignado
    const cursosSinOrientador = await this.prisma.curso.count({
      where: {
        activo: true,
        id_orientador: null,
      },
    });

    if (cursosSinOrientador > 0) {
      tareas.push({
        id: 2,
        titulo: 'Cursos sin orientador',
        descripcion: `${cursosSinOrientador} curso(s) activo(s) sin orientador asignado`,
        prioridad: 'alta',
        cantidad: cursosSinOrientador,
        tipo: 'cursos',
      });
    }

    // Alumnos sin curso asignado
    const alumnosSinCurso = await this.prisma.alumno.count({
      where: {
        activo: true,
        inscripciones: {
          none: {},
        },
      },
    });

    if (alumnosSinCurso > 0) {
      tareas.push({
        id: 3,
        titulo: 'Alumnos sin curso',
        descripcion: `${alumnosSinCurso} alumno(s) activo(s) sin curso asignado`,
        prioridad: 'alta',
        cantidad: alumnosSinCurso,
        tipo: 'alumnos',
      });
    }

    // Docentes inactivos
    const docentesInactivos = await this.prisma.orientador.count({
      where: { activo: false },
    });

    if (docentesInactivos > 0) {
      tareas.push({
        id: 4,
        titulo: 'Docentes inactivos',
        descripcion: `${docentesInactivos} docente(s) marcado(s) como inactivo(s)`,
        prioridad: 'baja',
        cantidad: docentesInactivos,
        tipo: 'docentes',
      });
    }

    // Si no hay tareas pendientes
    if (tareas.length === 0) {
      return {
        mensaje: 'No hay tareas pendientes',
        tareas: [],
      };
    }

    return {
      total: tareas.length,
      tareas: tareas.sort((a, b) => {
        const prioridades = { alta: 3, media: 2, baja: 1 };
        return prioridades[b.prioridad] - prioridades[a.prioridad];
      }),
    };
  }

  /**
   * Obtiene resumen de actividades del mes actual
   * @returns Objeto con resumen mensual de actividades
   */
  async getResumenMensual() {
    const now = new Date();
    const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
    const nombreMes = now.toLocaleDateString('es-ES', { month: 'long' });
    const año = now.getFullYear();

    // Nuevas matrículas del mes
    const nuevasMatriculas = await this.prisma.alumno.count({
      where: {
        fechaMatricula: {
          gte: inicioMesActual,
        },
      },
    });

    // Nuevos docentes del mes
    const nuevosDocentes = await this.prisma.orientador.count({
      where: {
        createdAt: {
          gte: inicioMesActual,
        },
      },
    });

    // Asistencias registradas del mes
    const asistenciasRegistradas = await this.prisma.asistencia.count({
      where: {
        fecha: {
          gte: inicioMesActual,
        },
      },
    });

    // Calificaciones registradas del mes
    const calificacionesRegistradas = await this.prisma.notas.count({
      where: {
        fecha_registro: {
          gte: inicioMesActual,
        },
      },
    });

    // Alumnos activos actuales
    const alumnosActivos = await this.prisma.alumno.count({
      where: { activo: true },
    });

    // Cursos activos actuales
    const cursosActivos = await this.prisma.curso.count({
      where: { activo: true },
    });

    return {
      mes: `${nombreMes} ${año}`,
      nuevasMatriculas,
      nuevosDocentes,
      asistenciasRegistradas,
      calificacionesRegistradas,
      alumnosActivos,
      cursosActivos,
      resumen: {
        totalActividades:
          nuevasMatriculas +
          nuevosDocentes +
          asistenciasRegistradas +
          calificacionesRegistradas,
      },
    };
  }
}
