import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service'; // Asegúrate que esta ruta sea correcta
import { CreateConductaDto } from './dto/create-conducta.dto';
import { UpdateConductaDto } from './dto/update-conducta.dto';
import { CreateInfraccionCatalogoDto } from './dto/create-infraccion-catalogo.dto';
import { UpdateInfraccionCatalogoDto } from './dto/update-infraccion-catalogo.dto';
import { FiltrosConductaDto } from './dto/filtros-conducta.dto';

@Injectable()
export class ConductaAsistenciaService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // ===     Gestión de Catálogo de Infracciones        ===
  // ======================================================

  async createCatalogo(dto: CreateInfraccionCatalogoDto) {
    return this.prisma.infraccionCatalogo.create({
      data: dto,
    });
  }

  async findAllCatalogo() {
    return this.prisma.infraccionCatalogo.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { articulo: 'asc' }],
    });
  }

  async findOneCatalogo(id_infraccion: number) {
    const infraccion = await this.prisma.infraccionCatalogo.findUnique({
      where: { id_infraccion },
    });
    if (!infraccion) {
      throw new NotFoundException(
        `Infracción de catálogo con ID ${id_infraccion} no encontrada.`,
      );
    }
    return infraccion;
  }

  async updateCatalogo(
    id_infraccion: number,
    dto: UpdateInfraccionCatalogoDto,
  ) {
    await this.findOneCatalogo(id_infraccion); // Verifica que exista
    return this.prisma.infraccionCatalogo.update({
      where: { id_infraccion },
      data: dto,
    });
  }

  async removeCatalogo(id_infraccion: number) {
    await this.findOneCatalogo(id_infraccion); // Verifica que exista
    return this.prisma.infraccionCatalogo.update({
      where: { id_infraccion },
      data: { activo: false },
    });
  }

  // ======================================================
  // ===      Gestión de Instancias de Conducta         ===
  // ======================================================

  async create(dto: CreateConductaDto) {
    return this.prisma.conducta.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.conducta.findMany({
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        infraccion: true, // Incluye la info del catálogo
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id_conducta: number) {
    const conducta = await this.prisma.conducta.findUnique({
      where: { id_conducta },
      include: {
        alumno: true,
        infraccion: true,
        orientador: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
      },
    });
    if (!conducta) {
      throw new NotFoundException(
        `Registro de conducta con ID ${id_conducta} no encontrado.`,
      );
    }
    return conducta;
  }

  async findByStudent(id_alumno: number) {
    return this.prisma.conducta.findMany({
      where: { id_alumno },
      include: {
        infraccion: true,
        orientador: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async update(id_conducta: number, dto: UpdateConductaDto) {
    await this.findOne(id_conducta); // Verifica que exista
    return this.prisma.conducta.update({
      where: { id_conducta },
      data: dto,
    });
  }

  async remove(id_conducta: number) {
    await this.findOne(id_conducta); // Verifica que exista
    return this.prisma.conducta.delete({
      where: { id_conducta },
    });
  }

  // ======================================================
  // ===  Obtener alumnos con infracciones (Admin)      ===
  // ======================================================

  /**
   * Obtiene todos los años académicos disponibles en los registros de conducta
   * Incluye información de trimestres disponibles y cantidad de registros por año
   * @returns Lista de años académicos con sus trimestres y estadísticas
   */
  async getAniosDisponibles() {
    // Obtener todos los registros de conducta agrupados por año y trimestre
    const registros = await this.prisma.conducta.groupBy({
      by: ['anio_academico', 'trimestre'],
      _count: {
        id_conducta: true,
      },
      orderBy: [{ anio_academico: 'desc' }, { trimestre: 'asc' }],
    });

    // Agrupar por año académico
    const aniosPorAnio = registros.reduce(
      (acc, registro) => {
        const anio = registro.anio_academico;
        // Filtrar registros sin año académico
        if (!anio) return acc;

        if (!acc[anio]) {
          acc[anio] = {
            anio_academico: anio,
            trimestres_disponibles: [],
            total_registros: 0,
          };
        }
        
        // Solo agregar trimestre si existe
        if (registro.trimestre) {
          acc[anio].trimestres_disponibles.push(registro.trimestre);
        }
        acc[anio].total_registros += registro._count.id_conducta;
        return acc;
      },
      {} as Record<
        string,
        {
          anio_academico: string;
          trimestres_disponibles: number[];
          total_registros: number;
        }
      >,
    );

    // Convertir a array y ordenar trimestres
    const aniosArray = Object.values(aniosPorAnio).map((anio) => ({
      ...anio,
      trimestres_disponibles: anio.trimestres_disponibles.sort((a, b) => a - b),
    }));

    return {
      total_anios: aniosArray.length,
      anios: aniosArray,
    };
  }

  /**
   * Obtiene todos los alumnos QUE TIENEN infracciones aplicando filtros opcionales
   * IMPORTANTE: Solo retorna alumnos con al menos 1 infracción (excluye alumnos sin infracciones)
   * @param filtros - Objeto con filtros opcionales (id_curso, anio_academico, trimestre)
   * @returns Lista de alumnos con infracciones (excluye alumnos sin infracciones)
   */
  async findAlumnosConInfracciones(filtros: FiltrosConductaDto) {
    const { id_curso, anio_academico, trimestre } = filtros;

    // Construir el where para la consulta de alumnos
    const whereAlumnos: any = {
      activo: true,
    };

    // Si se especifica un curso, filtrar alumnos por curso
    if (id_curso) {
      whereAlumnos.inscripciones = {
        some: {
          cursoId: id_curso,
          estado: 'ACTIVO',
        },
      };
    }

    // Obtener alumnos según filtros
    const alumnos = await this.prisma.alumno.findMany({
      where: whereAlumnos,
      include: {
        inscripciones: {
          where: id_curso
            ? { cursoId: id_curso, estado: 'ACTIVO' }
            : { estado: 'ACTIVO' },
          include: {
            curso: {
              select: {
                id_curso: true,
                nombre: true,
                seccion: true,
                gradoAcademico: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    // Para cada alumno, obtener sus infracciones aplicando filtros
    const alumnosConInfracciones = await Promise.all(
      alumnos.map(async (alumno) => {
        // Construir filtros para las conductas
        const whereConductas: any = {
          id_alumno: alumno.id_alumno,
        };

        if (anio_academico) {
          whereConductas.anio_academico = anio_academico;
        }

        if (trimestre) {
          whereConductas.trimestre = trimestre;
        }

        // Obtener infracciones del alumno
        const infracciones = await this.prisma.conducta.findMany({
          where: whereConductas,
          include: {
            infraccion: true,
            orientador: {
              select: {
                id_orientador: true,
                nombre: true,
                apellido: true,
              },
            },
            asignatura: {
              select: {
                id_asignatura: true,
                nombre: true,
              },
            },
          },
          orderBy: { fecha: 'desc' },
        });

        // Calcular estadísticas de infracciones
        const totalInfracciones = infracciones.length;
        const totalPuntos = infracciones.reduce(
          (sum, infraccion) => sum + (infraccion.infraccion.puntos || 0),
          0,
        );

        // Agrupar por categoría
        const porCategoria = infracciones.reduce(
          (acc, infraccion) => {
            const categoria = infraccion.infraccion.categoria;
            if (!acc[categoria]) {
              acc[categoria] = {
                cantidad: 0,
                puntos: 0,
              };
            }
            acc[categoria].cantidad += 1;
            acc[categoria].puntos += infraccion.infraccion.puntos || 0;
            return acc;
          },
          {} as Record<string, { cantidad: number; puntos: number }>,
        );

        return {
          id_alumno: alumno.id_alumno,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          cursos: alumno.inscripciones.map((inscripcion) => ({
            id_curso: inscripcion.curso.id_curso,
            nombre: inscripcion.curso.nombre,
            seccion: inscripcion.curso.seccion,
            grado: inscripcion.curso.gradoAcademico?.nombre,
            anio_academico: inscripcion.anioAcademico,
          })),
          estadisticas: {
            total_infracciones: totalInfracciones,
            total_puntos: totalPuntos,
            por_categoria: porCategoria,
          },
          infracciones: infracciones.map((infraccion) => ({
            id_conducta: infraccion.id_conducta,
            fecha: infraccion.fecha,
            categoria: infraccion.infraccion.categoria,
            articulo: infraccion.infraccion.articulo,
            descripcion: infraccion.infraccion.descripcion,
            puntos: infraccion.infraccion.puntos,
            observacion: infraccion.observacion,
            anio_academico: infraccion.anio_academico,
            trimestre: infraccion.trimestre,
            orientador: infraccion.orientador
              ? {
                  id_orientador: infraccion.orientador.id_orientador,
                  nombre: infraccion.orientador.nombre,
                  apellido: infraccion.orientador.apellido,
                }
              : null,
            asignatura: infraccion.asignatura
              ? {
                  id_asignatura: infraccion.asignatura.id_asignatura,
                  nombre: infraccion.asignatura.nombre,
                }
              : null,
          })),
        };
      }),
    );

    // Filtrar solo alumnos que tienen infracciones (excluir los que tienen 0)
    const alumnosConInfraccionesFiltrados = alumnosConInfracciones.filter(
      (alumno) => alumno.estadisticas.total_infracciones > 0,
    );

    // Retornar resumen y datos
    return {
      filtros_aplicados: {
        id_curso,
        anio_academico,
        trimestre,
      },
      total_alumnos: alumnosConInfraccionesFiltrados.length,
      alumnos: alumnosConInfraccionesFiltrados,
    };
  }
}
