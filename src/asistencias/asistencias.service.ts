import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAsistenciaDto,
  UpdateAsistenciaDto,
  AsistenciaResponse,
} from './dto';

@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  // Crear o actualizar asistencias (individual o bloque)
  async create(createAsistenciaDto: CreateAsistenciaDto[]): Promise<AsistenciaResponse[]> {
    const resultados: AsistenciaResponse[] = [];

    for (const asistencia of createAsistenciaDto) {
      const {
        id_alumno,
        id_asignatura,
        id_orientador,
        fecha,
        estado,
        observacion,
        anio_academico,
        trimestre,
      } = asistencia;

      // Verificar que la asignatura exista
      const asignaturaExiste = await this.prisma.asignatura.findUnique({
        where: { id_asignatura },
      });
      if (!asignaturaExiste) {
        throw new NotFoundException(`La asignatura con ID ${id_asignatura} no existe.`);
      }

      // Verificar que el docente esté asignado a esa asignatura
      const docenteAsignado = await this.prisma.asignaturaOrientador.findFirst({
        where: { id_asignatura, id_orientador, activo: true },
      });
      if (!docenteAsignado) {
        throw new ConflictException(
          `El docente con ID ${id_orientador} no está asignado a la asignatura ${id_asignatura}.`,
        );
      }

      // Crear o actualizar la asistencia (clave compuesta)
      const registro = await this.prisma.asistencia.upsert({
        where: {
          id_alumno_id_asignatura_fecha: {
            id_alumno,
            id_asignatura,
            fecha: new Date(fecha),
          },
        },
        update: {
          estado,
          observacion,
          anio_academico,
          trimestre,
        },
        create: {
          id_alumno,
          id_asignatura,
          id_orientador,
          fecha: new Date(fecha),
          estado,
          observacion,
          anio_academico,
          trimestre,
        },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          asignatura: { select: { id_asignatura: true, nombre: true } },
          orientador: { select: { id_orientador: true, nombre: true, apellido: true } },
        },
      });

      resultados.push(registro as unknown as AsistenciaResponse);
    }

    return resultados;
  }

  // Obtener asistencias por asignatura y fecha específica
  async findByAsignaturaAndFecha(
    id_asignatura: number,
    fecha: string,
  ): Promise<AsistenciaResponse[]> {
    const asignaturaExiste = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
    });
    if (!asignaturaExiste) {
      throw new NotFoundException(`La asignatura con ID ${id_asignatura} no existe.`);
    }

    return this.prisma.asistencia.findMany({
      where: {
        id_asignatura,
        fecha: new Date(fecha),
      },
      include: {
        alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
        asignatura: { select: { id_asignatura: true, nombre: true } },
        orientador: { select: { id_orientador: true, nombre: true, apellido: true } },
      },
      orderBy: { id_alumno: 'asc' },
    }) as unknown as AsistenciaResponse[];
  }

  // Obtener asistencias por docente (orientador)
  async findByDocente(id_orientador: number): Promise<AsistenciaResponse[]> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_orientador },
      include: {
        alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
        asignatura: { select: { id_asignatura: true, nombre: true, id_curso: true } },
      },
      orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
    });

    if (!asistencias.length) {
      throw new NotFoundException(
        `El docente con ID ${id_orientador} no tiene asistencias registradas.`,
      );
    }

    return asistencias as unknown as AsistenciaResponse[];
  }

  // Obtener historial de asistencias de un alumno
  async findByAlumno(id_alumno: number): Promise<AsistenciaResponse[]> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_alumno },
      include: {
        asignatura: {
          select: { id_asignatura: true, nombre: true, id_curso: true },
        },
        orientador: {
          select: { id_orientador: true, nombre: true, apellido: true },
        },
      },
      orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
    });

    if (!asistencias.length) {
      throw new NotFoundException(
        `El alumno con ID ${id_alumno} no tiene asistencias registradas.`,
      );
    }

    return asistencias as unknown as AsistenciaResponse[];
  }

  // Actualizar asistencia
  async update(
    id_asistencia: number,
    updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    try {
      const asistencia = await this.prisma.asistencia.findUnique({
        where: { id_asistencia },
      });

      if (!asistencia) {
        throw new NotFoundException(`La asistencia con ID ${id_asistencia} no fue encontrada.`);
      }

      const asistenciaActualizada = await this.prisma.asistencia.update({
        where: { id_asistencia },
        data: {
          ...(updateAsistenciaDto.estado && { estado: updateAsistenciaDto.estado }),
          ...(updateAsistenciaDto.observacion && { observacion: updateAsistenciaDto.observacion }),
          ...(updateAsistenciaDto.trimestre && { trimestre: updateAsistenciaDto.trimestre }),
        },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          asignatura: { select: { id_asignatura: true, nombre: true } },
          orientador: { select: { id_orientador: true, nombre: true, apellido: true } },
        },
      });

      return asistenciaActualizada as unknown as AsistenciaResponse;
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

async getConsolidadoMensual(id_curso: number, anio: number, mes: number) {
  const inicioMes = new Date(anio, mes - 1, 1);
  const finMes = new Date(anio, mes, 0);

  // 1️⃣ Obtener asignaturas del curso
  const asignaturas = await this.prisma.asignatura.findMany({
    where: { id_curso },
    select: { id_asignatura: true, nombre: true },
  });

  if (!asignaturas.length)
    throw new NotFoundException(`El curso ${id_curso} no tiene asignaturas.`);

  // 2️⃣ Obtener asistencias dentro del mes
  const asistencias = await this.prisma.asistencia.findMany({
    where: {
      id_asignatura: { in: asignaturas.map(a => a.id_asignatura) },
      fecha: { gte: inicioMes, lte: finMes },
    },
    include: {
      alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
      asignatura: { select: { id_asignatura: true, nombre: true } },
    },
  });

  if (!asistencias.length)
    throw new NotFoundException(`No hay asistencias para ${mes}/${anio}.`);

  // 3️⃣ Agrupar por materia y alumno
  const consolidado: Record<number, any> = {};

  for (const a of asistencias) {
    const idAsig = a.asignatura.id_asignatura; // ✅ usar el id de la relación, no el de la tabla padre
    const idAlumno = a.alumno.id_alumno; // ✅ usar el id del include
    const estado = a.estado?.trim().toUpperCase() ?? '';

    // Crear materia si no existe
    if (!consolidado[idAsig]) {
      consolidado[idAsig] = {
        asignatura: a.asignatura.nombre,
        alumnos: {},
      };
    }

    // Crear alumno si no existe
    if (!consolidado[idAsig].alumnos[idAlumno]) {
      consolidado[idAsig].alumnos[idAlumno] = {
        alumno: a.alumno,
        presentes: 0,
        sin_permiso: 0,
      };
    }

    // ✅ Acumular asistencias correctamente
    if (estado === 'P') {
      consolidado[idAsig].alumnos[idAlumno].presentes += 1;
    } else if (estado === 'SP') {
      consolidado[idAsig].alumnos[idAlumno].sin_permiso += 1;
    }
  }

  // 4️⃣ Convertir el resultado a formato plano
  const resultado: {
    id_asignatura: number;
    nombre_asignatura: string;
    id_alumno: number;
    nombre_alumno: string;
    apellido_alumno: string;
    presentes: number;
    sin_permiso: number;
  }[] = [];

  for (const [idAsig, datosAsig] of Object.entries(consolidado) as [string, any][]) {
    for (const [idAlumno, datosAlum] of Object.entries(datosAsig.alumnos) as [string, any][]) {
      resultado.push({
        id_asignatura: Number(idAsig),
        nombre_asignatura: datosAsig.asignatura,
        id_alumno: Number(idAlumno),
        nombre_alumno: datosAlum.alumno.nombre,
        apellido_alumno: datosAlum.alumno.apellido,
        presentes: datosAlum.presentes,
        sin_permiso: datosAlum.sin_permiso,
      });
    }
  }

  // 5️⃣ Ordenar alfabeticamente
  resultado.sort((a, b) =>
    a.nombre_asignatura.localeCompare(b.nombre_asignatura) ||
    a.nombre_alumno.localeCompare(b.nombre_alumno)
  );

  return resultado;
}

async getConsolidadoTrimestral(id_curso: number, anio: number, trimestre: number) {
  const trimestres = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
  };

  const meses = trimestres[trimestre];
  if (!meses)
    throw new BadRequestException(`Trimestre ${trimestre} inválido. Debe estar entre 1 y 4.`);

  const inicio = new Date(anio, meses[0] - 1, 1);
  const fin = new Date(anio, meses[2], 0);

  // 1️⃣ Obtener las asignaturas del curso
  const asignaturas = await this.prisma.asignatura.findMany({
    where: { id_curso },
    select: { id_asignatura: true, nombre: true },
  });

  if (!asignaturas.length)
    throw new NotFoundException(`El curso ${id_curso} no tiene asignaturas.`);

  // 2️⃣ Buscar asistencias dentro del rango del trimestre
  const asistencias = await this.prisma.asistencia.findMany({
    where: {
      id_asignatura: { in: asignaturas.map(a => a.id_asignatura) },
      fecha: { gte: inicio, lte: fin },
    },
    include: {
      alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
      asignatura: { select: { id_asignatura: true, nombre: true } },
    },
  });

  if (!asistencias.length)
    throw new NotFoundException(`No hay asistencias registradas en el trimestre ${trimestre}/${anio}.`);

  // 3️⃣ Agrupar por asignatura y alumno
  const consolidado: Record<number, any> = {};

  for (const a of asistencias) {
    const idAsig = a.asignatura.id_asignatura;
    const idAlumno = a.alumno.id_alumno;
    const estado = a.estado?.trim().toUpperCase() ?? '';

    if (!consolidado[idAsig]) {
      consolidado[idAsig] = {
        asignatura: a.asignatura.nombre,
        alumnos: {},
      };
    }

    if (!consolidado[idAsig].alumnos[idAlumno]) {
      consolidado[idAsig].alumnos[idAlumno] = {
        alumno: a.alumno,
        presentes: 0,
        sin_permiso: 0,
      };
    }

    // ✅ Acumular asistencias
    if (estado === 'P') {
      consolidado[idAsig].alumnos[idAlumno].presentes += 1;
    } else if (estado === 'SP') {
      consolidado[idAsig].alumnos[idAlumno].sin_permiso += 1;
    }
  }

  // 4️⃣ Convertir a formato plano con nota de conducta
  const resultado: {
    id_asignatura: number;
    nombre_asignatura: string;
    id_alumno: number;
    nombre_alumno: string;
    apellido_alumno: string;
    presentes: number;
    sin_permiso: number;
    conducta: number;
  }[] = [];

  for (const [idAsig, datosAsig] of Object.entries(consolidado) as [string, any][]) {
    for (const [idAlumno, datosAlum] of Object.entries(datosAsig.alumnos) as [string, any][]) {
      // 🧮 Calcular conducta: base 10 - (faltas * 1)
      const faltas = datosAlum.sin_permiso;
      const conducta = Math.max(10 - faltas * 1, 0); // nunca menor que 0

      resultado.push({
        id_asignatura: Number(idAsig),
        nombre_asignatura: datosAsig.asignatura,
        id_alumno: Number(idAlumno),
        nombre_alumno: datosAlum.alumno.nombre,
        apellido_alumno: datosAlum.alumno.apellido,
        presentes: datosAlum.presentes,
        sin_permiso: datosAlum.sin_permiso,
        conducta,
      });
    }
  }

  // 5️⃣ Ordenar resultados
  resultado.sort((a, b) =>
    a.nombre_asignatura.localeCompare(b.nombre_asignatura) ||
    a.nombre_alumno.localeCompare(b.nombre_alumno)
  );

  return resultado;
}

}
