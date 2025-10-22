import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PromoverAlumnoDto,
  PromocionMasivaDto,
  FinalizarAlumnoDto,
  AlumnoPromocionDto,
} from './dto/promociones.dto';
import { ActividadesRecientesService } from '../actividades-recientes/actividades-recientes.service';

@Injectable()
export class PromocionesService {
  constructor(
    private prisma: PrismaService,
    private actividadesRecientesService: ActividadesRecientesService,
  ) {}

  // Método auxiliar para validar datos de promoción
  private validarDatosPromocion(alumnoId: number, cursoId: number): boolean {
    return alumnoId > 0 && cursoId > 0;
  }

  /**
   * Promueve un alumno a un nuevo curso para el siguiente año académico
   * Utilizando la tabla explícita AlumnoCurso
   */
  async promoverAlumno(dto: PromoverAlumnoDto) {
    const {
      alumnoId,
      cursoDestinoId,
      anioActual,
      anioDestino,
      estado = 'APROBADO',
      observaciones,
      notaPromedio,
    } = dto;

    // Vamos a usar un enfoque más robusto
    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar que el alumno existe
      const alumno = await tx.alumno.findUnique({
        select: { id_alumno: true, nombre: true, apellido: true },
        where: { id_alumno: alumnoId },
      });

      if (!alumno) {
        throw new NotFoundException(`Alumno con ID ${alumnoId} no encontrado`);
      }

      // 2. Verificar que el curso destino existe y tiene cupo disponible
      const cursoDestino = await tx.curso.findUnique({
        select: { id_curso: true, nombre: true, seccion: true, cupo: true },
        where: { id_curso: cursoDestinoId },
      });

      if (!cursoDestino) {
        throw new NotFoundException(
          `Curso destino con ID ${cursoDestinoId} no encontrado`,
        );
      }

      // Contar alumnos actuales en el curso destino para el año académico destino
      const alumnosEnCursoDestino = await tx.alumnoCurso.count({
        where: {
          cursoId: cursoDestinoId,
          anioAcademico: anioDestino,
          estado: 'ACTIVO',
        },
      });

      // Verificar si hay cupo disponible
      if (cursoDestino.cupo && alumnosEnCursoDestino >= cursoDestino.cupo) {
        throw new ConflictException(
          `El curso destino ya alcanzó su capacidad máxima (${cursoDestino.cupo} alumnos)`,
        );
      }

      // 3. Buscar las inscripciones actuales
      const inscripcionesActuales = await tx.alumnoCurso.findMany({
        select: {
          id: true,
          alumnoId: true,
          cursoId: true,
          anioAcademico: true,
          estado: true,
        },
        where: {
          alumnoId,
          anioAcademico: anioActual,
          estado: 'ACTIVO',
        },
      });

      // Obtener los cursos actuales para tener los nombres
      const cursosIDs = inscripcionesActuales.map((insc) => insc.cursoId);
      const cursos = await tx.curso.findMany({
        select: { id_curso: true, nombre: true, seccion: true },
        where: { id_curso: { in: cursosIDs } },
      });

      const cursoMap = new Map();
      cursos.forEach((curso) => {
        cursoMap.set(curso.id_curso, curso);
      });

      // 4. Procesar cada inscripción actual
      for (const inscripcion of inscripcionesActuales) {
        // Manejar el historial académico
        const historialExistente = await tx.historialAcademico.findFirst({
          where: {
            alumnoId,
            cursoId: inscripcion.cursoId,
            anioAcademico: anioActual,
          },
        });

        if (historialExistente) {
          // Actualizar historial existente
          await tx.historialAcademico.update({
            where: { id: historialExistente.id },
            data: {
              estadoFinal: estado,
              notaPromedio,
              observaciones,
              fechaFin: new Date(),
            },
          });
        } else {
          // Crear nuevo historial
          await tx.historialAcademico.create({
            data: {
              alumnoId,
              cursoId: inscripcion.cursoId,
              anioAcademico: anioActual,
              estadoFinal: estado,
              notaPromedio,
              observaciones,
              fechaInicio: new Date(parseInt(anioActual), 0, 1),
              fechaFin: new Date(),
            },
          });
        }

        // En lugar de actualizar, hacemos un executeRaw directo a la base de datos
        // para evitar cualquier problema con columnas que no existen
        await tx.$executeRaw`
          UPDATE "AlumnoCurso" 
          SET estado = 'INACTIVO', "fechaRetiro" = ${new Date()}
          WHERE id = ${inscripcion.id}
        `;
      }

      // 5. Crear nueva inscripción en AlumnoCurso para el curso destino
      await tx.alumnoCurso.create({
        data: {
          alumnoId,
          cursoId: cursoDestinoId,
          anioAcademico: anioDestino,
          estado: 'ACTIVO',
          fechaInscripcion: new Date(),
        },
      });

      // 6. Crear entrada en el historial académico para el nuevo curso
      await tx.historialAcademico.create({
        data: {
          alumnoId,
          cursoId: cursoDestinoId,
          anioAcademico: anioDestino,
          estadoFinal: null, // Aún no hay estado final
          fechaInicio: new Date(),
          fechaFin: null,
        },
      });

      // 6. Actualizar el año escolar del alumno y el estado de repetición
      await tx.alumno.update({
        where: { id_alumno: alumnoId },
        data: {
          anioEscolar: anioDestino,
          // Si es reprobado, se actualizará el campo repiteGrado
          repiteGrado: estado === 'REPROBADO',
        },
      });

      // 7. Registrar la actividad usando los cursos que ya obtuvimos
      const cursoActualNombre =
        cursosIDs.length > 0 && cursoMap.has(cursosIDs[0])
          ? `${cursoMap.get(cursosIDs[0]).nombre}${cursoMap.get(cursosIDs[0]).seccion ? ' ' + cursoMap.get(cursosIDs[0]).seccion : ''}`
          : 'Sin curso asignado';

      await this.actividadesRecientesService.registrarActividad({
        descripcion: `Alumno ${alumno.nombre} ${alumno.apellido} ${
          estado === 'APROBADO' ? 'promovido' : 'trasladado'
        } de ${cursoActualNombre} al curso ${cursoDestino.nombre}${
          cursoDestino.seccion ? ' ' + cursoDestino.seccion : ''
        } para el año ${anioDestino}`,
        tipo: 'info',
        entidad: 'alumno',
        entidad_id: alumnoId,
      });

      // 8. Retornar resultado
      return {
        id: alumnoId,
        nombre: `${alumno.nombre} ${alumno.apellido}`,
        cursoAnterior: cursoActualNombre,
        cursoNuevo: `${cursoDestino.nombre}${cursoDestino.seccion ? ' ' + cursoDestino.seccion : ''}`,
        anioEscolar: anioDestino,
        estado,
      };
    });
  }

  /**
   * Marca a un alumno como finalizado (graduado) y opcionalmente lo marca como inactivo
   * Utiliza la tabla explícita AlumnoCurso
   */
  async finalizarAlumno(dto: FinalizarAlumnoDto) {
    const {
      alumnoId,
      anioActual,
      estado = 'FINALIZADO',
      observaciones,
      notaPromedio,
      marcarInactivo = true,
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar que el alumno existe
      const alumno = await tx.alumno.findUnique({
        where: { id_alumno: alumnoId },
      });

      if (!alumno) {
        throw new NotFoundException(`Alumno con ID ${alumnoId} no encontrado`);
      }

      // 2. Buscar las inscripciones activas del alumno en el año actual
      const inscripcionesActuales = await tx.alumnoCurso.findMany({
        select: {
          id: true,
          alumnoId: true,
          cursoId: true,
          anioAcademico: true,
          estado: true,
          fechaInscripcion: true,
          seccionAsignada: true,
          observaciones: true,
          curso: {
            select: {
              id_curso: true,
              nombre: true,
              seccion: true,
            },
          },
        },
        where: {
          alumnoId,
          anioAcademico: anioActual,
          estado: 'ACTIVO',
        },
      });

      if (inscripcionesActuales.length === 0) {
        throw new BadRequestException(
          `El alumno no está inscrito en ningún curso en el año ${anioActual}`,
        );
      }

      for (const inscripcion of inscripcionesActuales) {
        // Verificar si ya existe una entrada en el historial
        const historialExistente = await tx.historialAcademico.findFirst({
          where: {
            alumnoId,
            cursoId: inscripcion.cursoId,
            anioAcademico: anioActual,
          },
        });

        if (historialExistente) {
          // Actualizar el historial existente
          await tx.historialAcademico.update({
            where: { id: historialExistente.id },
            data: {
              estadoFinal: estado,
              notaPromedio,
              observaciones,
              fechaFin: new Date(),
            },
          });
        } else {
          // Crear nuevo registro en el historial
          await tx.historialAcademico.create({
            data: {
              alumnoId,
              cursoId: inscripcion.cursoId,
              anioAcademico: anioActual,
              estadoFinal: estado,
              notaPromedio,
              observaciones,
              fechaInicio:
                inscripcion.fechaInscripcion ||
                new Date(parseInt(anioActual), 0, 1), // Usar fecha de inscripción si está disponible
              fechaFin: new Date(),
            },
          });
        }

        // 3. Actualizar la inscripción a inactiva usando SQL directo
        await tx.$executeRaw`
          UPDATE "AlumnoCurso" 
          SET estado = 'INACTIVO', "fechaRetiro" = ${new Date()}
          WHERE id = ${inscripcion.id}
        `;
      }

      // 4. Marcar alumno como inactivo si se requiere
      if (marcarInactivo) {
        await tx.alumno.update({
          where: { id_alumno: alumnoId },
          data: {
            activo: false,
            estadoMatricula: estado,
          },
        });
      }

      // 5. Registrar la actividad
      const cursoActualNombre =
        inscripcionesActuales.length > 0
          ? `${inscripcionesActuales[0].curso.nombre}${inscripcionesActuales[0].curso.seccion ? ' ' + inscripcionesActuales[0].curso.seccion : ''}`
          : 'Sin curso asignado';

      await this.actividadesRecientesService.registrarActividad({
        descripcion: `Alumno ${alumno.nombre} ${alumno.apellido} ha ${estado} sus estudios en ${cursoActualNombre}. ${marcarInactivo ? 'Marcado como inactivo.' : ''}`,
        tipo: 'info',
        entidad: 'alumno',
        entidad_id: alumnoId,
      });

      // 6. Retornar resultado
      return {
        id: alumnoId,
        nombre: `${alumno.nombre} ${alumno.apellido}`,
        curso: cursoActualNombre,
        anioEscolar: anioActual,
        estado,
        activo: !marcarInactivo,
      };
    });
  }

  /**
   * Procesa promociones masivas al final del año académico
   * Utilizando la tabla explícita AlumnoCurso
   */
  async procesarPromocionMasiva(dto: PromocionMasivaDto) {
    const { anioActual, anioSiguiente, promocionesPorCurso } = dto;

    return this.prisma.$transaction(async (tx) => {
      const resultados: any[] = [];

      for (const promocion of promocionesPorCurso) {
        const { cursoOrigenId, cursoDestinoId, alumnos } = promocion;

        // 1. Validar que los cursos existan
        const cursoOrigen = await tx.curso.findUnique({
          where: { id_curso: cursoOrigenId },
        });

        if (!cursoOrigen) {
          resultados.push({
            cursoOrigenId,
            cursoDestinoId,
            exitoso: false,
            mensaje: `Curso origen con ID ${cursoOrigenId} no encontrado`,
          });
          continue;
        }

        const cursoDestino = await tx.curso.findUnique({
          where: { id_curso: cursoDestinoId },
        });

        if (!cursoDestino) {
          resultados.push({
            cursoOrigenId,
            cursoDestinoId,
            exitoso: false,
            mensaje: `Curso destino con ID ${cursoDestinoId} no encontrado`,
          });
          continue;
        }

        // Obtener las inscripciones actuales de los alumnos en este curso
        const inscripcionesActuales = await tx.alumnoCurso.findMany({
          select: {
            id: true,
            alumnoId: true,
            cursoId: true,
            anioAcademico: true,
            estado: true,
            fechaInscripcion: true,
            seccionAsignada: true,
            observaciones: true,
            alumno: {
              select: {
                id_alumno: true,
                nombre: true,
                apellido: true,
              },
            },
          },
          where: {
            cursoId: cursoOrigenId,
            alumnoId: { in: alumnos.map((a) => a.alumnoId) },
            anioAcademico: anioActual,
            estado: 'ACTIVO',
          },
        });

        // Verificar si no hay inscripciones
        if (inscripcionesActuales.length === 0) {
          resultados.push({
            cursoOrigenId,
            cursoDestinoId,
            exitoso: false,
            mensaje: `No hay alumnos inscritos en el curso origen para el año ${anioActual}`,
          });
          continue;
        }

        // 2. Verificar cupos disponibles
        const alumnosEnCursoDestino = await tx.alumnoCurso.count({
          where: {
            cursoId: cursoDestinoId,
            anioAcademico: anioSiguiente,
            estado: 'ACTIVO',
          },
        });

        if (
          cursoDestino.cupo &&
          alumnosEnCursoDestino + alumnos.length > cursoDestino.cupo
        ) {
          resultados.push({
            cursoOrigenId,
            cursoDestinoId,
            exitoso: false,
            mensaje: `El curso destino no tiene suficiente cupo. Disponible: ${cursoDestino.cupo - alumnosEnCursoDestino}, Requerido: ${alumnos.length}`,
          });
          continue;
        }

        // 3. Procesar cada alumno
        const alumnosPromovidos: any[] = [];
        const alumnosProcesados = new Set(); // Para evitar duplicados
        let alumnosNoPromovidos = 0;

        for (const alumnoInfo of alumnos) {
          try {
            const { alumnoId, estado, notaPromedio, observaciones } =
              alumnoInfo;

            // Evitar procesar el mismo alumno más de una vez
            if (alumnosProcesados.has(alumnoId)) continue;
            alumnosProcesados.add(alumnoId);

            // Buscar la inscripción actual del alumno
            const inscripcionActual = inscripcionesActuales.find(
              (inscripcion) => inscripcion.alumnoId === alumnoId,
            );

            // Verificar que el alumno existe en el curso origen
            if (!inscripcionActual) {
              alumnosNoPromovidos++;
              continue;
            }

            const alumno = inscripcionActual.alumno;

            // 3.1. Cerrar historial académico actual
            const historialExistente = await tx.historialAcademico.findFirst({
              where: {
                alumnoId,
                cursoId: cursoOrigenId,
                anioAcademico: anioActual,
              },
            });

            if (historialExistente) {
              await tx.historialAcademico.update({
                where: { id: historialExistente.id },
                data: {
                  estadoFinal: estado,
                  notaPromedio,
                  observaciones,
                  fechaFin: new Date(),
                },
              });
            } else {
              await tx.historialAcademico.create({
                data: {
                  alumnoId,
                  cursoId: cursoOrigenId,
                  anioAcademico: anioActual,
                  estadoFinal: estado,
                  notaPromedio,
                  observaciones,
                  fechaInicio:
                    inscripcionActual.fechaInscripcion ||
                    new Date(parseInt(anioActual), 0, 1),
                  fechaFin: new Date(),
                },
              });
            }

            // 3.2. Crear historial para el nuevo curso
            await tx.historialAcademico.create({
              data: {
                alumnoId,
                cursoId: cursoDestinoId,
                anioAcademico: anioSiguiente,
                fechaInicio: new Date(),
              },
            });

            // 3.3. Marcar la inscripción actual como inactiva usando SQL directo
            await tx.$executeRaw`
              UPDATE "AlumnoCurso" 
              SET estado = 'INACTIVO', "fechaRetiro" = ${new Date()}
              WHERE id = ${inscripcionActual.id}
            `;

            // 3.4. Crear nueva inscripción para el curso destino
            await tx.alumnoCurso.create({
              data: {
                alumnoId,
                cursoId: cursoDestinoId,
                anioAcademico: anioSiguiente,
                estado: 'ACTIVO',
                fechaInscripcion: new Date(),
              },
            });

            // 3.5. Actualizar año escolar y estado de repetición del alumno
            await tx.alumno.update({
              where: { id_alumno: alumnoId },
              data: {
                anioEscolar: anioSiguiente,
                repiteGrado: estado === 'REPROBADO',
              },
            });

            // 3.6. Registrar actividad
            await this.actividadesRecientesService.registrarActividad({
              descripcion: `Alumno ${alumno.nombre} ${alumno.apellido} ${
                estado === 'APROBADO' ? 'promovido' : 'trasladado'
              } al curso ${cursoDestino.nombre}${
                cursoDestino.seccion ? ' ' + cursoDestino.seccion : ''
              } para el año ${anioSiguiente}`,
              tipo: 'info',
              entidad: 'alumno',
              entidad_id: alumnoId,
            });

            alumnosPromovidos.push({
              id: alumnoId,
              nombre: `${alumno.nombre} ${alumno.apellido}`,
              estado,
            });
          } catch (error) {
            console.error(`Error al procesar alumno:`, error);
            alumnosNoPromovidos++;
          }
        }

        // 4. Registrar resultado de esta promoción masiva
        resultados.push({
          cursoOrigenId,
          nombreCursoOrigen: `${cursoOrigen.nombre}${cursoOrigen.seccion ? ' ' + cursoOrigen.seccion : ''}`,
          cursoDestinoId,
          nombreCursoDestino: `${cursoDestino.nombre}${cursoDestino.seccion ? ' ' + cursoDestino.seccion : ''}`,
          exitoso: true,
          alumnosPromovidos: alumnosPromovidos.length,
          alumnosNoPromovidos,
          detalle: alumnosPromovidos,
        });
      }

      return resultados;
    });
  }

  /**
   * Obtiene el historial académico de un alumno
   * Incluye información de la tabla AlumnoCurso para mayor detalle
   */
  async obtenerHistorialAcademico(alumnoId: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: alumnoId },
      select: {
        id_alumno: true,
        nombre: true,
        apellido: true,
        activo: true,
        estadoMatricula: true,
        anioEscolar: true,
      },
    });

    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${alumnoId} no encontrado`);
    }

    // Obtener historial académico
    const historial = await this.prisma.historialAcademico.findMany({
      where: { alumnoId },
      include: {
        curso: {
          select: {
            nombre: true,
            seccion: true,
            gradoAcademico: {
              select: { nombre: true },
            },
          },
        },
      },
      orderBy: [{ anioAcademico: 'desc' }, { fechaInicio: 'desc' }],
    });

    // Obtener inscripciones del alumno para enriquecer la información
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      select: {
        id: true,
        alumnoId: true,
        cursoId: true,
        anioAcademico: true,
        estado: true,
        fechaInscripcion: true,
        seccionAsignada: true,
        observaciones: true,
      },
      where: { alumnoId },
      orderBy: [{ anioAcademico: 'desc' }, { fechaInscripcion: 'desc' }],
    });

    // Crear un mapa de inscripciones por curso y año para facilitar la búsqueda
    const inscripcionesMap = new Map();
    inscripciones.forEach((inscripcion) => {
      const key = `${inscripcion.cursoId}-${inscripcion.anioAcademico}`;
      inscripcionesMap.set(key, inscripcion);
    });

    return {
      alumno,
      historial: historial.map((h) => {
        // Buscar la inscripción correspondiente a este registro de historial
        const key = `${h.cursoId}-${h.anioAcademico}`;
        const inscripcion = inscripcionesMap.get(key);

        return {
          id: h.id,
          anioAcademico: h.anioAcademico,
          curso: `${h.curso.nombre}${h.curso.seccion ? ' ' + h.curso.seccion : ''}`,
          gradoAcademico: h.curso.gradoAcademico?.nombre || null,
          estadoFinal: h.estadoFinal,
          notaPromedio: h.notaPromedio,
          fechaInicio: h.fechaInicio,
          fechaFin: h.fechaFin,
          observaciones: h.observaciones,
          // Agregar información de la inscripción si existe
          fechaInscripcion: inscripcion?.fechaInscripcion || h.fechaInicio,
          fechaFinalizacion: h.fechaFin,
          estadoInscripcion: inscripcion?.estado || null,
        };
      }),
    };
  }

  /**
   * Obtiene el listado de alumnos de un curso para la pantalla de promoción
   * Utilizando la tabla explícita AlumnoCurso
   */
  async obtenerAlumnosPorCursoParaPromocion(
    cursoId: number,
    anioAcademico: string,
  ) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: cursoId },
      include: {
        gradoAcademico: true,
      },
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${cursoId} no encontrado`);
    }

    // Obtener inscripciones activas de alumnos en este curso y año académico
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      select: {
        id: true,
        alumnoId: true,
        cursoId: true,
        anioAcademico: true,
        estado: true,
        fechaInscripcion: true,
        fechaRetiro: true,
        seccionAsignada: true,
        observaciones: true,
        alumno: {
          select: {
            id_alumno: true,
            nombre: true,
            apellido: true,
            activo: true,
          },
        },
      },
      where: {
        cursoId,
        anioAcademico,
        estado: 'ACTIVO',
      },
    });

    // Filtrar solo inscripciones con alumnos activos
    const inscripcionesFiltradas = inscripciones.filter(
      (inscripcion) =>
        inscripcion.alumno !== null && inscripcion.alumno.activo === true,
    );

    // Extraer IDs de alumnos para consultas posteriores
    const alumnosIds = inscripcionesFiltradas.map(
      (inscripcion) => inscripcion.alumnoId,
    );

    // Obtener historial académico de los alumnos para este curso y año
    const historiales = await this.prisma.historialAcademico.findMany({
      where: {
        cursoId,
        anioAcademico,
        alumnoId: {
          in: alumnosIds,
        },
      },
    });

    // Obtener todas las notas de los alumnos para calcular promedios
    const notasAlumnos = await this.prisma.notas.findMany({
      where: {
        alumno: {
          id_alumno: {
            in: alumnosIds,
          },
        },
        asignatura: {
          curso: {
            id_curso: cursoId,
          },
        },
      },
      include: {
        asignatura: true,
      },
    });

    // Calcular promedios por alumno
    const promedios = {};
    alumnosIds.forEach((alumnoId) => {
      const notasAlumno = notasAlumnos.filter((n) => n.id_alumno === alumnoId);
      if (notasAlumno.length > 0) {
        const sumaNotas = notasAlumno.reduce(
          (sum, nota) => sum + (nota.calificacion || 0),
          0,
        );
        promedios[alumnoId] = sumaNotas / notasAlumno.length;
      } else {
        promedios[alumnoId] = null;
      }
    });

    // Crear un mapa de historial por alumno para acceso rápido
    const historialMap = new Map();
    historiales.forEach((h) => {
      historialMap.set(h.alumnoId, h);
    });

    // Preparar los datos de retorno
    const alumnosData = inscripcionesFiltradas.map((inscripcion) => {
      const alumno = inscripcion.alumno;
      const historial = historialMap.get(inscripcion.alumnoId);

      return {
        id: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        nombreCompleto: `${alumno.nombre} ${alumno.apellido}`,
        fechaInscripcion: inscripcion.fechaInscripcion,
        notaPromedio: promedios[inscripcion.alumnoId],
        estadoActual: historial?.estadoFinal || null,
        observaciones: historial?.observaciones || null,
      };
    });

    return {
      curso: {
        id: curso.id_curso,
        nombre: curso.nombre,
        seccion: curso.seccion,
        gradoAcademico: curso.gradoAcademico?.nombre,
        nombreCompleto: `${curso.nombre}${curso.seccion ? ' ' + curso.seccion : ''}`,
      },
      alumnos: alumnosData,
      total: alumnosData.length,
    };
  }

  /**
   * Obtiene los cursos disponibles para promoción basado en el grado académico
   */
  async obtenerCursosParaPromocion(
    gradoAcademicoId: number,
    anioAcademico: string,
  ) {
    // Obtener el grado académico actual
    const gradoActual = await this.prisma.grado_Academico.findUnique({
      where: { id_grado_academico: gradoAcademicoId },
    });

    if (!gradoActual) {
      throw new NotFoundException(
        `Grado académico con ID ${gradoAcademicoId} no encontrado`,
      );
    }

    // Obtener todos los grados académicos
    const todosGrados = await this.prisma.grado_Academico.findMany({
      include: {
        curso: {
          where: {
            activo: true,
            OR: [{ anio_academico: anioAcademico }, { anio_academico: null }],
          },
          include: {
            alumnos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    // Encontrar el próximo grado lógico (si existe)
    let cursosSugeridos: any[] = [];
    let todosLosCursos: any[] = [];

    // Agregar todos los cursos disponibles
    todosGrados.forEach((grado) => {
      const cursosDelGrado = grado.curso.map((curso) => ({
        id: curso.id_curso,
        nombre: curso.nombre,
        seccion: curso.seccion,
        gradoAcademico: grado.nombre,
        cupoDisponible: curso.cupo
          ? curso.cupo - (curso.alumnos?.length || 0)
          : null,
        nombreCompleto: `${curso.nombre}${curso.seccion ? ' ' + curso.seccion : ''} (${grado.nombre})`,
        sugerido: false,
      }));

      todosLosCursos = [...todosLosCursos, ...cursosDelGrado];

      // Si es el siguiente grado, marcar como sugerido
      if (grado.nombre > gradoActual.nombre) {
        cursosSugeridos = [
          ...cursosSugeridos,
          ...cursosDelGrado.map((c) => ({ ...c, sugerido: true })),
        ];
      }
    });

    // Si es el último grado, sugerir "Finalización"
    const esUltimoGrado = !todosGrados.some(
      (g) => g.nombre > gradoActual.nombre,
    );

    return {
      cursosSugeridos:
        cursosSugeridos.length > 0 ? cursosSugeridos : todosLosCursos,
      todosLosCursos,
      esUltimoGrado,
    };
  }
}
