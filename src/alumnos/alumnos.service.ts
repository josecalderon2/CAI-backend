import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAlumnoDto,
  CreateAlumnoDetalleDto,
  CreateAlumnoResponsableDto,
  UpdateAlumnoDto,
} from './dto';
import { ResponsablesService } from '../responsables/responsables.service';
import { ActividadRegistroService } from '../actividades-recientes/actividad-registro.service';

@Injectable()
export class AlumnosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responsablesService: ResponsablesService,
    private readonly actividadRegistroService: ActividadRegistroService,
  ) {}

  /**
   * Crea un nuevo alumno con sus detalles y responsables
   */
  async create(createAlumnoDto: CreateAlumnoDto) {
    const { responsables, detalle, ...datosAlumno } = createAlumnoDto;

    // Usamos una transacción para garantizar que todo se crea correctamente
    return this.prisma.$transaction(async (prisma) => {
      // 1. Crear el alumno
      const alumno = await prisma.alumno.create({
        data: datosAlumno,
      });

      console.log('Alumno creado con ID:', alumno.id_alumno);

      // 2. Si hay detalles, los creamos
      if (detalle) {
        await prisma.alumno_Detalle.create({
          data: {
            alumnoId: alumno.id_alumno,
            ...detalle,
          },
        });
      }

      // 3. Procesar responsables
      if (responsables && responsables.length > 0) {
        await this.procesarResponsables(alumno.id_alumno, responsables, prisma);
      }

      // 4. Registrar la actividad
      const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`;
      await this.actividadRegistroService.registrarCreacionAlumno(
        alumno.id_alumno,
        nombreCompleto,
      );

      // 4. Retornar alumno completo con relaciones
      try {
        // Pasar el cliente prisma de la transacción
        const alumnoCompleto = await this.findOne(alumno.id_alumno, prisma);
        console.log(
          'Alumno encontrado para retornar:',
          alumnoCompleto.id_alumno,
        );
        return alumnoCompleto;
      } catch (error) {
        console.error('Error al buscar el alumno creado:', error.message);

        // En caso de error, intentamos retornar el alumno básico sin relaciones
        const alumnoBasico = await prisma.alumno.findUnique({
          where: { id_alumno: alumno.id_alumno },
        });

        if (alumnoBasico) {
          console.log('Retornando alumno básico:', alumnoBasico.id_alumno);
          return alumnoBasico;
        }

        throw error;
      }
    });
  }

  /**
   * Obtiene todos los alumnos activos por defecto
   * @param incluirInactivos Si es true, incluye también los alumnos inactivos (soft deleted)
   */
  async findAll(incluirInactivos: boolean = false) {
    return this.prisma.alumno.findMany({
      where: incluirInactivos ? {} : { activo: true },
      include: {
        detalle: true,
        responsables: {
          include: {
            responsable: true,
            parentesco: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene un alumno por su ID (incluso si está inactivo)
   * @param id ID del alumno
   * @param prismaClient Cliente de Prisma opcional para usar en una transacción
   */
  async findOne(id: number, prismaClient?: any) {
    // Usamos el cliente prisma proporcionado o el global
    const prisma = prismaClient || this.prisma;

    const alumno = await prisma.alumno.findUnique({
      where: { id_alumno: id },
      include: {
        detalle: true,
        responsables: {
          include: {
            responsable: true,
            parentesco: true,
          },
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }

    return alumno;
  }

  /**
   * Actualiza un alumno y opcionalmente sus detalles y responsables
   */
  async update(id: number, updateAlumnoDto: UpdateAlumnoDto) {
    const { responsables, detalle, ...datosAlumno } = updateAlumnoDto;

    // Verificar que el alumno existe
    const alumnoExistente = await this.prisma.alumno.findUnique({
      where: { id_alumno: id },
    });

    if (!alumnoExistente) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }

    // Usamos una transacción para todas las actualizaciones
    return this.prisma.$transaction(async (prisma) => {
      // 1. Actualizar datos básicos del alumno
      if (Object.keys(datosAlumno).length > 0) {
        await prisma.alumno.update({
          where: { id_alumno: id },
          data: datosAlumno,
        });
      }

      // 2. Actualizar detalles si se proporcionan
      if (detalle) {
        await prisma.alumno_Detalle.upsert({
          where: { alumnoId: id },
          create: {
            alumnoId: id,
            ...detalle,
          },
          update: detalle,
        });
      }

      // 3. Procesar responsables si se proporcionan
      if (responsables && responsables.length > 0) {
        await this.procesarResponsables(id, responsables, prisma);
      }

      // 4. Retornar alumno actualizado con relaciones
      return this.findOne(id, prisma);
    });
  }

  /**
   * Realiza un soft delete de un alumno (cambia su estado a inactivo)
   */
  async remove(id: number) {
    try {
      return await this.prisma.alumno.update({
        where: { id_alumno: id },
        data: { activo: false },
      });
    } catch (error) {
      throw new NotFoundException(
        `Alumno con ID ${id} no encontrado o no se pudo desactivar`,
      );
    }
  }

  /**
   * Restaura un alumno inactivo (cambia su estado a activo)
   */
  async restore(id: number) {
    try {
      return await this.prisma.alumno.update({
        where: { id_alumno: id },
        data: { activo: true },
      });
    } catch (error) {
      throw new NotFoundException(
        `Alumno con ID ${id} no encontrado o no se pudo reactivar`,
      );
    }
  }

  /**
   * Agrega un nuevo responsable a un alumno
   */
  async agregarResponsable(
    alumnoId: number,
    responsableDto: CreateAlumnoResponsableDto,
  ) {
    // Verificar que el alumno existe
    await this.findOne(alumnoId);

    // Utilizar una transacción para garantizar consistencia
    return this.prisma.$transaction(async (prismaClient) => {
      // Procesar el nuevo responsable utilizando el cliente de prisma de la transacción
      const resultado = await this.procesarResponsables(
        alumnoId,
        [responsableDto],
        prismaClient,
      );
      return resultado[0];
    });
  }

  /**
   * Actualiza la relación entre un alumno y un responsable
   * @param alumnoId ID del alumno
   * @param alumnoResponsableId ID de la relación alumno-responsable
   * @param responsableDto Datos para actualizar
   */
  async actualizarResponsable(
    alumnoId: number,
    alumnoResponsableId: number,
    responsableDto: CreateAlumnoResponsableDto,
  ) {
    try {
      // Obtener primero la relación existente para verificar que existe y que pertenece al alumno correcto
      const alumnoResponsable = await this.prisma.alumnoResponsable.findFirst({
        where: {
          id: alumnoResponsableId,
          alumnoId: alumnoId,
        },
        include: { responsable: true },
      });

      if (!alumnoResponsable) {
        throw new NotFoundException(
          `Relación con ID ${alumnoResponsableId} no encontrada o no pertenece al alumno con ID ${alumnoId}`,
        );
      }

      // Utilizar una transacción para actualizar tanto la relación como los datos del responsable si es necesario
      return this.prisma.$transaction(async (prismaClient) => {
        // Actualizar datos del responsable si se proporcionan
        if (
          responsableDto.datosResponsable &&
          alumnoResponsable.responsableId
        ) {
          await prismaClient.responsable.update({
            where: { id_responsable: alumnoResponsable.responsableId },
            data: responsableDto.datosResponsable,
          });
        }

        // Actualizar la relación
        return await prismaClient.alumnoResponsable.update({
          where: { id: alumnoResponsableId },
          data: {
            parentescoId: responsableDto.parentescoId,
            parentescoLibre: responsableDto.parentescoLibre,
            esPrincipal: responsableDto.esPrincipal,
            firma: responsableDto.firma,
            permiteTraslado: responsableDto.permiteTraslado,
            puedeRetirarAlumno: responsableDto.puedeRetirarAlumno,
            contactoEmergencia: responsableDto.contactoEmergencia,
          },
          include: {
            responsable: true,
            parentesco: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Error al actualizar la relación alumno-responsable: ${error.message}`,
      );
    }
  }

  /**
   * Elimina la relación entre un alumno y un responsable
   * Si el responsable no tiene otras relaciones, lo elimina también
   * @param alumnoId ID del alumno
   * @param alumnoResponsableId ID de la relación alumno-responsable
   */
  async eliminarResponsable(alumnoId: number, alumnoResponsableId: number) {
    try {
      // Verificar que la relación pertenece al alumno especificado
      const relacion = await this.prisma.alumnoResponsable.findFirst({
        where: {
          id: alumnoResponsableId,
          alumnoId: alumnoId,
        },
        include: {
          responsable: true,
        },
      });

      if (!relacion) {
        throw new NotFoundException(
          `Relación con ID ${alumnoResponsableId} no pertenece al alumno con ID ${alumnoId}`,
        );
      }

      // Almacenamos el ID del responsable para verificar después
      const responsableId = relacion.responsableId;

      // Eliminamos la relación
      const relacionEliminada = await this.prisma.alumnoResponsable.delete({
        where: { id: alumnoResponsableId },
      });

      // Verificamos si el responsable tiene otras relaciones
      const otrasRelaciones = await this.prisma.alumnoResponsable.count({
        where: {
          responsableId: responsableId,
        },
      });

      // Si no tiene otras relaciones, eliminamos al responsable
      if (otrasRelaciones === 0) {
        await this.prisma.responsable.delete({
          where: { id_responsable: responsableId },
        });

        return {
          ...relacionEliminada,
          responsableEliminado: true,
          mensaje: `El responsable ${relacion.responsable.nombre} ${relacion.responsable.apellido} fue eliminado porque no tenía otras relaciones`,
        };
      }

      return {
        ...relacionEliminada,
        responsableEliminado: false,
        otrasRelaciones: otrasRelaciones,
        mensaje: `El responsable aún tiene ${otrasRelaciones} relación(es) con otros alumnos y se conserva en la base de datos`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Relación alumno-responsable con ID ${alumnoResponsableId} no encontrada`,
      );
    }
  }

  /**
   * Método privado para procesar responsables
   * Ahora recibe el cliente prisma de la transacción
   */
  private async procesarResponsables(
    alumnoId: number,
    responsables: CreateAlumnoResponsableDto[],
    prismaClient?: any,
  ) {
    const resultados: any[] = [];
    // Usamos el cliente de prisma pasado o el global
    const prisma = prismaClient || this.prisma;

    for (const resp of responsables) {
      let responsableId = resp.responsableId;

      // Si no se proporciona un ID de responsable, pero sí los datos
      if (!responsableId && resp.datosResponsable) {
        try {
          // Si tiene DUI, intentamos encontrar primero si ya existe un responsable con ese DUI
          if (resp.datosResponsable.dui) {
            const responsableExistente = await prisma.responsable.findUnique({
              where: { dui: resp.datosResponsable.dui },
            });

            if (responsableExistente) {
              // Si existe, usamos ese ID y actualizamos sus datos si es necesario
              responsableId = responsableExistente.id_responsable;
              // Opcionalmente, actualizar datos del responsable si es necesario
              // await prisma.responsable.update({
              //   where: { id_responsable: responsableId },
              //   data: resp.datosResponsable,
              // });
            }
          }

          // Si no encontramos un responsable existente, creamos uno nuevo
          if (!responsableId) {
            if (prismaClient) {
              const nuevoResponsable = await prisma.responsable.create({
                data: resp.datosResponsable,
              });
              responsableId = nuevoResponsable.id_responsable;
            } else {
              // Si no, usamos el servicio
              const nuevoResponsable = await this.responsablesService.create(
                resp.datosResponsable,
              );
              responsableId = nuevoResponsable.id_responsable;
            }
          }
        } catch (error) {
          // Si hay un error por DUI duplicado, intentamos buscar ese responsable
          if (
            error.code === 'P2002' &&
            error.meta?.target?.includes('dui') &&
            resp.datosResponsable.dui
          ) {
            const responsableExistente = await prisma.responsable.findUnique({
              where: { dui: resp.datosResponsable.dui },
            });

            if (responsableExistente) {
              responsableId = responsableExistente.id_responsable;
            } else {
              throw new BadRequestException(
                `Error al procesar el responsable: ${error.message}`,
              );
            }
          } else {
            throw new BadRequestException(
              `Error al procesar el responsable: ${error.message}`,
            );
          }
        }
      }

      // Verificar que tenemos un ID de responsable
      if (!responsableId) {
        throw new BadRequestException(
          'Debe proporcionar un ID de responsable existente o datos para crear uno nuevo',
        );
      }

      // Crear la relación entre alumno y responsable
      const alumnoResponsable = await prisma.alumnoResponsable.create({
        data: {
          alumnoId,
          responsableId,
          parentescoId: resp.parentescoId,
          parentescoLibre: resp.parentescoLibre,
          esPrincipal: resp.esPrincipal || false,
          firma: resp.firma || false,
          permiteTraslado: resp.permiteTraslado || false,
          puedeRetirarAlumno: resp.puedeRetirarAlumno || false,
          contactoEmergencia: resp.contactoEmergencia || false,
        },
        include: {
          responsable: true,
          parentesco: true,
        },
      });

      resultados.push(alumnoResponsable as any);
    }

    return resultados;
  }
}
