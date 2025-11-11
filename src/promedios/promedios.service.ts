import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

    // Calcular promedio de actividades (normalizado): (0.25·ActInteg + 0.10·Autoeval) / 0.35
    // Esto normaliza 25% + 10% = 35% a escala de 10
    const promedioActividades =
      (0.25 * notaActividadIntegradora + 0.1 * notaAutoevaluacion) / 0.35;

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
    const promedioTrimestral =
      0.35 * promedioMeses + 0.35 * promedioActividades + 0.3 * notaExamen;

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
        promedioActividades: Math.round(promedioActividades * 100) / 100,
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
        promedioActividades: Math.round(promedioActividades * 100) / 100,
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
   * Cierra las calificaciones de un alumno (el orientador marca como finalizado)
   */
  async cerrarCalificaciones(
    alumnoId: number,
    cursoId: number,
    anioAcademico: string,
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
}
