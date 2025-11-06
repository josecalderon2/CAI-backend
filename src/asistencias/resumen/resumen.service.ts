import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EstadoAsistencia } from '@prisma/client';
import { ResumenMensualDto } from './dto/resumen-mensual.dto';
import { ResumenTrimestralDto } from './dto/resumen-trimestral.dto';
import { ResumenAnualDto } from './dto/resumen-anual.dto';
import { ResumenTrimestralConsolidadoDto } from './dto/resumen-trimestral-consolidado.dto';

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

  /**
   * Devuelve el resumen anual combinado de asistencia e infracciones.
   *
   * INCLUYE CÁLCULO AUTOMÁTICO DE PUNTUACIÓN DE CONDUCTA ANUAL:
   * Fórmula: 10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
   *
   * Agrega datos de los 4 trimestres y proporciona desglose trimestral.
   */
  async getResumenAnual(query: ResumenAnualDto) {
    const { cursoId, anio } = query;
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

    // 2. Obtener resumen de asistencia anual (todos los trimestres)
    const conteosAsistencia = await this.prisma.asistencia.groupBy({
      by: ['id_alumno', 'estado', 'trimestre'],
      where: {
        id_alumno: { in: idsAlumnos },
        anio_academico: anioAcademicoStr,
        estado: {
          in: [EstadoAsistencia.E, EstadoAsistencia.SP, EstadoAsistencia.A],
        },
      },
      _count: { id_asistencia: true },
    });

    // 3. Obtener resumen de infracciones anuales (todos los trimestres)
    const conteosConductaAgrupados = await this.prisma.conducta.groupBy({
      by: ['id_alumno', 'id_infraccion_catalogo', 'trimestre'],
      where: {
        id_alumno: { in: idsAlumnos },
        anio_academico: anioAcademicoStr,
      },
      _count: { id_conducta: true },
    });

    // 4. Obtener detalles de las infracciones
    const infraccionIds = [
      ...new Set(conteosConductaAgrupados.map((c) => c.id_infraccion_catalogo)),
    ];
    const catalogoInfracciones = await this.prisma.infraccionCatalogo.findMany({
      where: { id_infraccion: { in: infraccionIds } },
    });

    // 5. Combinar datos para cada alumno
    return alumnos.map((alumno) => {
      const asistenciasAlumno = conteosAsistencia.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );
      const conductasAlumno = conteosConductaAgrupados.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );

      // --- TOTALES ANUALES DE ASISTENCIA ---
      let totalJustificadasAnual = 0;
      let totalInjustificadasAnual = 0;
      let totalAtrasosAnual = 0;

      // --- TOTALES ANUALES DE INFRACCIONES ---
      let totalMenosGravesAnual = 0;
      let totalGravesAnual = 0;
      let totalMuyGravesAnual = 0;

      // --- DESGLOSE TRIMESTRAL ---
      const desgloseTrimestral: any = {
        trimestre_1: {
          total_injustificadas: 0,
          total_menos_graves: 0,
          total_graves: 0,
          total_muy_graves: 0,
          puntuacion: 10,
        },
        trimestre_2: {
          total_injustificadas: 0,
          total_menos_graves: 0,
          total_graves: 0,
          total_muy_graves: 0,
          puntuacion: 10,
        },
        trimestre_3: {
          total_injustificadas: 0,
          total_menos_graves: 0,
          total_graves: 0,
          total_muy_graves: 0,
          puntuacion: 10,
        },
        trimestre_4: {
          total_injustificadas: 0,
          total_menos_graves: 0,
          total_graves: 0,
          total_muy_graves: 0,
          puntuacion: 10,
        },
      };

      // Calcular por trimestre
      for (let t = 1; t <= 4; t++) {
        const trimestreKey =
          `trimestre_${t}` as keyof typeof desgloseTrimestral;

        // Asistencia del trimestre
        const asistenciasTrimestre = asistenciasAlumno.filter(
          (a) => a.trimestre === t,
        );
        const justificadasT =
          asistenciasTrimestre.find((a) => a.estado === EstadoAsistencia.E)
            ?._count.id_asistencia || 0;
        const injustificadasT =
          asistenciasTrimestre.find((a) => a.estado === EstadoAsistencia.SP)
            ?._count.id_asistencia || 0;
        const atrasosT =
          asistenciasTrimestre.find((a) => a.estado === EstadoAsistencia.A)
            ?._count.id_asistencia || 0;

        totalJustificadasAnual += justificadasT;
        totalInjustificadasAnual += injustificadasT;
        totalAtrasosAnual += atrasosT;

        // Infracciones del trimestre
        const conductasTrimestre = conductasAlumno.filter(
          (c) => c.trimestre === t,
        );
        let menosGravesT = 0;
        let gravesT = 0;
        let muyGravesT = 0;

        conductasTrimestre.forEach((c) => {
          const catalogo = catalogoInfracciones.find(
            (cat) => cat.id_infraccion === c.id_infraccion_catalogo,
          );
          const conteo = c._count.id_conducta;
          const categoria = catalogo?.categoria || 'DESCONOCIDA';

          if (categoria === 'MENOS_GRAVE') {
            menosGravesT += conteo;
          } else if (categoria === 'GRAVE') {
            gravesT += conteo;
          } else if (categoria === 'MUY_GRAVE') {
            muyGravesT += conteo;
          }
        });

        totalMenosGravesAnual += menosGravesT;
        totalGravesAnual += gravesT;
        totalMuyGravesAnual += muyGravesT;

        // Calcular puntuación trimestral
        const puntuacionT =
          10 -
          injustificadasT * 0.2 -
          menosGravesT * 1 -
          gravesT * 2 -
          muyGravesT * 3;

        desgloseTrimestral[trimestreKey] = {
          total_injustificadas: injustificadasT,
          total_menos_graves: menosGravesT,
          total_graves: gravesT,
          total_muy_graves: muyGravesT,
          puntuacion: parseFloat(Math.max(0, puntuacionT).toFixed(1)),
        };
      }

      // --- INFRACCIONES ANUALES (AGRUPADAS) ---
      const infraccionesAnuales = conductasAlumno.reduce(
        (acc, c) => {
          const catalogo = catalogoInfracciones.find(
            (cat) => cat.id_infraccion === c.id_infraccion_catalogo,
          );
          const conteo = c._count.id_conducta;
          const categoria = catalogo?.categoria || 'DESCONOCIDA';
          const articulo = catalogo?.articulo || 'N/A';
          const descripcion = catalogo?.descripcion || 'N/A';

          const existente = acc.find(
            (inf) => inf.articulo === articulo && inf.categoria === categoria,
          );

          if (existente) {
            existente.conteo += conteo;
          } else {
            acc.push({ categoria, articulo, descripcion, conteo });
          }

          return acc;
        },
        [] as Array<{
          categoria: string;
          articulo: string;
          descripcion: string;
          conteo: number;
        }>,
      );

      // --- PUNTUACIÓN ANUAL ---
      const puntuacionAnual =
        10 -
        totalInjustificadasAnual * 0.2 -
        totalMenosGravesAnual * 1 -
        totalGravesAnual * 2 -
        totalMuyGravesAnual * 3;

      return {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        total_justificadas: totalJustificadasAnual,
        total_injustificadas: totalInjustificadasAnual,
        total_atrasos: totalAtrasosAnual,
        infracciones: infraccionesAnuales,
        total_menos_graves: totalMenosGravesAnual,
        total_graves: totalGravesAnual,
        total_muy_graves: totalMuyGravesAnual,
        puntuacion_conducta_anual: parseFloat(
          Math.max(0, puntuacionAnual).toFixed(1),
        ),
        desglose_trimestral: desgloseTrimestral,
      };
    });
  }

  /**
   * Devuelve el resumen trimestral consolidado para todo el año académico.
   *
   * Muestra cada alumno con los datos completos de los 4 trimestres,
   * incluyendo totales anuales y promedios.
   *
   * Este reporte es útil para generar reportes completos del año con
   * el desglose trimestre por trimestre de cada alumno.
   */
  async getResumenTrimestralConsolidado(
    query: ResumenTrimestralConsolidadoDto,
  ) {
    const { cursoId, anio } = query;
    const anioAcademicoStr = anio.toString();

    // 1. Obtener alumnos del curso
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

    // 2. Obtener todas las asistencias del año (agrupadas por trimestre)
    const conteosAsistencia = await this.prisma.asistencia.groupBy({
      by: ['id_alumno', 'estado', 'trimestre'],
      where: {
        id_alumno: { in: idsAlumnos },
        anio_academico: anioAcademicoStr,
        estado: {
          in: [EstadoAsistencia.E, EstadoAsistencia.SP, EstadoAsistencia.A],
        },
      },
      _count: { id_asistencia: true },
    });

    // 3. Obtener todas las conductas del año (agrupadas por trimestre)
    const conteosConductaAgrupados = await this.prisma.conducta.groupBy({
      by: ['id_alumno', 'id_infraccion_catalogo', 'trimestre'],
      where: {
        id_alumno: { in: idsAlumnos },
        anio_academico: anioAcademicoStr,
      },
      _count: { id_conducta: true },
    });

    // 4. Obtener catálogo de infracciones
    const infraccionIds = [
      ...new Set(conteosConductaAgrupados.map((c) => c.id_infraccion_catalogo)),
    ];
    const catalogoInfracciones = await this.prisma.infraccionCatalogo.findMany({
      where: { id_infraccion: { in: infraccionIds } },
    });

    // 5. Procesar datos por alumno
    return alumnos.map((alumno) => {
      const asistenciasAlumno = conteosAsistencia.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );
      const conductasAlumno = conteosConductaAgrupados.filter(
        (c) => c.id_alumno === alumno.id_alumno,
      );

      // Totales anuales
      let totalAnualJustificadas = 0;
      let totalAnualInjustificadas = 0;
      let totalAnualAtrasos = 0;
      let totalAnualMenosGraves = 0;
      let totalAnualGraves = 0;
      let totalAnualMuyGraves = 0;

      const trimestres: any[] = [];
      let sumaPuntuaciones = 0;
      let trimestresConDatos = 0;

      // Procesar cada trimestre (1 a 4)
      for (let t = 1; t <= 4; t++) {
        // Asistencia del trimestre
        const asistenciasTrimestre = asistenciasAlumno.filter(
          (a) => a.trimestre === t,
        );
        const justificadas =
          asistenciasTrimestre.find((a) => a.estado === EstadoAsistencia.E)
            ?._count.id_asistencia || 0;
        const injustificadas =
          asistenciasTrimestre.find((a) => a.estado === EstadoAsistencia.SP)
            ?._count.id_asistencia || 0;
        const atrasos =
          asistenciasTrimestre.find((a) => a.estado === EstadoAsistencia.A)
            ?._count.id_asistencia || 0;

        totalAnualJustificadas += justificadas;
        totalAnualInjustificadas += injustificadas;
        totalAnualAtrasos += atrasos;

        // Conductas del trimestre
        const conductasTrimestre = conductasAlumno.filter(
          (c) => c.trimestre === t,
        );

        let menosGraves = 0;
        let graves = 0;
        let muyGraves = 0;

        const infracciones = conductasTrimestre.map((c) => {
          const catalogo = catalogoInfracciones.find(
            (cat) => cat.id_infraccion === c.id_infraccion_catalogo,
          );
          const conteo = c._count.id_conducta;
          const categoria = catalogo?.categoria || 'DESCONOCIDA';

          if (categoria === 'MENOS_GRAVE') {
            menosGraves += conteo;
          } else if (categoria === 'GRAVE') {
            graves += conteo;
          } else if (categoria === 'MUY_GRAVE') {
            muyGraves += conteo;
          }

          return {
            categoria,
            articulo: catalogo?.articulo || 'N/A',
            descripcion: catalogo?.descripcion || 'N/A',
            conteo,
          };
        });

        totalAnualMenosGraves += menosGraves;
        totalAnualGraves += graves;
        totalAnualMuyGraves += muyGraves;

        // Calcular puntuación del trimestre
        const puntuacionTrimestre =
          10 -
          injustificadas * 0.2 -
          menosGraves * 1 -
          graves * 2 -
          muyGraves * 3;

        const puntuacionFinal = parseFloat(
          Math.max(0, puntuacionTrimestre).toFixed(1),
        );

        // Acumular para promedio (solo trimestres con datos)
        if (
          justificadas > 0 ||
          injustificadas > 0 ||
          atrasos > 0 ||
          infracciones.length > 0
        ) {
          sumaPuntuaciones += puntuacionFinal;
          trimestresConDatos++;
        }

        trimestres.push({
          trimestre: t,
          total_justificadas: justificadas,
          total_injustificadas: injustificadas,
          total_atrasos: atrasos,
          infracciones,
          total_menos_graves: menosGraves,
          total_graves: graves,
          total_muy_graves: muyGraves,
          puntuacion_conducta: puntuacionFinal,
        });
      }

      // Calcular puntuación anual y promedio
      const puntuacionAnual =
        10 -
        totalAnualInjustificadas * 0.2 -
        totalAnualMenosGraves * 1 -
        totalAnualGraves * 2 -
        totalAnualMuyGraves * 3;

      const promedioTrimestral =
        trimestresConDatos > 0
          ? parseFloat((sumaPuntuaciones / trimestresConDatos).toFixed(1))
          : 10.0;

      return {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        trimestres,
        total_anual_justificadas: totalAnualJustificadas,
        total_anual_injustificadas: totalAnualInjustificadas,
        total_anual_atrasos: totalAnualAtrasos,
        total_anual_menos_graves: totalAnualMenosGraves,
        total_anual_graves: totalAnualGraves,
        total_anual_muy_graves: totalAnualMuyGraves,
        puntuacion_conducta_anual: parseFloat(
          Math.max(0, puntuacionAnual).toFixed(1),
        ),
        promedio_trimestral: promedioTrimestral,
      };
    });
  }
}
