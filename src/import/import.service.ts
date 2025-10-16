import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface ImportResult {
  nombre: string;
  status: 'OK' | 'ERROR' | 'WARNING';
  message?: string;
  id_alumno?: number;
  inserted?: number;
  code?: string;
}

export interface ImportContext {
  idAsignatura: number;
  trimestre: string; // 'I' | 'II' | 'III' | etc.
}

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== Helpers =====

  /** Normaliza headers/keys (lower, trim, espacios -> _) */
  private normalizeRow<T extends Record<string, any>>(row: T): T {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      const key = k?.toString().trim().toLowerCase().replace(/\s+/g, '_');
      out[key] = typeof v === 'string' ? v.trim() : v;
    }
    return out as T;
  }

  /** Convierte cualquier valor a string|null (evita booleans en campos de texto). */
  private toNullableString(val: any): string | null {
    if (val === undefined || val === null) return null;
    if (typeof val === 'boolean') return null; // Excel puede mandar TRUE/FALSE
    const s = String(val).trim();
    return s.length ? s : null;
  }

  /** Convierte a boolean (true si coincide con true/1/si/sí/x). */
  private toBool(val: any, defaultValue = false): boolean {
    if (val === undefined || val === null || val === '') return defaultValue;
    const s = String(val).toLowerCase();
    return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'x';
  }

  private toInt(val: any): number | null {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  private toFloat(val: any): number | null {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  /** Lee primero snake_case, si no existe intenta camelCase. */
  private pickStr(r: any, snake: string, camel: string): string | null {
    const v = r[snake] ?? r[camel];
    return this.toNullableString(v);
  }
  private pickInt(r: any, snake: string, camel: string): number | null {
    const v = r[snake] ?? r[camel];
    return this.toInt(v);
  }
  private pickFloat(r: any, snake: string, camel: string): number | null {
    const v = r[snake] ?? r[camel];
    return this.toFloat(v);
  }

  /** Buscar id_parentesco por nombre (case-insensitive). Devuelve null si no existe. */
  private async resolveParentescoId(
    nombre?: string | null,
  ): Promise<number | null> {
    const s = this.toNullableString(nombre);
    if (!s) return null;
    const item = await this.prisma.parentesco.findFirst({
      where: { nombre: { equals: s, mode: 'insensitive' } },
      select: { id_parentesco: true },
    });
    return item?.id_parentesco ?? null;
  }

  /**
   * Upsert de Responsable:
   * 1) Si trae DUI (unique) -> update por DUI si existe; si no, create.
   * 2) Si NO trae DUI pero trae EMAIL (unique) -> update por email si existe; si no, create.
   * 3) Si al crear revienta por P2002 (email duplicado) -> fallback a update por email.
   */
  private async upsertResponsableByDui(payload: {
    nombre?: string;
    apellido?: string;
    dui?: string | null;
    telefono?: string | null;
    email?: string | null;
    direccion?: string | null;
    lugarTrabajo?: string | null;
    profesionOficio?: string | null;
    ultimoGradoEstudiado?: string | null;
    ocupacion?: string | null;
    religion?: string | null;
    zonaResidencia?: string | null;
    estadoFamiliar?: string | null;
    empresaTransporte?: string | null;
    placaVehiculo?: string | null;
    tipoVehiculo?: string | null;
  }) {
    const dui = this.toNullableString(payload.dui);
    const email = this.toNullableString(payload.email);

    const commonData = {
      nombre: this.toNullableString(payload.nombre) ?? 'N/D',
      apellido: this.toNullableString(payload.apellido) ?? 'N/D',
      telefono: this.toNullableString(payload.telefono),
      email, // puede ser null
      direccion: this.toNullableString(payload.direccion),
      lugarTrabajo: this.toNullableString(payload.lugarTrabajo),
      profesionOficio: this.toNullableString(payload.profesionOficio),
      ultimoGradoEstudiado: this.toNullableString(payload.ultimoGradoEstudiado),
      ocupacion: this.toNullableString(payload.ocupacion),
      religion: this.toNullableString(payload.religion),
      zonaResidencia: this.toNullableString(payload.zonaResidencia),
      estadoFamiliar: this.toNullableString(payload.estadoFamiliar),
      empresaTransporte: this.toNullableString(payload.empresaTransporte),
      placaVehiculo: this.toNullableString(payload.placaVehiculo),
      tipoVehiculo: this.toNullableString(payload.tipoVehiculo),
    };

    // 1) DUI
    if (dui) {
      const existingByDui = await this.prisma.responsable.findUnique({
        where: { dui },
        select: { id_responsable: true },
      });
      if (existingByDui) {
        return this.prisma.responsable.update({
          where: { dui },
          data: { ...commonData },
        });
      }
    }

    // 2) EMAIL (si no hay DUI o no existe ese DUI)
    if (!dui && email) {
      const existingByEmail = await this.prisma.responsable.findUnique({
        where: { email },
        select: { id_responsable: true },
      });
      if (existingByEmail) {
        return this.prisma.responsable.update({
          where: { email },
          data: { ...commonData, dui }, // si ahora viene DUI, se guarda
        });
      }
    }

    // 3) Create con manejo de P2002 (email duplicado)
    try {
      return await this.prisma.responsable.create({
        data: { ...commonData, dui },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        // Unique constraint: intenta update por email si lo tenemos
        if (email) {
          return this.prisma.responsable.update({
            where: { email },
            data: { ...commonData, dui },
          });
        }
      }
      throw e;
    }
  }

  /**
   * Importa matrícula (Alumno + Responsable + relación).
   * Mapea TODOS los campos de Alumno conforme a tu schema camelCase.
   */
  async importMatricula(rows: any[]): Promise<ImportResult[]> {
    const results: ImportResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const r = this.normalizeRow(raw);

      const nombre = this.toNullableString(r.nombre) ?? '';
      const apellido = this.toNullableString(r.apellido) ?? '';

      if (!nombre || !apellido) {
        results.push({
          nombre: `${nombre} ${apellido}`.trim() || `fila_${i + 1}`,
          status: 'ERROR',
          message: 'Faltan nombre y/o apellido',
          code: 'VALIDATION',
        });
        continue;
      }

      try {
        const repiteGrado = this.toBool(r.repite_grado ?? r.repiteGrado, false);
        const condicionado = this.toBool(r.condicionado, false);

        // Responsable (upsert por DUI / email)
        const responsable = await this.upsertResponsableByDui({
          nombre: this.pickStr(r, 'r_nombre', 'rNombre') ?? undefined,
          apellido: this.pickStr(r, 'r_apellido', 'rApellido') ?? undefined,
          dui: this.pickStr(r, 'r_dui', 'rDui'),
          telefono: this.pickStr(r, 'r_telefono', 'rTelefono'),
          email: this.pickStr(r, 'r_email', 'rEmail'),
          direccion: this.pickStr(r, 'r_direccion', 'rDireccion'),
        });

        // Alumno (fechaNacimiento es STRING en tu schema)
        const fechaNacimientoStr = this.pickStr(
          r,
          'fecha_nacimiento',
          'fechaNacimiento',
        );

        const alumno = await this.prisma.alumno.create({
          data: {
            nombre,
            apellido,
            genero: this.pickStr(r, 'genero', 'genero'),
            fechaNacimiento: fechaNacimientoStr,
            nacionalidad: this.pickStr(r, 'nacionalidad', 'nacionalidad'),
            edad: this.pickInt(r, 'edad', 'edad'),
            partidaNumero: this.pickStr(r, 'partida_numero', 'partidaNumero'),
            folio: this.pickStr(r, 'folio', 'folio'),
            libro: this.pickStr(r, 'libro', 'libro'),
            anioPartida: this.pickStr(r, 'anio_partida', 'anioPartida'),
            departamentoNacimiento: this.pickStr(
              r,
              'departamento_nacimiento',
              'departamentoNacimiento',
            ),
            municipioNacimiento: this.pickStr(
              r,
              'municipio_nacimiento',
              'municipioNacimiento',
            ),
            tipoSangre: this.pickStr(r, 'tipo_sangre', 'tipoSangre'),
            problemaFisico: this.pickStr(
              r,
              'problema_fisico',
              'problemaFisico',
            ),
            observacionesMedicas: this.pickStr(
              r,
              'observaciones_medicas',
              'observacionesMedicas',
            ),
            centroAsistencial: this.pickStr(
              r,
              'centro_asistencial',
              'centroAsistencial',
            ),
            medicoNombre: this.pickStr(r, 'medico_nombre', 'medicoNombre'),
            medicoTelefono: this.pickStr(
              r,
              'medico_telefono',
              'medicoTelefono',
            ),
            zonaResidencia: this.pickStr(
              r,
              'zona_residencia',
              'zonaResidencia',
            ),
            direccion: this.pickStr(r, 'direccion', 'direccion'),
            municipio: this.pickStr(r, 'municipio', 'municipio'),
            departamento: this.pickStr(r, 'departamento', 'departamento'),
            distanciaKM: this.pickFloat(r, 'distancia_km', 'distanciaKM'),
            medioTransporte: this.pickStr(
              r,
              'medio_transporte',
              'medioTransporte',
            ),
            encargadoTransporte: this.pickStr(
              r,
              'encargado_transporte',
              'encargadoTransporte',
            ),
            encargadoTelefono: this.pickStr(
              r,
              'encargado_telefono',
              'encargadoTelefono',
            ),
            repiteGrado,
            condicionado,
            activo: this.toBool(r.activo, true),
          },
          select: { id_alumno: true, nombre: true, apellido: true },
        });

        // Parentesco (catálogo o libre) con coerción segura
        const parentescoId = await this.resolveParentescoId(
          this.pickStr(r, 'r_parentesco', 'rParentesco'),
        );

        let parentescoLibre: string | null = null;
        if (!parentescoId) {
          const rParStr = this.pickStr(r, 'r_parentesco', 'rParentesco');
          if (rParStr) parentescoLibre = rParStr;
        }
        const libreCol = this.pickStr(r, 'parentesco_libre', 'parentescoLibre');
        if (libreCol) parentescoLibre = libreCol;

        // Flags relación
        const esPrincipal = this.toBool(r.es_principal, true);
        const contactoEmergencia = this.toBool(r.contacto_emergencia, false);
        const permiteTraslado = this.toBool(r.permite_traslado, false);
        const puedeRetirarAlumno = this.toBool(r.puede_retirar, false);
        const firma = this.toBool(r.firma, false);

        await this.prisma.alumnoResponsable.create({
          data: {
            alumnoId: alumno.id_alumno,
            responsableId: responsable.id_responsable,
            parentescoId: parentescoId ?? null,
            parentescoLibre, // string|null (nunca boolean)
            esPrincipal,
            firma,
            permiteTraslado,
            puedeRetirarAlumno,
            contactoEmergencia,
          },
        });

        results.push({
          nombre: `${alumno.nombre} ${alumno.apellido}`,
          status: 'OK',
          id_alumno: alumno.id_alumno,
        });
      } catch (err: any) {
        results.push({
          nombre: `${nombre} ${apellido}`.trim(),
          status: 'ERROR',
          message: err?.message || 'Error al insertar',
          code: 'DB',
        });
      }
    }

    return results;
  }

  // ===== Notas (sin cambios funcionales relevantes) =====

  async importNotas(
    rows: any[],
    context: ImportContext,
  ): Promise<ImportResult[]> {
    const results: ImportResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const r = this.normalizeRow(raw);

      let alumnoId: number | null = null;
      if (r.id_alumno) alumnoId = Number(r.id_alumno);

      if (!alumnoId || !Number.isFinite(alumnoId)) {
        results.push({
          nombre: r.nombre || `fila_${i + 1}`,
          status: 'ERROR',
          message: 'id_alumno requerido o inválido',
          code: 'VALIDATION',
        });
        continue;
      }

      const idActividad =
        r.id_actividad != null && r.id_actividad !== ''
          ? Number(r.id_actividad)
          : null;

      const calificacion =
        r.calificacion != null && r.calificacion !== ''
          ? Number(r.calificacion)
          : null;

      // fecha_registro opcional
      let fechaRegistro: Date | null = null;
      const frStr = this.toNullableString(r.fecha_registro);
      if (frStr) {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(frStr)) {
          const [dd, mm, yyyy] = frStr.split('/');
          fechaRegistro = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        } else {
          const d = new Date(frStr);
          if (!isNaN(d.getTime())) fechaRegistro = d;
        }
      }

      try {
        // Emular upsert
        const existente = await this.prisma.notas.findFirst({
          where: {
            id_alumno: alumnoId,
            id_asignatura: context.idAsignatura,
            trimestre: context.trimestre,
            ...(idActividad !== null
              ? { id_actividad: idActividad }
              : { id_actividad: null }),
          },
          select: { id_nota: true },
        });

        if (existente) {
          await this.prisma.notas.update({
            where: { id_nota: existente.id_nota },
            data: {
              calificacion: calificacion ?? undefined,
              fecha_registro: fechaRegistro ?? undefined,
            },
          });
        } else {
          await this.prisma.notas.create({
            data: {
              id_alumno: alumnoId,
              id_asignatura: context.idAsignatura,
              trimestre: context.trimestre,
              id_actividad: idActividad,
              calificacion,
              fecha_registro: fechaRegistro ?? new Date(),
            },
          });
        }

        results.push({
          nombre: r.nombre || `alumno_${alumnoId}`,
          status: 'OK',
          id_alumno: alumnoId,
        });
      } catch (err: any) {
        results.push({
          nombre: r.nombre || `alumno_${alumnoId}`,
          status: 'ERROR',
          message: err?.message || 'Error al insertar/actualizar nota',
          code: 'DB',
        });
      }
    }

    return results;
  }
}
