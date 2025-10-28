import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service'; // Ajusta la ruta
import { EstadoAsistencia, Prisma } from '@prisma/client';
import { ResumenMensualDto } from './dto/resumen-mensual.dto';
import { ResumenTrimestralDto } from './dto/resumen-trimestral.dto';

@Injectable()
export class ResumenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REEMPLAZA LA VISTA 'CONSOLIDADOS.CSV'
   * Devuelve el resumen mensual de asistencia para un curso.
   */
  async getResumenMensualAsistencia(query: ResumenMensualDto) {
    const { cursoId, mes, anio } = query;

    // 1. Calcular rango de fechas
    const startDate = new Date(anio, mes - 1, 1);
    const endDate = new Date(anio, mes, 0, 23, 59, 59);

    // 2. Obtener alumnos del curso usando la tabla pivote AlumnoCurso
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: cursoId,
        estado: 'ACTIVO',
        anioAcademico: anio.toString(),
      },
      select: {
        alumnoId: true,
      },
    });

    if (inscripciones.length === 0) {
      return []; // No hay alumnos inscritos
    }

    const idsAlumnos = inscripciones.map((i) => i.alumnoId);

    const alumnos = await this.prisma.alumno.findMany({
      where: {
        id_alumno: { in: idsAlumnos },
        activo: true,
      },
      select: { id_alumno: true, nombre: true, apellido: true },
      orderBy: { apellido: 'asc' },
    });

    // 3. Agrupar conteos de asistencia (sólo ausencias y atrasos)
    const conteos = await this.prisma.asistencia.groupBy({
      by: ['id_alumno', 'estado'],
      where: {
        asignatura: { id_curso: cursoId },
        fecha: { gte: startDate, lte: endDate },
        estado: {
          in: [EstadoAsistencia.E, EstadoAsistencia.SP, EstadoAsistencia.A],
        },
      },
      _count: { id_asistencia: true },
    });

    // 4. Mapear resultados (idéntico a la lógica del Consolidados.csv)
    return alumnos.map((alumno) => {
      const conteosAlumno = conteos.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );

      const getCount = (estado: EstadoAsistencia) =>
        conteosAlumno.find((c) => c.estado === estado)?._count.id_asistencia ||
        0;

      return {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        // Lógica del CSV: 'E' (Excusado) se cuenta como 'P' (justificadas)
        justificadas: getCount(EstadoAsistencia.E),
        injustificadas: getCount(EstadoAsistencia.SP),
        atrasos: getCount(EstadoAsistencia.A),
      };
    });
  }

  /**
   * REEMPLAZA LA VISTA 'TRIMESTRAL.CSV'
   * Devuelve el resumen trimestral combinado de asistencia E infracciones.
   */
  async getResumenTrimestral(query: ResumenTrimestralDto) {
    const { cursoId, trimestre, anio } = query;
    const anioAcademicoStr = anio.toString();

    // 1. Obtener alumnos del curso usando la tabla pivote AlumnoCurso
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: cursoId,
        estado: 'ACTIVO',
        anioAcademico: anioAcademicoStr,
      },
      select: {
        alumnoId: true,
      },
    });

    if (inscripciones.length === 0) {
      return []; // No hay alumnos inscritos
    }

    const idsAlumnos = inscripciones.map((i) => i.alumnoId);

    const alumnos = await this.prisma.alumno.findMany({
      where: {
        id_alumno: { in: idsAlumnos },
        activo: true,
      },
      select: { id_alumno: true, nombre: true, apellido: true },
      orderBy: { apellido: 'asc' },
    });

    if (alumnos.length === 0) {
      return []; // No hay alumnos, devolver array vacío
    }

    // 2. Obtener Resumen de Asistencia del Trimestre
    const conteosAsistencia = await this.prisma.asistencia.groupBy({
      by: ['id_alumno', 'estado'],
      where: {
        asignatura: { id_curso: cursoId },
        trimestre: trimestre,
        anio_academico: anioAcademicoStr,
        estado: { in: [EstadoAsistencia.E, EstadoAsistencia.SP] },
      },
      _count: { id_asistencia: true },
    });

    // 3. Obtener Resumen de Infracciones del Trimestre
    // Agrupamos por alumno Y por tipo de infracción
    const conteosConductaAgrupados = await this.prisma.conducta.groupBy({
      by: ['id_alumno', 'id_infraccion_catalogo'],
      where: {
        id_alumno: { in: alumnos.map((a) => a.id_alumno) },
        trimestre: trimestre,
        anio_academico: anioAcademicoStr,
      },
      _count: { id_conducta: true }, // Contamos cuántas veces se cometió
      // Podríamos sumar puntos si quisiéramos:
      // _sum: { infraccion: { select: { puntos: true } } },
    });

    // 4. Obtener los detalles de las infracciones contadas
    const infraccionIds = [
      ...new Set(conteosConductaAgrupados.map((c) => c.id_infraccion_catalogo)),
    ];
    const catalogoInfracciones = await this.prisma.infraccionCatalogo.findMany({
      where: { id_infraccion: { in: infraccionIds } },
    });

    // 5. Combinar los datos para cada alumno
    return alumnos.map((alumno) => {
      // --- Parte de Asistencia ---
      const asistenciasAlumno = conteosAsistencia.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );
      const justificadas =
        asistenciasAlumno.find((c) => c.estado === EstadoAsistencia.E)?._count
          .id_asistencia || 0;
      const injustificadas =
        asistenciasAlumno.find((c) => c.estado === EstadoAsistencia.SP)?._count
          .id_asistencia || 0;

      // --- Parte de Conducta (Infracciones) ---
      const conductasAlumno = conteosConductaAgrupados.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );

      // Mapeamos a la estructura del CSV
      const infracciones = conductasAlumno.map((c) => {
        const catalogo = catalogoInfracciones.find(
          (cat) => cat.id_infraccion === c.id_infraccion_catalogo,
        );
        return {
          categoria: catalogo?.categoria || 'DESCONOCIDA',
          articulo: catalogo?.articulo || 'N/A',
          // descripcion: catalogo?.descripcion || 'N/A',
          conteo: c._count.id_conducta, // Esto es lo que pide el CSV
          // puntos_totales: c._sum.infraccion.puntos, // Opcional
        };
      });

      return {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        total_justificadas: justificadas, // 'P' en el CSV
        total_injustificadas: injustificadas, // 'SP' en el CSV
        infracciones,
      };
    });
  }
}
