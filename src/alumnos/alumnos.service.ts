import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Injectable()
export class AlumnosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crea (si faltan) y devuelve un mapa Parentesco.nombre -> id_parentesco */
  private async ensureParentescosByTipo(
    responsables: Array<{ tipo?: string }> = [],
  ): Promise<Record<string, number>> {
    const nombres = Array.from(
      new Set(
        (responsables ?? [])
          .map((r) => (typeof r.tipo === 'string' ? r.tipo.trim() : ''))
          .filter((n) => n.length > 0),
      ),
    );
    if (!nombres.length) return {};

    const existentes = await this.prisma.parentesco.findMany({
      where: { nombre: { in: nombres } },
      select: { id_parentesco: true, nombre: true },
    });
    const map: Record<string, number> = {};
    existentes.forEach((p) => (map[p.nombre] = p.id_parentesco));

    const faltantes = nombres.filter((n) => !(n in map));
    if (faltantes.length) {
      await this.prisma.parentesco.createMany({
        data: faltantes.map((nombre) => ({ nombre })),
        skipDuplicates: true,
      });
      const nuevos = await this.prisma.parentesco.findMany({
        where: { nombre: { in: faltantes } },
        select: { id_parentesco: true, nombre: true },
      });
      nuevos.forEach((p) => (map[p.nombre] = p.id_parentesco));
    }
    return map;
  }

  /** Transforma responsables del DTO a inputs de Prisma (create) con connect a Parentesco */
  private mapResponsablesForCreate(
    responsables:
      | CreateAlumnoDto['responsables']
      | UpdateAlumnoDto['responsables'],
    parentescoByNombre: Record<string, number>,
  ) {
    if (!responsables?.length) return [];
    return responsables.map((r, i) => {
      const tipo = r.tipo?.trim();
      const parentescoId = tipo ? parentescoByNombre[tipo] : undefined;
      if (!parentescoId) {
        throw new BadRequestException(
          `No se pudo resolver Parentesco para responsables[${i}].tipo='${r?.tipo}'`,
        );
      }
      return {
        nombre: r.nombre,
        apellido: r.apellido,
        dui: r.dui,
        telefono: r.telefono,
        email: r.email,
        tipo: r.tipo,
        fechaNacimiento: new Date(r.fechaNacimiento),
        departamentoNacimiento: r.departamentoNacimiento,
        municipioNacimiento: r.municipioNacimiento,
        estadoFamiliar: r.estadoFamiliar,
        zonaResidencia: r.zonaResidencia,
        direccion: r.direccion,
        profesion: r.profesion,
        ultimoGradoEstudiado: r.ultimoGradoEstudiado,
        ocupacion: r.ocupacion,
        religion: r.religion,
        firmaFoto: r.firmaFoto,
        parentesco: { connect: { id_parentesco: parentescoId } },
      };
    });
  }

  /** Crear alumno: ahora siempre entra como activo:true */
  async create(data: CreateAlumnoDto) {
    // regla: máximo 1 EncargadoTransporte
    if (
      (data.responsables ?? []).filter((r) => r.tipo === 'EncargadoTransporte')
        .length > 1
    ) {
      throw new BadRequestException(
        'Solo puede existir un EncargadoTransporte por alumno',
      );
    }

    const parentescoByNombre = await this.ensureParentescosByTipo(
      data.responsables || [],
    );
    const responsablesCreate = this.mapResponsablesForCreate(
      data.responsables,
      parentescoByNombre,
    );

    const alumnoDetalleCreate = data.alumnoDetalle
      ? {
          repiteGrado: data.alumnoDetalle.repiteGrado,
          condicionado: data.alumnoDetalle.condicionado,
          enfermedades: data.alumnoDetalle.enfermedades,
          medicamentoPrescrito: data.alumnoDetalle.medicamentoPrescrito,
          observaciones: data.alumnoDetalle.observaciones,
          capacidadPago: data.alumnoDetalle.capacidadPago ?? false,
          tieneHermanos: data.alumnoDetalle.tieneHermanos ?? false,
          detalleHermanos: data.alumnoDetalle.detalleHermanos,
          viveCon: data.alumnoDetalle.viveCon,
          dependenciaEconomica: data.alumnoDetalle.dependenciaEconomica,
          custodiaLegal: data.alumnoDetalle.custodiaLegal,
        }
      : undefined;

    return this.prisma.alumno.create({
      data: {
        photo: (data as any).photo ?? null,

        nombre: data.nombre,
        apellido: data.apellido,
        genero: data.genero,
        fechaNacimiento: new Date(data.fechaNacimiento),
        nacionalidad: data.nacionalidad,
        telefono: data.telefono,
        edad: data.edad ?? undefined,

        partidaNumero: data.partidaNumero,
        folio: data.folio,
        libro: data.libro,
        anioPartida: data.anioPartida,

        departamentoNacimiento: data.departamentoNacimiento,
        municipioNacimiento: data.municipioNacimiento,

        tipoSangre: data.tipoSangre,
        problemaFisico: data.problemaFisico,
        observacionesMedicas: data.observacionesMedicas,

        centroAsistencial: data.centroAsistencial,
        medicoNombre: data.medicoNombre,
        medicoTelefono: data.medicoTelefono,

        zonaResidencia: data.zonaResidencia,
        direccion: data.direccion,

        departamento: data.departamento,
        municipio: data.municipio,

        distanciaKM: data.distanciaKM,
        medioTransporte: data.medioTransporte,

        activo: true,

        firmaPadre: data.firmaPadre ?? undefined,
        firmaMadre: data.firmaMadre ?? undefined,
        firmaResponsable: data.firmaResponsable ?? undefined,

        alumnoDetalle: alumnoDetalleCreate
          ? { create: alumnoDetalleCreate }
          : undefined,
        responsables: responsablesCreate.length
          ? { create: responsablesCreate }
          : undefined,
      },
      include: {
        alumnoDetalle: true,
        responsables: true,
      },
    });
  }

  /** GET alumnos ACTIVOS */
  async findAllActive() {
    return this.prisma.alumno.findMany({
      where: { activo: true },
      include: { alumnoDetalle: true, responsables: true },
    });
  }

  /** GET alumnos INACTIVOS (desactivados) */
  async findAllInactive() {
    return this.prisma.alumno.findMany({
      where: { activo: false },
      include: { alumnoDetalle: true, responsables: true },
    });
  }

  async findOne(id: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: id },
      include: { alumnoDetalle: true, responsables: true },
    });
    if (!alumno)
      throw new NotFoundException(`Alumno con id ${id} no encontrado`);
    return alumno;
  }

  async update(id: number, data: UpdateAlumnoDto) {
    if (
      (data.responsables ?? []).filter((r) => r.tipo === 'EncargadoTransporte')
        .length > 1
    ) {
      throw new BadRequestException(
        'Solo puede existir un EncargadoTransporte por alumno',
      );
    }

    const parentescoByNombre = await this.ensureParentescosByTipo(
      data.responsables || [],
    );
    const responsablesCreate = this.mapResponsablesForCreate(
      data.responsables,
      parentescoByNombre,
    );

    const alumnoDetalleUpsert = data.alumnoDetalle
      ? {
          repiteGrado: data.alumnoDetalle.repiteGrado,
          condicionado: data.alumnoDetalle.condicionado,
          enfermedades: data.alumnoDetalle.enfermedades,
          medicamentoPrescrito: data.alumnoDetalle.medicamentoPrescrito,
          observaciones: data.alumnoDetalle.observaciones,
          capacidadPago: data.alumnoDetalle.capacidadPago ?? false,
          tieneHermanos: data.alumnoDetalle.tieneHermanos ?? false,
          detalleHermanos: data.alumnoDetalle.detalleHermanos,
          viveCon: data.alumnoDetalle.viveCon,
          dependenciaEconomica: data.alumnoDetalle.dependenciaEconomica,
          custodiaLegal: data.alumnoDetalle.custodiaLegal,
        }
      : undefined;

    return this.prisma.alumno.update({
      where: { id_alumno: id },
      data: {
        photo: (data as any).photo ?? undefined,

        nombre: data.nombre ?? undefined,
        apellido: data.apellido ?? undefined,
        genero: data.genero ?? undefined,
        fechaNacimiento: data.fechaNacimiento
          ? new Date(data.fechaNacimiento)
          : undefined,
        nacionalidad: data.nacionalidad ?? undefined,
        telefono: data.telefono ?? undefined,
        edad: data.edad ?? undefined,

        partidaNumero: data.partidaNumero ?? undefined,
        folio: data.folio ?? undefined,
        libro: data.libro ?? undefined,
        anioPartida: data.anioPartida ?? undefined,

        departamentoNacimiento: data.departamentoNacimiento ?? undefined,
        municipioNacimiento: data.municipioNacimiento ?? undefined,

        tipoSangre: data.tipoSangre ?? undefined,
        problemaFisico: data.problemaFisico ?? undefined,
        observacionesMedicas: data.observacionesMedicas ?? undefined,

        centroAsistencial: data.centroAsistencial ?? undefined,
        medicoNombre: data.medicoNombre ?? undefined,
        medicoTelefono: data.medicoTelefono ?? undefined,

        zonaResidencia: data.zonaResidencia ?? undefined,
        direccion: data.direccion ?? undefined,

        departamento: data.departamento ?? undefined,
        municipio: data.municipio ?? undefined,

        distanciaKM: data.distanciaKM ?? undefined,
        medioTransporte: data.medioTransporte ?? undefined,

        activo: (data as any).activo ?? undefined,

        firmaPadre: data.firmaPadre ?? undefined,
        firmaMadre: data.firmaMadre ?? undefined,
        firmaResponsable: data.firmaResponsable ?? undefined,

        alumnoDetalle: alumnoDetalleUpsert
          ? {
              upsert: {
                create: alumnoDetalleUpsert,
                update: alumnoDetalleUpsert,
              },
            }
          : undefined,

        responsables: responsablesCreate.length
          ? { deleteMany: {}, create: responsablesCreate }
          : undefined,
      },
      include: {
        alumnoDetalle: true,
        responsables: true,
      },
    });
  }

  /** Soft-delete: cambia activo=false en vez de borrar */
  async remove(id: number) {
    const exists = await this.prisma.alumno.findUnique({
      where: { id_alumno: id },
      select: { id_alumno: true, activo: true },
    });
    if (!exists)
      throw new NotFoundException(`Alumno con id ${id} no encontrado`);

    if (exists.activo === false) {
      return this.prisma.alumno.findUnique({
        where: { id_alumno: id },
        include: { alumnoDetalle: true, responsables: true },
      });
    }

    return this.prisma.alumno.update({
      where: { id_alumno: id },
      data: { activo: false },
      include: { alumnoDetalle: true, responsables: true },
    });
  }

  /** Activar (soft-restore): cambia activo=true */
  async activate(id: number) {
    const exists = await this.prisma.alumno.findUnique({
      where: { id_alumno: id },
      select: { id_alumno: true, activo: true },
    });
    if (!exists) {
      throw new NotFoundException(`Alumno con id ${id} no encontrado`);
    }

    if (exists.activo === true) {
      // Ya está activo: retorna el registro completo
      return this.prisma.alumno.findUnique({
        where: { id_alumno: id },
        include: { alumnoDetalle: true, responsables: true },
      });
    }

    return this.prisma.alumno.update({
      where: { id_alumno: id },
      data: { activo: true },
      include: { alumnoDetalle: true, responsables: true },
    });
  }
}
