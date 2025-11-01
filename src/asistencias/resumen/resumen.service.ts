import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
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

    // 3. ✅ CORREGIDO: Agrupar conteos de asistencia por ALUMNOS del curso
    const conteos = await this.prisma.asistencia.groupBy({
      by: ['id_alumno', 'estado'],
      where: {
        id_alumno: { in: idsAlumnos }, // ✅ Buscar por alumnos del curso
        fecha: { gte: startDate, lte: endDate },
        estado: {
          in: [EstadoAsistencia.E, EstadoAsistencia.SP, EstadoAsistencia.A],
        },
      },
      _count: { id_asistencia: true },
    });

    // 4. Mapear resultados
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
        justificadas: getCount(EstadoAsistencia.E),
        injustificadas: getCount(EstadoAsistencia.SP),
        atrasos: getCount(EstadoAsistencia.A),
      };
    });
  }

  /**
   * REEMPLAZA LA VISTA 'TRIMESTRAL.CSV'
   * Devuelve el resumen trimestral combinado de asistencia E infracciones.
   *
   * INCLUYE CÁLCULO AUTOMÁTICO DE PUNTUACIÓN DE CONDUCTA:
   * Fórmula: 10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
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
      return [];
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
      return [];
    }

    // 2. ✅ CORREGIDO: Obtener Resumen de Asistencia del Trimestre por ALUMNOS
    const conteosAsistencia = await this.prisma.asistencia.groupBy({
      by: ['id_alumno', 'estado'],
      where: {
        id_alumno: { in: idsAlumnos }, // ✅ Buscar por alumnos del curso
        trimestre: trimestre,
        anio_academico: anioAcademicoStr,
        estado: {
          in: [EstadoAsistencia.E, EstadoAsistencia.SP, EstadoAsistencia.A],
        },
      },
      _count: { id_asistencia: true },
    });

    // 3. Obtener Resumen de Infracciones del Trimestre
    const conteosConductaAgrupados = await this.prisma.conducta.groupBy({
      by: ['id_alumno', 'id_infraccion_catalogo'],
      where: {
        id_alumno: { in: alumnos.map((a) => a.id_alumno) },
        trimestre: trimestre,
        anio_academico: anioAcademicoStr,
      },
      _count: { id_conducta: true },
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
      const atrasos =
        asistenciasAlumno.find((c) => c.estado === EstadoAsistencia.A)?._count
          .id_asistencia || 0;

      // --- Parte de Conducta (Infracciones) ---
      const conductasAlumno = conteosConductaAgrupados.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );

      let totalMenosGraves = 0;
      let totalGraves = 0;
      let totalMuyGraves = 0;

      const infracciones = conductasAlumno.map((c) => {
        const catalogo = catalogoInfracciones.find(
          (cat) => cat.id_infraccion === c.id_infraccion_catalogo,
        );
        const conteo = c._count.id_conducta;
        const categoria = catalogo?.categoria || 'DESCONOCIDA';

        if (categoria === 'MENOS_GRAVE') {
          totalMenosGraves += conteo;
        } else if (categoria === 'GRAVE') {
          totalGraves += conteo;
        } else if (categoria === 'MUY_GRAVE') {
          totalMuyGraves += conteo;
        }

        return {
          categoria,
          articulo: catalogo?.articulo || 'N/A',
          descripcion: catalogo?.descripcion || 'N/A',
          conteo,
        };
      });

      // --- CÁLCULO DE PUNTUACIÓN DE CONDUCTA ---
      // Fórmula: 10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
      const puntuacionConducta =
        10 -
        injustificadas * 0.2 -
        totalMenosGraves * 1 -
        totalGraves * 2 -
        totalMuyGraves * 3;

      const puntuacionFinal = Math.max(0, puntuacionConducta);

      return {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        total_justificadas: justificadas,
        total_injustificadas: injustificadas,
        total_atrasos: atrasos,
        infracciones,
        total_menos_graves: totalMenosGraves,
        total_graves: totalGraves,
        total_muy_graves: totalMuyGraves,
        puntuacion_conducta: parseFloat(puntuacionFinal.toFixed(1)),
      };
    });
  }
}
