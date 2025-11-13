import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  VerificacionCierreResponseDto,
  AdvertenciaCierreDto,
  EstadisticasCierreDto,
  AlumnoSinCalificarDto,
  EvaluacionFaltanteDto,
} from './dto/verificacion-cierre.dto';

@Injectable()
export class PromediosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el promedio mensual de una asignatura para un alumno
   * Fórmula: ((0.05·Tareas + 0.15·Revisiones + 0.15·Lab) / 0.35) × 100
   */
  async calcularPromedioMensual(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
    mes: number,
    trimestre: number,
  ) {
    // Obtener todas las notas del mes
    const notas = await this.prisma.notas.findMany({
      where: {
        id_alumno: alumnoId,
        id_asignatura: asignaturaId,
        evaluacion: {
          anio_academico: anioAcademico,
          mes: mes,
        },
      },
      include: {
        evaluacion: {
          include: {
            tipoEvaluacion: true,
          },
        },
      },
    });

    // Agrupar por tipo de evaluación
    const tareas = notas.filter(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Tarea',
    );
    const revisiones = notas.filter(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Revisión de Cuaderno',
    );
    const laboratorios = notas.filter(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Laboratorio',
    );

    // Calcular promedios por tipo
    const promedioTareas =
      tareas.length > 0
        ? tareas.reduce((sum, n) => sum + (n.calificacion || 0), 0) /
          tareas.length
        : null;

    const promedioRevisiones =
      revisiones.length > 0
        ? revisiones.reduce((sum, n) => sum + (n.calificacion || 0), 0) /
          revisiones.length
        : null;

    const promedioLaboratorios =
      laboratorios.length > 0
        ? laboratorios.reduce((sum, n) => sum + (n.calificacion || 0), 0) /
          laboratorios.length
        : null;

    // Calcular promedio mensual
    // Fórmula: suma ponderada normalizada
    // Si algún componente es null (no se programó), no pondera
    let suma = 0;
    let divisor = 0;

    if (promedioTareas !== null) {
      suma += 0.05 * promedioTareas;
      divisor += 0.05;
    }
    if (promedioRevisiones !== null) {
      suma += 0.15 * promedioRevisiones;
      divisor += 0.15;
    }
    if (promedioLaboratorios !== null) {
      suma += 0.15 * promedioLaboratorios;
      divisor += 0.15;
    }

    // Si no hay ningún componente, el promedio es 0
    // Dividir por el divisor para normalizar (las notas ya están en escala de 10)
    const promedioMensual = divisor > 0 ? suma / divisor : 0;

    // Guardar o actualizar en la BD
    const promedioGuardado = await this.prisma.promedioMensual.upsert({
      where: {
        alumnoId_asignaturaId_anioAcademico_mes: {
          alumnoId,
          asignaturaId,
          anioAcademico,
          mes,
        },
      },
      update: {
        trimestre,
        promedioTareas,
        promedioRevisiones,
        promedioLaboratorios,
        promedioMensual: Math.round(promedioMensual * 100) / 100,
      },
      create: {
        alumnoId,
        asignaturaId,
        anioAcademico,
        mes,
        trimestre,
        promedioTareas,
        promedioRevisiones,
        promedioLaboratorios,
        promedioMensual: Math.round(promedioMensual * 100) / 100,
      },
    });

    return promedioGuardado;
  }

  /**
   * Calcula el promedio trimestral de una asignatura para un alumno
   * Fórmula: 0.35·Meses + 0.35·Actividades + 0.30·Examen
   * Meses: 0.28·Mes1 + 0.27·Mes2 + 0.45·Mes3
   * Actividades: 0.25·ActInteg + 0.10·Autoeval
   */
  async calcularPromedioTrimestral(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
    trimestre: number,
  ) {
    // Mapeo de meses por trimestre
    const mesesPorTrimestre: { [key: number]: number[] } = {
      1: [2, 3, 4], // T1: Feb, Mar, Abr
      2: [5, 6, 7], // T2: May, Jun, Jul
      3: [8, 9, 10], // T3: Ago, Sep, Oct
    };

    const meses = mesesPorTrimestre[trimestre];
    const pesosMensuales = [0.28, 0.27, 0.45];

    // 1. Calcular promedios mensuales
    const promediosMensuales = await Promise.all(
      meses.map((mes, index) =>
        this.calcularPromedioMensual(
          alumnoId,
          asignaturaId,
          anioAcademico,
          mes,
          trimestre,
        ),
      ),
    );

    // 2. Ponderar los meses (28%-27%-45%)
    const promedioMeses = promediosMensuales.reduce(
      (sum, pm, index) => sum + pm.promedioMensual * pesosMensuales[index],
      0,
    );

    // 3. Obtener Actividad Integradora y Autoevaluación
    const actividadIntegradora = await this.prisma.notas.findFirst({
      where: {
        id_alumno: alumnoId,
        id_asignatura: asignaturaId,
        evaluacion: {
          anio_academico: anioAcademico,
          trimestre: trimestre,
          tipoEvaluacion: {
            nombre: 'Actividad Integradora',
          },
        },
      },
    });

    const autoevaluacion = await this.prisma.notas.findFirst({
      where: {
        id_alumno: alumnoId,
        id_asignatura: asignaturaId,
        evaluacion: {
          anio_academico: anioAcademico,
          trimestre: trimestre,
          tipoEvaluacion: {
            nombre: 'Autoevaluación',
          },
        },
      },
    });

    const notaActividadIntegradora = actividadIntegradora?.calificacion || 0;
    const notaAutoevaluacion = autoevaluacion?.calificacion || 0;

    // 4. Obtener Examen Trimestral
    const examen = await this.prisma.notas.findFirst({
      where: {
        id_alumno: alumnoId,
        id_asignatura: asignaturaId,
        evaluacion: {
          anio_academico: anioAcademico,
          trimestre: trimestre,
          tipoEvaluacion: {
            nombre: 'Examen Trimestral',
          },
        },
      },
    });

    const notaExamen = examen?.calificacion || 0;

    // 5. Calcular promedio trimestral final
    // Fórmula del documento oficial:
    // Trimestre = 0.35·Meses + 0.25·ActInteg + 0.10·Autoeval + 0.30·Examen
    // Calculamos también el promedio de actividades para guardarlo (sin normalizar)
    const contribucionActividades =
      0.25 * notaActividadIntegradora + 0.1 * notaAutoevaluacion;

    const promedioTrimestral =
      0.35 * promedioMeses + contribucionActividades + 0.3 * notaExamen;

    // 6. Verificar aprobación (obtener nota mínima del grado)
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: asignaturaId },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    const notaMinima = asignatura?.curso?.gradoAcademico?.nota_minima || 6.0;
    const aprobado = promedioTrimestral >= notaMinima;

    // 7. Guardar o actualizar en la BD
    const promedioGuardado = await this.prisma.promedioTrimestral.upsert({
      where: {
        alumnoId_asignaturaId_anioAcademico_trimestre: {
          alumnoId,
          asignaturaId,
          anioAcademico,
          trimestre,
        },
      },
      update: {
        promedioMeses: Math.round(promedioMeses * 100) / 100,
        actividadIntegradora: notaActividadIntegradora,
        autoevaluacion: notaAutoevaluacion,
        promedioActividades: Math.round(contribucionActividades * 100) / 100,
        examenTrimestral: notaExamen,
        promedioTrimestral: Math.round(promedioTrimestral * 100) / 100,
        aprobado,
      },
      create: {
        alumnoId,
        asignaturaId,
        anioAcademico,
        trimestre,
        promedioMeses: Math.round(promedioMeses * 100) / 100,
        actividadIntegradora: notaActividadIntegradora,
        autoevaluacion: notaAutoevaluacion,
        promedioActividades: Math.round(contribucionActividades * 100) / 100,
        examenTrimestral: notaExamen,
        promedioTrimestral: Math.round(promedioTrimestral * 100) / 100,
        aprobado,
      },
    });

    return promedioGuardado;
  }

  /**
   * Calcula el promedio por periodo para BACHILLERATO
   * Fórmula: 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParcial + 0.30·ExPeriodo
   */
  async calcularPromedioPeriodo(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
    periodo: number,
  ) {
    // Obtener todas las notas del periodo
    const notas = await this.prisma.notas.findMany({
      where: {
        id_alumno: alumnoId,
        id_asignatura: asignaturaId,
        evaluacion: {
          anio_academico: anioAcademico,
          periodo: periodo,
        },
      },
      include: {
        evaluacion: {
          include: {
            tipoEvaluacion: true,
          },
        },
      },
    });

    // Obtener cada tipo de evaluación
    const actividadIntegradora = notas.find(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Actividad Integradora',
    );
    const coevaluacion = notas.find(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Coevaluación',
    );
    const examenParcial = notas.find(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Examen Parcial',
    );
    const examenPeriodo = notas.find(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Examen de Periodo',
    );

    // Calcular promedios de tareas y laboratorios
    const tareas = notas.filter(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Tarea',
    );
    const laboratorios = notas.filter(
      (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Laboratorio',
    );

    const promedioTareas =
      tareas.length > 0
        ? tareas.reduce((sum, n) => sum + (n.calificacion || 0), 0) /
          tareas.length
        : 0;

    const promedioLaboratorios =
      laboratorios.length > 0
        ? laboratorios.reduce((sum, n) => sum + (n.calificacion || 0), 0) /
          laboratorios.length
        : 0;

    // Obtener calificaciones
    const notaActividadIntegradora = actividadIntegradora?.calificacion || 0;
    const notaCoevaluacion = coevaluacion?.calificacion || 0;
    const notaExamenParcial = examenParcial?.calificacion || 0;
    const notaExamenPeriodo = examenPeriodo?.calificacion || 0;

    // Calcular promedio del periodo
    const promedioPeriodo =
      0.25 * notaActividadIntegradora +
      0.05 * promedioTareas +
      0.05 * notaCoevaluacion +
      0.1 * promedioLaboratorios +
      0.25 * notaExamenParcial +
      0.3 * notaExamenPeriodo;

    // Verificar aprobación
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: asignaturaId },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    const notaMinima = asignatura?.curso?.gradoAcademico?.nota_minima || 6.0;
    const aprobado = promedioPeriodo >= notaMinima;

    // Guardar en la BD
    const promedioGuardado = await this.prisma.promedioPeriodo.upsert({
      where: {
        alumnoId_asignaturaId_anioAcademico_periodo: {
          alumnoId,
          asignaturaId,
          anioAcademico,
          periodo,
        },
      },
      update: {
        actividadIntegradora: notaActividadIntegradora,
        promedioTareas,
        coevaluacion: notaCoevaluacion,
        promedioLaboratorios,
        examenParcial: notaExamenParcial,
        examenPeriodo: notaExamenPeriodo,
        promedioPeriodo: Math.round(promedioPeriodo * 100) / 100,
        aprobado,
      },
      create: {
        alumnoId,
        asignaturaId,
        anioAcademico,
        periodo,
        actividadIntegradora: notaActividadIntegradora,
        promedioTareas,
        coevaluacion: notaCoevaluacion,
        promedioLaboratorios,
        examenParcial: notaExamenParcial,
        examenPeriodo: notaExamenPeriodo,
        promedioPeriodo: Math.round(promedioPeriodo * 100) / 100,
        aprobado,
      },
    });

    return promedioGuardado;
  }

  /**
   * Calcula el promedio final anual de una asignatura
   * Para BÁSICA: promedio de 3 trimestres
   * Para BACHILLERATO: promedio de 4 periodos
   */
  async calcularPromedioFinalAsignatura(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
  ) {
    // Determinar si es BÁSICA o BACHILLERATO por el grado académico
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: asignaturaId },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    const gradoNombre = asignatura.curso?.gradoAcademico?.nombre || '';
    const esBachillerato = gradoNombre.includes('Bachillerato');
    const notaMinima = asignatura.curso?.gradoAcademico?.nota_minima || 6.0;

    let promedioFinal = 0;
    let dataToSave: any = {
      alumnoId,
      asignaturaId,
      anioAcademico,
    };

    if (esBachillerato) {
      // BACHILLERATO: Calcular promedio de 4 periodos
      const periodos = [1, 2, 3, 4];
      const promediosPeriodos = await Promise.all(
        periodos.map((p) =>
          this.calcularPromedioPeriodo(
            alumnoId,
            asignaturaId,
            anioAcademico,
            p,
          ),
        ),
      );

      dataToSave.promedioPeriodo1 = promediosPeriodos[0].promedioPeriodo;
      dataToSave.promedioPeriodo2 = promediosPeriodos[1].promedioPeriodo;
      dataToSave.promedioPeriodo3 = promediosPeriodos[2].promedioPeriodo;
      dataToSave.promedioPeriodo4 = promediosPeriodos[3].promedioPeriodo;

      promedioFinal =
        (dataToSave.promedioPeriodo1 +
          dataToSave.promedioPeriodo2 +
          dataToSave.promedioPeriodo3 +
          dataToSave.promedioPeriodo4) /
        4;
    } else {
      // BÁSICA: Calcular promedio de 3 trimestres
      const trimestres = [1, 2, 3];
      const promediosTrimestrales = await Promise.all(
        trimestres.map((t) =>
          this.calcularPromedioTrimestral(
            alumnoId,
            asignaturaId,
            anioAcademico,
            t,
          ),
        ),
      );

      // Los promedios trimestrales vienen del nuevo sistema
      dataToSave.promedioTrimestre1 = (
        promediosTrimestrales[0] as any
      ).promedioTrimestral;
      dataToSave.promedioTrimestre2 = (
        promediosTrimestrales[1] as any
      ).promedioTrimestral;
      dataToSave.promedioTrimestre3 = (
        promediosTrimestrales[2] as any
      ).promedioTrimestral;

      promedioFinal =
        (dataToSave.promedioTrimestre1 +
          dataToSave.promedioTrimestre2 +
          dataToSave.promedioTrimestre3) /
        3;
    }

    // Redondear a 2 decimales
    promedioFinal = Math.round(promedioFinal * 100) / 100;

    // Verificar aprobación
    const aprobado = promedioFinal >= notaMinima;
    const requiereRecuperacion = !aprobado;

    dataToSave.promedioFinal = promedioFinal;
    dataToSave.aprobado = aprobado;
    dataToSave.requiereRecuperacion = requiereRecuperacion;

    // Guardar en la BD
    const promedioGuardado = await this.prisma.promedioFinalAsignatura.upsert({
      where: {
        alumnoId_asignaturaId_anioAcademico: {
          alumnoId,
          asignaturaId,
          anioAcademico,
        },
      },
      update: dataToSave,
      create: dataToSave,
    });

    return promedioGuardado;
  }

  /**
   * Calcula el promedio final general del alumno (todas las asignaturas)
   */
  async calcularPromedioFinalAlumno(
    alumnoId: number,
    cursoId: number,
    anioAcademico: string,
  ) {
    // Obtener todas las asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: cursoId },
    });

    if (asignaturas.length === 0) {
      throw new NotFoundException('No hay asignaturas en el curso');
    }

    // Calcular promedio final de cada asignatura
    const promediosAsignaturas = await Promise.all(
      asignaturas.map((asig) =>
        this.calcularPromedioFinalAsignatura(
          alumnoId,
          asig.id_asignatura,
          anioAcademico,
        ),
      ),
    );

    // Calcular promedio general
    const sumaPromedios = promediosAsignaturas.reduce(
      (sum, p) => sum + p.promedioFinal,
      0,
    );
    const promedioGeneral =
      Math.round((sumaPromedios / asignaturas.length) * 100) / 100;

    // Contar asignaturas reprobadas
    const asignaturasReprobadas = promediosAsignaturas.filter(
      (p) => !p.aprobado,
    ).length;
    const aprobadoTodasAsignaturas = asignaturasReprobadas === 0;

    // Determinar estado final
    let estadoFinal = 'APROBADO';
    if (!aprobadoTodasAsignaturas) {
      estadoFinal = 'REPROBADO';
    }

    // Guardar en la BD
    const promedioGuardado = await this.prisma.promedioFinalAlumno.upsert({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId,
          cursoId,
          anioAcademico,
        },
      },
      update: {
        promedioGeneral,
        aprobadoTodasAsignaturas,
        asignaturasReprobadas,
        estadoFinal,
      },
      create: {
        alumnoId,
        cursoId,
        anioAcademico,
        promedioGeneral,
        aprobadoTodasAsignaturas,
        asignaturasReprobadas,
        estadoFinal,
        calificacionesCerradas: false,
      },
    });

    return promedioGuardado;
  }

  /**
   * Recalcula todos los promedios de un alumno en un año académico
   * Se debe llamar cada vez que se registra o actualiza una nota
   */
  async recalcularTodosLosPromedios(alumnoId: number, anioAcademico: string) {
    // Obtener la inscripción actual del alumno
    const inscripcion = await this.prisma.alumnoCurso.findFirst({
      where: {
        alumnoId,
        anioAcademico,
        estado: 'ACTIVO',
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('Alumno no inscrito en el año académico');
    }

    // Recalcular promedio final del alumno
    const promedioFinal = await this.calcularPromedioFinalAlumno(
      alumnoId,
      inscripcion.cursoId,
      anioAcademico,
    );

    return promedioFinal;
  }

  /**
   * Verifica el estado de las calificaciones antes de permitir el cierre
   * Retorna advertencias sobre evaluaciones faltantes y alumnos sin calificar
   */
  async verificarEstadoParaCierre(
    cursoId: number,
    anioAcademico: string,
    trimestre?: number,
    periodo?: number,
  ): Promise<VerificacionCierreResponseDto> {
    try {
      const advertencias: AdvertenciaCierreDto[] = [];

      // Obtener información del curso y grado académico
      const curso = await this.prisma.curso.findUnique({
        where: { id_curso: cursoId },
        include: {
          gradoAcademico: true,
        },
      });

      if (!curso) {
        return {
          puedesCerrar: false,
          advertencias: [
            {
              tipo: 'ERROR',
              mensaje: 'Curso no encontrado',
            },
          ],
          estadisticas: {
            totalAlumnos: 0,
            alumnosConTodasLasNotas: 0,
            alumnosSinNotas: 0,
            totalEvaluacionesEsperadas: 0,
            evaluacionesCreadas: 0,
            totalCalificacionesRegistradas: 0,
            totalCalificacionesEsperadas: 0,
          },
          mensaje: '❌ Curso no encontrado',
        };
      }

      if (!curso.id_grado_academico) {
        return {
          puedesCerrar: false,
          advertencias: [
            {
              tipo: 'ERROR',
              mensaje: 'El curso no tiene un grado académico asignado',
            },
          ],
          estadisticas: {
            totalAlumnos: 0,
            alumnosConTodasLasNotas: 0,
            alumnosSinNotas: 0,
            totalEvaluacionesEsperadas: 0,
            evaluacionesCreadas: 0,
            totalCalificacionesRegistradas: 0,
            totalCalificacionesEsperadas: 0,
          },
          mensaje: '❌ El curso no tiene un grado académico asignado',
        };
      }

      // Obtener todos los alumnos activos del curso
      const alumnos = await this.prisma.alumnoCurso.findMany({
        where: {
          cursoId,
          anioAcademico,
          estado: 'ACTIVO',
        },
        include: {
          alumno: {
            select: {
              id_alumno: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      const totalAlumnos = alumnos.length;

      // Obtener todas las asignaturas del curso
      const asignaturas = await this.prisma.asignatura.findMany({
        where: { id_curso: cursoId },
      });

      // 1. VERIFICAR EVALUACIONES FALTANTES
      const evaluacionesFaltantes = await this.verificarEvaluacionesFaltantes(
        cursoId,
        anioAcademico,
        curso.id_grado_academico,
        trimestre,
        periodo,
      );

      if (evaluacionesFaltantes.length > 0) {
        advertencias.push({
          tipo: 'EVALUACIONES_FALTANTES',
          mensaje: `Hay tipos de evaluación sin crear para ${trimestre ? `el trimestre ${trimestre}` : periodo ? `el periodo ${periodo}` : 'el año'}`,
          evaluacionesFaltantes,
        });
      }

      // 2. VERIFICAR ALUMNOS SIN CALIFICAR
      const alumnosSinCalificar = await this.verificarAlumnosSinCalificar(
        alumnos.map((a) => a.alumnoId),
        cursoId,
        anioAcademico,
        trimestre,
        periodo,
      );

      if (alumnosSinCalificar.length > 0) {
        advertencias.push({
          tipo: 'ALUMNOS_SIN_CALIFICAR',
          mensaje: `${alumnosSinCalificar.length} alumno(s) no tienen todas las calificaciones`,
          alumnosSinCalificar,
        });
      }

      // 3. CALCULAR ESTADÍSTICAS
      const evaluacionesCreadas = await this.prisma.evaluacion.count({
        where: {
          id_asignatura: { in: asignaturas.map((a) => a.id_asignatura) },
          anio_academico: anioAcademico,
          ...(trimestre && { trimestre }),
          ...(periodo && { periodo }),
        },
      });

      // Obtener tipos de evaluación esperados
      const tiposEvaluacion = await this.prisma.tipo_evaluacion.findMany({
        where: {
          id_grado_academico: curso.id_grado_academico,
          activo: true,
        },
      });

      const totalEvaluacionesEsperadas =
        asignaturas.length * tiposEvaluacion.length;

      // Contar calificaciones registradas
      const totalCalificacionesRegistradas = await this.prisma.notas.count({
        where: {
          id_asignatura: { in: asignaturas.map((a) => a.id_asignatura) },
          id_alumno: { in: alumnos.map((a) => a.alumnoId) },
          evaluacion: {
            anio_academico: anioAcademico,
            ...(trimestre && { trimestre }),
            ...(periodo && { periodo }),
          },
        },
      });

      const totalCalificacionesEsperadas = evaluacionesCreadas * totalAlumnos;

      const alumnosConTodasLasNotas = totalAlumnos - alumnosSinCalificar.length;

      const estadisticas: EstadisticasCierreDto = {
        totalAlumnos,
        alumnosConTodasLasNotas,
        alumnosSinNotas: alumnosSinCalificar.length,
        totalEvaluacionesEsperadas,
        evaluacionesCreadas,
        totalCalificacionesRegistradas,
        totalCalificacionesEsperadas,
      };

      // 4. DETERMINAR SI PUEDE CERRAR
      // Puede cerrar si solo hay advertencias menores o el orientador lo autoriza
      const puedesCerrar = advertencias.length === 0;

      let mensaje = '';
      if (puedesCerrar) {
        mensaje =
          '✅ Todo está en orden. Puedes cerrar las calificaciones de forma segura.';
      } else {
        mensaje =
          '⚠️ Se encontraron advertencias. Revisa la información antes de continuar. Aún puedes cerrar si lo consideras necesario.';
      }

      return {
        puedesCerrar,
        advertencias,
        estadisticas,
        mensaje,
      };
    } catch (error) {
      // En caso de error, retornar un estado seguro
      return {
        puedesCerrar: false,
        advertencias: [
          {
            tipo: 'ERROR',
            mensaje: `Error al verificar estado: ${error.message}`,
          },
        ],
        estadisticas: {
          totalAlumnos: 0,
          alumnosConTodasLasNotas: 0,
          alumnosSinNotas: 0,
          totalEvaluacionesEsperadas: 0,
          evaluacionesCreadas: 0,
          totalCalificacionesRegistradas: 0,
          totalCalificacionesEsperadas: 0,
        },
        mensaje: '❌ Error al verificar el estado de las calificaciones',
      };
    }
  }

  /**
   * Verifica el estado de las calificaciones de UNA ASIGNATURA específica antes de permitir el cierre
   * Retorna advertencias sobre evaluaciones faltantes y alumnos sin calificar EN ESA ASIGNATURA
   */
  async verificarEstadoParaCierreAsignatura(
    asignaturaId: number,
    anioAcademico: string,
    orientadorId: number,
    trimestre?: number,
    periodo?: number,
  ): Promise<VerificacionCierreResponseDto> {
    try {
      const advertencias: AdvertenciaCierreDto[] = [];

      // Verificar que la asignatura existe y pertenece al orientador
      const asignatura = await this.prisma.asignatura.findUnique({
        where: { id_asignatura: asignaturaId },
        include: {
          curso: {
            include: {
              gradoAcademico: true,
            },
          },
        },
      });

      if (!asignatura) {
        return {
          puedesCerrar: false,
          advertencias: [
            {
              tipo: 'ERROR',
              mensaje: 'Asignatura no encontrada',
            },
          ],
          estadisticas: {
            totalAlumnos: 0,
            alumnosConTodasLasNotas: 0,
            alumnosSinNotas: 0,
            totalEvaluacionesEsperadas: 0,
            evaluacionesCreadas: 0,
            totalCalificacionesRegistradas: 0,
            totalCalificacionesEsperadas: 0,
          },
          mensaje: '❌ Asignatura no encontrada',
        };
      }

      if (!asignatura.id_curso) {
        return {
          puedesCerrar: false,
          advertencias: [
            {
              tipo: 'ERROR',
              mensaje: 'La asignatura no tiene un curso asignado',
            },
          ],
          estadisticas: {
            totalAlumnos: 0,
            alumnosConTodasLasNotas: 0,
            alumnosSinNotas: 0,
            totalEvaluacionesEsperadas: 0,
            evaluacionesCreadas: 0,
            totalCalificacionesRegistradas: 0,
            totalCalificacionesEsperadas: 0,
          },
          mensaje: '❌ La asignatura no tiene un curso asignado',
        };
      }

      // Verificar que el orientador imparte esta asignatura
      const asignacionOrientador =
        await this.prisma.asignaturaOrientador.findFirst({
          where: {
            id_asignatura: asignaturaId,
            id_orientador: orientadorId,
            activo: true,
          },
        });

      if (!asignacionOrientador) {
        return {
          puedesCerrar: false,
          advertencias: [
            {
              tipo: 'ERROR',
              mensaje: 'No tienes permiso para cerrar esta asignatura',
            },
          ],
          estadisticas: {
            totalAlumnos: 0,
            alumnosConTodasLasNotas: 0,
            alumnosSinNotas: 0,
            totalEvaluacionesEsperadas: 0,
            evaluacionesCreadas: 0,
            totalCalificacionesRegistradas: 0,
            totalCalificacionesEsperadas: 0,
          },
          mensaje: '❌ No tienes permiso para cerrar esta asignatura',
        };
      }

      // Obtener todos los alumnos activos del curso
      const alumnos = await this.prisma.alumnoCurso.findMany({
        where: {
          cursoId: asignatura.id_curso,
          anioAcademico,
          estado: 'ACTIVO',
        },
        include: {
          alumno: {
            select: {
              id_alumno: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      const totalAlumnos = alumnos.length;

      // Obtener todas las evaluaciones de esta asignatura
      const evaluaciones = await this.prisma.evaluacion.findMany({
        where: {
          id_asignatura: asignaturaId,
          id_orientador: orientadorId,
          anio_academico: anioAcademico,
          ...(trimestre && { trimestre }),
          ...(periodo && { periodo }),
        },
        select: {
          id_evaluacion: true,
          nombre: true,
          trimestre: true,
          periodo: true,
          mes: true,
          anio_academico: true,
          tipoEvaluacion: {
            select: {
              nombre: true,
            },
          },
        },
      });

      const totalEvaluacionesCreadas = evaluaciones.length;

      // Verificar alumnos sin calificar en esta asignatura
      const alumnosSinCalificar: AlumnoSinCalificarDto[] = [];

      for (const inscripcion of alumnos) {
        const alumno = inscripcion.alumno;
        const calificaciones = await this.prisma.notas.findMany({
          where: {
            id_alumno: alumno.id_alumno,
            id_asignatura: asignaturaId,
            evaluacion: {
              anio_academico: anioAcademico,
              ...(trimestre && { trimestre }),
              ...(periodo && { periodo }),
            },
          },
          select: {
            id_evaluacion: true,
          },
        });

        const evaluacionesConNota = new Set(
          calificaciones.map((c) => c.id_evaluacion),
        );
        const evaluacionesPendientes = evaluaciones
          .filter((e) => !evaluacionesConNota.has(e.id_evaluacion))
          .map((e) => ({
            tipo: e.tipoEvaluacion.nombre,
            trimestre: e.trimestre ?? undefined,
            periodo: e.periodo ?? undefined,
            mes: e.mes ?? undefined,
            anioAcademico: e.anio_academico,
          }));

        if (evaluacionesPendientes.length > 0) {
          alumnosSinCalificar.push({
            id_alumno: alumno.id_alumno,
            nombreCompleto: `${alumno.nombre} ${alumno.apellido}`,
            evaluacionesPendientes,
          });
        }
      }

      if (alumnosSinCalificar.length > 0) {
        advertencias.push({
          tipo: 'ALUMNOS_SIN_CALIFICAR',
          mensaje: `${alumnosSinCalificar.length} alumno(s) no tienen todas las calificaciones de esta asignatura`,
          alumnosSinCalificar,
        });
      }

      // Contar calificaciones registradas
      const totalCalificacionesRegistradas = await this.prisma.notas.count({
        where: {
          id_asignatura: asignaturaId,
          id_alumno: { in: alumnos.map((a) => a.alumnoId) },
          evaluacion: {
            anio_academico: anioAcademico,
            ...(trimestre && { trimestre }),
            ...(periodo && { periodo }),
          },
        },
      });

      const totalCalificacionesEsperadas =
        totalEvaluacionesCreadas * totalAlumnos;
      const alumnosConTodasLasNotas = totalAlumnos - alumnosSinCalificar.length;

      const estadisticas: EstadisticasCierreDto = {
        totalAlumnos,
        alumnosConTodasLasNotas,
        alumnosSinNotas: alumnosSinCalificar.length,
        totalEvaluacionesEsperadas: totalEvaluacionesCreadas,
        evaluacionesCreadas: totalEvaluacionesCreadas,
        totalCalificacionesRegistradas,
        totalCalificacionesEsperadas,
      };

      const puedesCerrar = advertencias.length === 0;

      let mensaje = '';
      if (puedesCerrar) {
        mensaje = `✅ Todo está en orden. Puedes cerrar las calificaciones de ${asignatura.nombre} de forma segura.`;
      } else {
        mensaje = `⚠️ Se encontraron advertencias en ${asignatura.nombre}. Revisa la información antes de continuar. Aún puedes cerrar si lo consideras necesario.`;
      }

      return {
        puedesCerrar,
        advertencias,
        estadisticas,
        mensaje,
      };
    } catch (error) {
      return {
        puedesCerrar: false,
        advertencias: [
          {
            tipo: 'ERROR',
            mensaje: `Error al verificar estado: ${error.message}`,
          },
        ],
        estadisticas: {
          totalAlumnos: 0,
          alumnosConTodasLasNotas: 0,
          alumnosSinNotas: 0,
          totalEvaluacionesEsperadas: 0,
          evaluacionesCreadas: 0,
          totalCalificacionesRegistradas: 0,
          totalCalificacionesEsperadas: 0,
        },
        mensaje: '❌ Error al verificar el estado de las calificaciones',
      };
    }
  }

  /**
   * Verifica si existen todas las evaluaciones requeridas según el grado académico
   */
  private async verificarEvaluacionesFaltantes(
    cursoId: number,
    anioAcademico: string,
    gradoAcademicoId: number,
    trimestre?: number,
    periodo?: number,
  ): Promise<EvaluacionFaltanteDto[]> {
    const faltantes: EvaluacionFaltanteDto[] = [];

    // Obtener asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: cursoId },
    });

    // Obtener tipos de evaluación esperados
    const tiposEvaluacion = await this.prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: gradoAcademicoId,
        activo: true,
      },
    });

    // Por cada tipo de evaluación, verificar si existe al menos una evaluación por asignatura
    for (const tipo of tiposEvaluacion) {
      const evaluacionesCreadas = await this.prisma.evaluacion.count({
        where: {
          id_tipo_evaluacion: tipo.id_tipo_evaluacion,
          id_asignatura: { in: asignaturas.map((a) => a.id_asignatura) },
          anio_academico: anioAcademico,
          ...(trimestre && { trimestre }),
          ...(periodo && { periodo }),
        },
      });

      const esperadas = asignaturas.length;

      if (evaluacionesCreadas < esperadas) {
        faltantes.push({
          tipoEvaluacion: tipo.nombre,
          esperadas,
          creadas: evaluacionesCreadas,
        });
      }
    }

    return faltantes;
  }

  /**
   * Verifica qué alumnos no tienen todas sus calificaciones
   */
  private async verificarAlumnosSinCalificar(
    alumnosIds: number[],
    cursoId: number,
    anioAcademico: string,
    trimestre?: number,
    periodo?: number,
  ): Promise<AlumnoSinCalificarDto[]> {
    const alumnosSinCalificar: AlumnoSinCalificarDto[] = [];

    // Obtener todas las evaluaciones creadas para este curso/período
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: cursoId },
    });

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        id_asignatura: { in: asignaturas.map((a) => a.id_asignatura) },
        anio_academico: anioAcademico,
        ...(trimestre && { trimestre }),
        ...(periodo && { periodo }),
      },
      select: {
        id_evaluacion: true,
        nombre: true,
        trimestre: true,
        periodo: true,
        mes: true,
        anio_academico: true,
        tipoEvaluacion: {
          select: {
            nombre: true,
          },
        },
      },
    });

    const totalEvaluaciones = evaluaciones.length;

    // Verificar cada alumno
    for (const alumnoId of alumnosIds) {
      const alumno = await this.prisma.alumno.findUnique({
        where: { id_alumno: alumnoId },
        select: {
          id_alumno: true,
          nombre: true,
          apellido: true,
        },
      });

      if (!alumno) continue;

      // Obtener calificaciones del alumno
      const calificaciones = await this.prisma.notas.findMany({
        where: {
          id_alumno: alumnoId,
          id_evaluacion: { in: evaluaciones.map((e) => e.id_evaluacion) },
        },
        select: {
          id_evaluacion: true,
        },
      });

      // Identificar evaluaciones pendientes
      const evaluacionesConNota = new Set(
        calificaciones.map((c) => c.id_evaluacion),
      );
      const evaluacionesPendientes = evaluaciones
        .filter((e) => !evaluacionesConNota.has(e.id_evaluacion))
        .map((e) => ({
          tipo: e.tipoEvaluacion.nombre,
          trimestre: e.trimestre ?? undefined,
          periodo: e.periodo ?? undefined,
          mes: e.mes ?? undefined,
          anioAcademico: e.anio_academico,
        }));

      if (evaluacionesPendientes.length > 0) {
        alumnosSinCalificar.push({
          id_alumno: alumno.id_alumno,
          nombreCompleto: `${alumno.nombre} ${alumno.apellido}`,
          evaluacionesPendientes,
        });
      }
    }

    return alumnosSinCalificar;
  }

  /**
   * Cierra las calificaciones de UNA ASIGNATURA específica (el orientador marca como finalizado)
   * Solo puede cerrar las asignaturas que él imparte
   */
  async cerrarCalificacionesAsignatura(
    asignaturaId: number,
    anioAcademico: string,
    orientadorId: number,
    trimestre?: number,
    periodo?: number,
    forzar: boolean = false,
  ) {
    // Verificar que el orientador imparte esta asignatura
    const asignacionOrientador =
      await this.prisma.asignaturaOrientador.findFirst({
        where: {
          id_asignatura: asignaturaId,
          id_orientador: orientadorId,
          activo: true,
        },
      });

    if (!asignacionOrientador) {
      throw new NotFoundException(
        'No tienes permiso para cerrar esta asignatura',
      );
    }

    // Verificar estado antes de cerrar (si no se fuerza)
    if (!forzar) {
      const verificacion = await this.verificarEstadoParaCierreAsignatura(
        asignaturaId,
        anioAcademico,
        orientadorId,
        trimestre,
        periodo,
      );

      if (!verificacion.puedesCerrar) {
        throw new NotFoundException({
          message:
            'No se puede cerrar las calificaciones debido a advertencias. Revisa el estado o usa la opción "forzar".',
          verificacion,
        });
      }
    }

    // Obtener la asignatura para saber el curso
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: asignaturaId },
    });

    if (!asignatura || !asignatura.id_curso) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    // Obtener todos los alumnos del curso
    const alumnos = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: asignatura.id_curso,
        anioAcademico,
        estado: 'ACTIVO',
      },
      select: {
        alumnoId: true,
      },
    });

    const resultados = {
      totalAlumnos: alumnos.length,
      alumnosCerrados: 0,
      alumnosConError: 0,
      errores: [] as any[],
    };

    // Cerrar las calificaciones de cada alumno en esta asignatura
    for (const inscripcion of alumnos) {
      try {
        // Actualizar el promedio final de la asignatura para marcarla como cerrada
        await this.prisma.promedioFinalAsignatura.updateMany({
          where: {
            alumnoId: inscripcion.alumnoId,
            asignaturaId,
            anioAcademico,
          },
          data: {
            calificacionesCerradas: true,
            fechaCierre: new Date(),
            orientadorQueCerroId: orientadorId,
          },
        });
        resultados.alumnosCerrados++;
      } catch (error) {
        resultados.alumnosConError++;
        resultados.errores.push({
          alumnoId: inscripcion.alumnoId,
          error: error.message,
        });
      }
    }

    return {
      mensaje: `Se cerraron las calificaciones de la asignatura para ${resultados.alumnosCerrados} de ${resultados.totalAlumnos} alumnos`,
      asignaturaId,
      orientadorId,
      ...resultados,
    };
  }

  /**
   * Cierra las calificaciones de un alumno (el orientador marca como finalizado)
   * @param forzar - Si es true, cierra aunque haya advertencias
   */
  async cerrarCalificaciones(
    alumnoId: number,
    cursoId: number,
    anioAcademico: string,
    forzar: boolean = false,
  ) {
    const promedio = await this.prisma.promedioFinalAlumno.findUnique({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId,
          cursoId,
          anioAcademico,
        },
      },
    });

    if (!promedio) {
      throw new NotFoundException(
        'No se encontró el promedio final del alumno',
      );
    }

    const actualizado = await this.prisma.promedioFinalAlumno.update({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId,
          cursoId,
          anioAcademico,
        },
      },
      data: {
        calificacionesCerradas: true,
        fechaCierre: new Date(),
      },
    });

    return actualizado;
  }

  /**
   * Cierra las calificaciones de TODO un curso
   * Retorna resumen de alumnos cerrados y advertencias encontradas
   */
  async cerrarCalificacionesCurso(
    cursoId: number,
    anioAcademico: string,
    trimestre?: number,
    periodo?: number,
    forzar: boolean = false,
  ) {
    // Primero verificar el estado
    const verificacion = await this.verificarEstadoParaCierre(
      cursoId,
      anioAcademico,
      trimestre,
      periodo,
    );

    // Si no puede cerrar y no se está forzando, lanzar error
    if (!verificacion.puedesCerrar && !forzar) {
      throw new NotFoundException({
        message:
          'No se puede cerrar las calificaciones debido a advertencias. Revisa el estado o usa la opción "forzar".',
        verificacion,
      });
    }

    // Obtener todos los alumnos del curso
    const alumnos = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId,
        anioAcademico,
        estado: 'ACTIVO',
      },
    });

    const resultados = {
      totalAlumnos: alumnos.length,
      alumnosCerrados: 0,
      alumnosConError: 0,
      advertencias: verificacion.advertencias,
      errores: [] as any[],
    };

    // Cerrar calificaciones de cada alumno
    for (const inscripcion of alumnos) {
      try {
        await this.cerrarCalificaciones(
          inscripcion.alumnoId,
          cursoId,
          anioAcademico,
          true, // Forzar porque ya pasamos la verificación general
        );
        resultados.alumnosCerrados++;
      } catch (error) {
        resultados.alumnosConError++;
        resultados.errores.push({
          alumnoId: inscripcion.alumnoId,
          error: error.message,
        });
      }
    }

    return {
      mensaje: `Se cerraron las calificaciones de ${resultados.alumnosCerrados} de ${resultados.totalAlumnos} alumnos`,
      ...resultados,
    };
  }

  /**
   * Obtiene el estado de promedios de un alumno
   */
  async obtenerPromediosAlumno(alumnoId: number, anioAcademico: string) {
    const inscripcion = await this.prisma.alumnoCurso.findFirst({
      where: {
        alumnoId,
        anioAcademico,
        estado: 'ACTIVO',
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('Alumno no inscrito en el año académico');
    }

    const promedioFinal = await this.prisma.promedioFinalAlumno.findUnique({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId,
          cursoId: inscripcion.cursoId,
          anioAcademico,
        },
      },
    });

    // Obtener promedios por asignatura
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: inscripcion.cursoId },
    });

    const promediosAsignaturas = await Promise.all(
      asignaturas.map(async (asig) => {
        const promedio = await this.prisma.promedioFinalAsignatura.findUnique({
          where: {
            alumnoId_asignaturaId_anioAcademico: {
              alumnoId,
              asignaturaId: asig.id_asignatura,
              anioAcademico,
            },
          },
        });

        return {
          asignatura: asig,
          promedio,
        };
      }),
    );

    return {
      promedioGeneral: promedioFinal,
      promediosAsignaturas,
    };
  }

  /**
   * Verifica si un alumno puede ser promovido
   */
  async verificarAprobacionParaPromocion(
    alumnoId: number,
    anioAcademico: string,
  ) {
    const inscripcion = await this.prisma.alumnoCurso.findFirst({
      where: {
        alumnoId,
        anioAcademico,
        estado: 'ACTIVO',
      },
    });

    if (!inscripcion) {
      return {
        puedePromover: false,
        motivo: 'Alumno no inscrito en el año académico',
      };
    }

    const promedioFinal = await this.prisma.promedioFinalAlumno.findUnique({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId,
          cursoId: inscripcion.cursoId,
          anioAcademico,
        },
      },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    if (!promedioFinal) {
      return {
        puedePromover: false,
        motivo: 'No se han calculado los promedios',
      };
    }

    if (!promedioFinal.calificacionesCerradas) {
      return {
        puedePromover: false,
        motivo: 'Las calificaciones aún no han sido cerradas por el orientador',
      };
    }

    if (!promedioFinal.aprobadoTodasAsignaturas) {
      // Obtener asignaturas reprobadas
      const asignaturasReprobadas =
        await this.prisma.promedioFinalAsignatura.findMany({
          where: {
            alumnoId,
            anioAcademico,
            aprobado: false,
          },
          include: {
            asignatura: {
              select: {
                nombre: true,
              },
            },
          },
        });

      return {
        puedePromover: false,
        motivo: `Alumno reprobó ${promedioFinal.asignaturasReprobadas} asignatura(s)`,
        asignaturasReprobadas: asignaturasReprobadas.map((a) => ({
          asignatura: a.asignatura.nombre,
          promedio: a.promedioFinal,
        })),
      };
    }

    return {
      puedePromover: true,
      promedioGeneral: promedioFinal.promedioGeneral,
      estadoFinal: promedioFinal.estadoFinal,
    };
  }

  /**
   * Obtener promedios mensuales con desglose completo
   * Para que el frontend NO tenga que calcular nada
   */
  async obtenerPromediosMensualesConDesglose(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
    trimestre?: number,
  ) {
    // Determinar qué meses consultar
    const mesesPorTrimestre: { [key: number]: number[] } = {
      1: [2, 3, 4], // Feb, Mar, Abr
      2: [5, 6, 7], // May, Jun, Jul
      3: [8, 9, 10], // Ago, Sep, Oct
    };

    let mesesAConsultar: number[] = [];
    if (trimestre) {
      mesesAConsultar = mesesPorTrimestre[trimestre] || [];
    } else {
      // Todos los meses
      mesesAConsultar = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    // Obtener promedios mensuales de la BD
    const promediosMensuales = await this.prisma.promedioMensual.findMany({
      where: {
        alumnoId,
        asignaturaId,
        anioAcademico,
        mes: { in: mesesAConsultar },
      },
      orderBy: { mes: 'asc' },
    });

    // Obtener las notas individuales para cada mes
    const desgloseCompleto = await Promise.all(
      promediosMensuales.map(async (pm) => {
        const notas = await this.prisma.notas.findMany({
          where: {
            id_alumno: alumnoId,
            id_asignatura: asignaturaId,
            evaluacion: {
              anio_academico: anioAcademico,
              mes: pm.mes,
            },
          },
          include: {
            evaluacion: {
              include: {
                tipoEvaluacion: true,
              },
            },
          },
        });

        // Agrupar por tipo
        const tareas = notas.filter(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Tarea',
        );
        const revisiones = notas.filter(
          (n) =>
            n.evaluacion?.tipoEvaluacion?.nombre === 'Revisión de Cuaderno',
        );
        const laboratorios = notas.filter(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Laboratorio',
        );

        return {
          mes: pm.mes,
          trimestre: pm.trimestre,
          desglose: {
            tareas: {
              notas: tareas.map((n) => ({
                id_nota: n.id_nota,
                calificacion: n.calificacion,
                nombre_evaluacion: n.evaluacion?.nombre,
              })),
              promedio: pm.promedioTareas,
              peso: 0.05,
              pesoNormalizado: 14.29, // 5/35 * 100
              contribucion: pm.promedioTareas
                ? (0.05 * pm.promedioTareas) / 0.35
                : 0,
            },
            revisiones: {
              notas: revisiones.map((n) => ({
                id_nota: n.id_nota,
                calificacion: n.calificacion,
                nombre_evaluacion: n.evaluacion?.nombre,
              })),
              promedio: pm.promedioRevisiones,
              peso: 0.15,
              pesoNormalizado: 42.86, // 15/35 * 100
              contribucion: pm.promedioRevisiones
                ? (0.15 * pm.promedioRevisiones) / 0.35
                : 0,
            },
            laboratorios: {
              notas: laboratorios.map((n) => ({
                id_nota: n.id_nota,
                calificacion: n.calificacion,
                nombre_evaluacion: n.evaluacion?.nombre,
              })),
              promedio: pm.promedioLaboratorios,
              peso: 0.15,
              pesoNormalizado: 42.86, // 15/35 * 100
              contribucion: pm.promedioLaboratorios
                ? (0.15 * pm.promedioLaboratorios) / 0.35
                : 0,
            },
          },
          promedioMensual: pm.promedioMensual,
          formula: 'PromMes = (0.05·Tareas + 0.15·Revisión + 0.15·Lab) / 0.35',
          nota: 'El promedio mensual está normalizado a escala de 10. Puede mostrarse como 100% en el frontend.',
        };
      }),
    );

    return {
      alumnoId,
      asignaturaId,
      anioAcademico,
      trimestre,
      meses: desgloseCompleto,
      resumen: {
        totalMeses: desgloseCompleto.length,
        promedioGeneral:
          desgloseCompleto.length > 0
            ? desgloseCompleto.reduce((sum, m) => sum + m.promedioMensual, 0) /
              desgloseCompleto.length
            : 0,
      },
    };
  }

  /**
   * Obtener promedios trimestrales con desglose completo
   */
  async obtenerPromediosTrimestralesConDesglose(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
    trimestre?: number,
  ) {
    const trimestresAConsultar = trimestre ? [trimestre] : [1, 2, 3];

    const desgloseCompleto = await Promise.all(
      trimestresAConsultar.map(async (t) => {
        // Obtener promedio trimestral
        const promedioTrimestral =
          await this.prisma.promedioTrimestral.findUnique({
            where: {
              alumnoId_asignaturaId_anioAcademico_trimestre: {
                alumnoId,
                asignaturaId,
                anioAcademico,
                trimestre: t,
              },
            },
          });

        if (!promedioTrimestral) {
          return null;
        }

        // Obtener promedios mensuales del trimestre
        const mesesPorTrimestre: { [key: number]: number[] } = {
          1: [2, 3, 4],
          2: [5, 6, 7],
          3: [8, 9, 10],
        };
        const meses = mesesPorTrimestre[t];
        const pesosMensuales = [0.28, 0.27, 0.45];

        const promediosMensuales = await this.prisma.promedioMensual.findMany({
          where: {
            alumnoId,
            asignaturaId,
            anioAcademico,
            mes: { in: meses },
          },
          orderBy: { mes: 'asc' },
        });

        const bloqueMensual = {
          pesoDelTrimestre: 35,
          meses: promediosMensuales.map((pm, index) => ({
            mes: pm.mes,
            promedio: pm.promedioMensual,
            pesoEnElBloque: pesosMensuales[index] * 100,
            contribucionAlBloque: pm.promedioMensual * pesosMensuales[index],
          })),
          promedioBloque: promedioTrimestral.promedioMeses,
          contribucionAlTrimestre:
            0.35 * (promedioTrimestral.promedioMeses || 0),
        };

        const bloqueActividades = {
          pesoDelTrimestre: 35,
          actividades: [
            {
              nombre: 'Actividad Integradora',
              calificacion: promedioTrimestral.actividadIntegradora,
              peso: 25,
              contribucionAlTrimestre:
                0.25 * (promedioTrimestral.actividadIntegradora || 0),
            },
            {
              nombre: 'Autoevaluación',
              calificacion: promedioTrimestral.autoevaluacion,
              peso: 10,
              contribucionAlTrimestre:
                0.1 * (promedioTrimestral.autoevaluacion || 0),
            },
          ],
          contribucionTotal:
            0.25 * (promedioTrimestral.actividadIntegradora || 0) +
            0.1 * (promedioTrimestral.autoevaluacion || 0),
        };

        const bloqueExamen = {
          pesoDelTrimestre: 30,
          examen: {
            nombre: 'Examen Trimestral',
            calificacion: promedioTrimestral.examenTrimestral,
            peso: 30,
            contribucionAlTrimestre:
              0.3 * (promedioTrimestral.examenTrimestral || 0),
          },
        };

        return {
          trimestre: t,
          bloques: {
            mensual: bloqueMensual,
            actividades: bloqueActividades,
            examen: bloqueExamen,
          },
          promedioTrimestral: promedioTrimestral.promedioTrimestral,
          aprobado: promedioTrimestral.aprobado,
          formula:
            'Trimestre = 0.35·Meses + 0.25·ActInteg + 0.10·Autoeval + 0.30·Examen',
          verificacion: {
            sumaPorcentajes: '35% + 25% + 10% + 30% = 100%',
            sumaContribuciones:
              bloqueMensual.contribucionAlTrimestre +
              bloqueActividades.contribucionTotal +
              bloqueExamen.examen.contribucionAlTrimestre,
          },
        };
      }),
    );

    return {
      alumnoId,
      asignaturaId,
      anioAcademico,
      trimestres: desgloseCompleto.filter((t) => t !== null),
      promedioAnual:
        desgloseCompleto.filter((t) => t !== null).length > 0
          ? desgloseCompleto
              .filter((t) => t !== null)
              .reduce((sum, t) => sum + t!.promedioTrimestral, 0) /
            desgloseCompleto.filter((t) => t !== null).length
          : 0,
    };
  }

  /**
   * Obtener promedios por periodo (BACHILLERATO) con desglose
   */
  async obtenerPromediosPeriodoConDesglose(
    alumnoId: number,
    asignaturaId: number,
    anioAcademico: string,
    periodo?: number,
  ) {
    const periodosAConsultar = periodo ? [periodo] : [1, 2, 3, 4];

    const desgloseCompleto = await Promise.all(
      periodosAConsultar.map(async (p) => {
        const promedioPeriodo =
          await this.prisma.promedioFinalAsignatura.findFirst({
            where: {
              alumnoId,
              asignaturaId,
              anioAcademico,
              // Nota: Asumiendo que tienes un campo 'periodo' en PromedioFinalAsignatura
              // Si no existe, necesitarás ajustar el modelo
            },
          });

        // Obtener notas del periodo
        const notas = await this.prisma.notas.findMany({
          where: {
            id_alumno: alumnoId,
            id_asignatura: asignaturaId,
            evaluacion: {
              anio_academico: anioAcademico,
              periodo: p,
            },
          },
          include: {
            evaluacion: {
              include: {
                tipoEvaluacion: true,
              },
            },
          },
        });

        // Agrupar por tipo
        const actividadIntegradora = notas.find(
          (n) =>
            n.evaluacion?.tipoEvaluacion?.nombre === 'Actividad Integradora',
        );
        const tareas = notas.filter(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Tarea',
        );
        const coevaluacion = notas.find(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Coevaluación',
        );
        const laboratorio = notas.find(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Laboratorio',
        );
        const examenParcial = notas.find(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Examen Parcial',
        );
        const examenPeriodo = notas.find(
          (n) => n.evaluacion?.tipoEvaluacion?.nombre === 'Examen del Periodo',
        );

        // Calcular promedio de tareas
        const promedioTareas =
          tareas.length > 0
            ? tareas.reduce((sum, n) => sum + (n.calificacion || 0), 0) /
              tareas.length
            : 0;

        const rubros = [
          {
            nombre: 'Actividad Integradora',
            calificacion: actividadIntegradora?.calificacion || 0,
            peso: 25,
            contribucion: 0.25 * (actividadIntegradora?.calificacion || 0),
          },
          {
            nombre: 'Tareas',
            calificacion: promedioTareas,
            peso: 5,
            contribucion: 0.05 * promedioTareas,
            notas: tareas.map((n) => ({
              id_nota: n.id_nota,
              calificacion: n.calificacion,
              nombre: n.evaluacion?.nombre,
            })),
          },
          {
            nombre: 'Coevaluación',
            calificacion: coevaluacion?.calificacion || 0,
            peso: 5,
            contribucion: 0.05 * (coevaluacion?.calificacion || 0),
          },
          {
            nombre: 'Laboratorio',
            calificacion: laboratorio?.calificacion || 0,
            peso: 10,
            contribucion: 0.1 * (laboratorio?.calificacion || 0),
          },
          {
            nombre: 'Examen Parcial',
            calificacion: examenParcial?.calificacion || 0,
            peso: 25,
            contribucion: 0.25 * (examenParcial?.calificacion || 0),
          },
          {
            nombre: 'Examen del Periodo',
            calificacion: examenPeriodo?.calificacion || 0,
            peso: 30,
            contribucion: 0.3 * (examenPeriodo?.calificacion || 0),
          },
        ];

        const promedioPeriodoCalculado = rubros.reduce(
          (sum, r) => sum + r.contribucion,
          0,
        );

        return {
          periodo: p,
          rubros,
          promedioPeriodo: promedioPeriodoCalculado,
          formula:
            'Periodo = 0.25·ActInteg + 0.05·Tareas + 0.05·Coev + 0.10·Lab + 0.25·ExParc + 0.30·ExPer',
          verificacion: {
            sumaPorcentajes: '25% + 5% + 5% + 10% + 25% + 30% = 100%',
            sumaContribuciones: promedioPeriodoCalculado,
          },
        };
      }),
    );

    return {
      alumnoId,
      asignaturaId,
      anioAcademico,
      periodos: desgloseCompleto,
      promedioAnual:
        desgloseCompleto.length > 0
          ? desgloseCompleto.reduce((sum, p) => sum + p.promedioPeriodo, 0) /
            desgloseCompleto.length
          : 0,
    };
  }

  /**
   * Obtener desglose completo de todas las asignaturas de un alumno
   */
  async obtenerDesgloseCompletoAlumno(alumnoId: number, anioAcademico: string) {
    // Obtener inscripción del alumno (AlumnoCurso)
    const inscripcion = await this.prisma.alumnoCurso.findFirst({
      where: {
        alumnoId,
        anioAcademico,
      },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('Alumno no inscrito en el año académico');
    }

    // Obtener todas las asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: {
        id_curso: inscripcion.cursoId,
      },
    });

    // Determinar si es BÁSICA o BACHILLERATO
    const gradoAcademico = inscripcion.curso?.gradoAcademico;
    if (!gradoAcademico) {
      throw new NotFoundException('Grado académico no encontrado');
    }

    const esBasica =
      gradoAcademico.nombre === 'Primaria' ||
      gradoAcademico.nombre === 'Secundaria';

    // Obtener desglose para cada asignatura
    const desgloseAsignaturas = await Promise.all(
      asignaturas.map(async (asig) => {
        if (esBasica) {
          // BÁSICA: obtener trimestres
          const trimestres = await this.obtenerPromediosTrimestralesConDesglose(
            alumnoId,
            asig.id_asignatura,
            anioAcademico,
          );

          return {
            asignatura: {
              id: asig.id_asignatura,
              nombre: asig.nombre,
            },
            sistema: 'BASICA',
            trimestres: trimestres.trimestres,
            promedioAnual: trimestres.promedioAnual,
          };
        } else {
          // BACHILLERATO: obtener periodos
          const periodos = await this.obtenerPromediosPeriodoConDesglose(
            alumnoId,
            asig.id_asignatura,
            anioAcademico,
          );

          return {
            asignatura: {
              id: asig.id_asignatura,
              nombre: asig.nombre,
            },
            sistema: 'BACHILLERATO',
            periodos: periodos.periodos,
            promedioAnual: periodos.promedioAnual,
          };
        }
      }),
    );

    return {
      alumno: {
        id: alumnoId,
      },
      anioAcademico,
      curso: {
        id: inscripcion.curso.id_curso,
        nombre: inscripcion.curso.nombre,
        gradoAcademico: gradoAcademico.nombre,
      },
      sistema: esBasica ? 'BASICA' : 'BACHILLERATO',
      asignaturas: desgloseAsignaturas,
      promedioGeneral:
        desgloseAsignaturas.length > 0
          ? desgloseAsignaturas.reduce((sum, a) => sum + a.promedioAnual, 0) /
            desgloseAsignaturas.length
          : 0,
    };
  }
}
