import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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

  /** Convierte string 'DD/MM/YYYY' o ISO a Date (o null). */
  private toDate(val: any): Date | null {
    const s = this.toNullableString(val);
    if (!s) return null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('/');
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  /** boolean con más aliases: si, sí, x, true, 1 */
  private pickBool(r: any, snake: string, camel: string, def = false): boolean {
    const v = r[snake] ?? r[camel];
    return this.toBool(v, def);
  }

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

  /** Normaliza documentos (remueve guiones/espacios y mayúsculas). */
  private sanitizeDoc(val: string | null | undefined) {
    const s = this.toNullableString(val);
    return s ? s.replace(/[^\dA-Za-z]/g, '').toUpperCase() : null;
  }

  // ===== Importación de Matrícula =====

  async importMatricula(rows: any[]): Promise<ImportResult[]> {
    const results: ImportResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = this.normalizeRow(rows[i]);
      const nombre = this.toNullableString(r.nombre) ?? '';
      const apellido = this.toNullableString(r.apellido) ?? '';

      if (!nombre || !apellido) {
        results.push({
          nombre: (nombre + ' ' + apellido).trim() || `fila_${i + 1}`,
          status: 'ERROR',
          message: 'Faltan nombre y/o apellido',
          code: 'VALIDATION',
        });
        continue;
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          // -------- Campos Alumno base / matrícula --------
          const numeroMatricula = this.pickStr(
            r,
            'numero_matricula',
            'numeroMatricula',
          );
          const anioEscolar = this.pickStr(r, 'anio_escolar', 'anioEscolar');
          const estadoMatricula = this.pickStr(
            r,
            'estado_matricula',
            'estadoMatricula',
          );
          const fechaMatricula = this.toDate(
            r['fecha_matricula'] ?? r['fechaMatricula'],
          );

          const usaTransporteEscolar = this.pickBool(
            r,
            'usa_transporte_escolar',
            'usaTransporteEscolar',
            false,
          );
          const autorizaAtencionMedica = this.pickBool(
            r,
            'autoriza_atencion_medica',
            'autorizaAtencionMedica',
            false,
          );
          const autorizaUsoImagen = this.pickBool(
            r,
            'autoriza_uso_imagen',
            'autorizaUsoImagen',
            false,
          );
          const autorizaActividadesReligiosas = this.pickBool(
            r,
            'autoriza_actividades_religiosas',
            'autorizaActividadesReligiosas',
            false,
          );

          const repiteGrado = this.pickBool(
            r,
            'repite_grado',
            'repiteGrado',
            false,
          );
          const condicionado = this.pickBool(
            r,
            'condicionado',
            'condicionado',
            false,
          );

          const alumnoDataBase = {
            nombre,
            apellido,
            genero: this.pickStr(r, 'genero', 'genero'),
            fechaNacimiento: this.pickStr(
              r,
              'fecha_nacimiento',
              'fechaNacimiento',
            ), // string DD/MM/YYYY
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
            religion: this.pickStr(r, 'religion', 'religion'),
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
            activo: this.pickBool(r, 'activo', 'activo', true),

            // matrícula/flags
            anioEscolar: anioEscolar ?? undefined,
            numeroMatricula: numeroMatricula ?? undefined,
            estadoMatricula: estadoMatricula ?? undefined,
            fechaMatricula: fechaMatricula ?? undefined,
            usaTransporteEscolar,
            autorizaAtencionMedica,
            autorizaUsoImagen,
            autorizaActividadesReligiosas,
          } as any;

          // -------- upsert Responsable (en transacción) --------
          const upsertResponsableTx = async (payload: {
            nombre?: string;
            apellido?: string;
            dui?: string | null;
            numeroDocumento?: string | null;
            tipoDocumento?: string | null;
            naturalizado?: boolean | null;
            telefono?: string | null;
            telefonoFijo?: string | null;
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
          }) => {
            const numeroDocumento = this.sanitizeDoc(payload.numeroDocumento);
            const dui = this.sanitizeDoc(payload.dui);
            const email = this.toNullableString(payload.email);

            const commonData = {
              nombre: this.toNullableString(payload.nombre) ?? 'N/D',
              apellido: this.toNullableString(payload.apellido) ?? 'N/D',
              telefono: this.toNullableString(payload.telefono),
              telefonoFijo: this.toNullableString(payload.telefonoFijo),
              email,
              direccion: this.toNullableString(payload.direccion),
              lugarTrabajo: this.toNullableString(payload.lugarTrabajo),
              profesionOficio: this.toNullableString(payload.profesionOficio),
              ultimoGradoEstudiado: this.toNullableString(
                payload.ultimoGradoEstudiado,
              ),
              ocupacion: this.toNullableString(payload.ocupacion),
              religion: this.toNullableString(payload.religion),
              zonaResidencia: this.toNullableString(payload.zonaResidencia),
              estadoFamiliar: this.toNullableString(payload.estadoFamiliar),

              empresaTransporte: this.toNullableString(
                payload.empresaTransporte,
              ),
              placaVehiculo: this.toNullableString(payload.placaVehiculo),
              tipoVehiculo: this.toNullableString(payload.tipoVehiculo),

              tipoDocumento: this.toNullableString(payload.tipoDocumento),
              numeroDocumento,
              naturalizado: payload.naturalizado ?? null,
              dui,
            };

            // 1) numeroDocumento
            if (numeroDocumento) {
              const existing = await tx.responsable.findUnique({
                where: { numeroDocumento },
                select: { id_responsable: true },
              });
              if (existing) {
                return tx.responsable.update({
                  where: { numeroDocumento },
                  data: commonData,
                });
              }
            }
            // 2) DUI
            if (dui) {
              const existing = await tx.responsable.findUnique({
                where: { dui },
                select: { id_responsable: true },
              });
              if (existing) {
                return tx.responsable.update({
                  where: { dui },
                  data: commonData,
                });
              }
            }
            // 3) EMAIL
            if (email) {
              const existing = await tx.responsable.findUnique({
                where: { email },
                select: { id_responsable: true },
              });
              if (existing) {
                return tx.responsable.update({
                  where: { email },
                  data: commonData,
                });
              }
            }
            // 4) create con manejo de P2002
            try {
              return await tx.responsable.create({ data: commonData });
            } catch (e: any) {
              if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
              ) {
                if (numeroDocumento)
                  return tx.responsable.update({
                    where: { numeroDocumento },
                    data: commonData,
                  });
                if (dui)
                  return tx.responsable.update({
                    where: { dui },
                    data: commonData,
                  });
                if (email)
                  return tx.responsable.update({
                    where: { email },
                    data: commonData,
                  });
              }
              throw e;
            }
          };

          const responsable = await upsertResponsableTx({
            nombre: this.pickStr(r, 'r_nombre', 'rNombre') ?? undefined,
            apellido: this.pickStr(r, 'r_apellido', 'rApellido') ?? undefined,
            dui: this.pickStr(r, 'r_dui', 'rDui'),
            email: this.pickStr(r, 'r_email', 'rEmail'),
            telefono: this.pickStr(r, 'r_telefono', 'rTelefono'),
            telefonoFijo: this.pickStr(r, 'r_telefono_fijo', 'rTelefonoFijo'),
            tipoDocumento: this.pickStr(
              r,
              'r_tipo_documento',
              'rTipoDocumento',
            ),
            numeroDocumento: this.pickStr(
              r,
              'r_numero_documento',
              'rNumeroDocumento',
            ),
            naturalizado: this.pickBool(
              r,
              'r_naturalizado',
              'rNaturalizado',
              false,
            ),
            direccion: this.pickStr(r, 'r_direccion', 'rDireccion'),
          });

          // -------- UPSERT Alumno por numeroMatricula (si existe), si no: CREATE --------
          let alumnoId: number;
          if (numeroMatricula) {
            const existing = await tx.alumno.findUnique({
              where: { numeroMatricula },
              select: { id_alumno: true },
            });
            if (existing) {
              const updated = await tx.alumno.update({
                where: { numeroMatricula },
                data: alumnoDataBase,
                select: { id_alumno: true },
              });
              alumnoId = updated.id_alumno;
            } else {
              const created = await tx.alumno.create({
                data: alumnoDataBase,
                select: { id_alumno: true },
              });
              alumnoId = created.id_alumno;
            }
          } else {
            const created = await tx.alumno.create({
              data: alumnoDataBase,
              select: { id_alumno: true },
            });
            alumnoId = created.id_alumno;
          }

          // -------- Upsert Alumno_Detalle (sin tocar PK en update) --------
          const createDetalleData: Prisma.Alumno_DetalleUncheckedCreateInput = {
            alumnoId,
            viveCon: this.pickStr(r, 'vive_con', 'viveCon') ?? undefined,
            dependenciaEconomica:
              this.pickStr(
                r,
                'dependencia_economica',
                'dependenciaEconomica',
              ) ?? undefined,
            capacidadPago: this.pickBool(
              r,
              'capacidad_pago',
              'capacidadPago',
              false,
            ),
            tenenciaVivienda:
              this.pickStr(r, 'tenencia_vivienda', 'tenenciaVivienda') ??
              undefined,
            emergencia1Nombre:
              this.pickStr(r, 'emergencia1_nombre', 'emergencia1Nombre') ??
              undefined,
            emergencia1Parentesco:
              this.pickStr(
                r,
                'emergencia1_parentesco',
                'emergencia1Parentesco',
              ) ?? undefined,
            emergencia1Telefono:
              this.pickStr(r, 'emergencia1_telefono', 'emergencia1Telefono') ??
              undefined,
            emergencia2Nombre:
              this.pickStr(r, 'emergencia2_nombre', 'emergencia2Nombre') ??
              undefined,
            emergencia2Parentesco:
              this.pickStr(
                r,
                'emergencia2_parentesco',
                'emergencia2Parentesco',
              ) ?? undefined,
            emergencia2Telefono:
              this.pickStr(r, 'emergencia2_telefono', 'emergencia2Telefono') ??
              undefined,
          };

          const updateDetalleData: Prisma.Alumno_DetalleUncheckedUpdateInput = {
            viveCon: createDetalleData.viveCon,
            dependenciaEconomica: createDetalleData.dependenciaEconomica,
            capacidadPago: createDetalleData.capacidadPago,
            tenenciaVivienda: createDetalleData.tenenciaVivienda,
            emergencia1Nombre: createDetalleData.emergencia1Nombre,
            emergencia1Parentesco: createDetalleData.emergencia1Parentesco,
            emergencia1Telefono: createDetalleData.emergencia1Telefono,
            emergencia2Nombre: createDetalleData.emergencia2Nombre,
            emergencia2Parentesco: createDetalleData.emergencia2Parentesco,
            emergencia2Telefono: createDetalleData.emergencia2Telefono,
          };

          const hasAnyDetalle = Object.values(updateDetalleData).some(
            (v) => v != null,
          );
          if (hasAnyDetalle) {
            const existingDet = await tx.alumno_Detalle.findUnique({
              where: { alumnoId },
              select: { alumnoId: true },
            });
            if (existingDet) {
              await tx.alumno_Detalle.update({
                where: { alumnoId },
                data: updateDetalleData,
              });
            } else {
              await tx.alumno_Detalle.create({ data: createDetalleData });
            }
          }

          // -------- Relación AlumnoResponsable --------
          const parentescoNombre = this.pickStr(
            r,
            'r_parentesco',
            'rParentesco',
          );
          const parentesco = await tx.parentesco.findFirst({
            where: {
              nombre: { equals: parentescoNombre ?? '', mode: 'insensitive' },
            },
            select: { id_parentesco: true },
          });
          const parentescoId = parentesco?.id_parentesco ?? null;

          const relFlags = {
            esPrincipal: this.pickBool(r, 'es_principal', 'esPrincipal', true),
            firma: this.pickBool(r, 'firma', 'firma', false),
            permiteTraslado: this.pickBool(
              r,
              'permite_traslado',
              'permiteTraslado',
              false,
            ),
            puedeRetirarAlumno: this.pickBool(
              r,
              'puede_retirar',
              'puedeRetirarAlumno',
              false,
            ),
            contactoEmergencia: this.pickBool(
              r,
              'contacto_emergencia',
              'contactoEmergencia',
              false,
            ),
          };

          const relExist = await tx.alumnoResponsable.findFirst({
            where: {
              alumnoId,
              responsableId: responsable.id_responsable,
            },
            select: { id: true },
          });

          if (relExist) {
            await tx.alumnoResponsable.update({
              where: { id: relExist.id },
              data: {
                parentescoId: parentescoId,
                parentescoLibre: !parentescoId
                  ? (parentescoNombre ?? null)
                  : null,
                ...relFlags,
              },
            });
          } else {
            await tx.alumnoResponsable.create({
              data: {
                alumnoId,
                responsableId: responsable.id_responsable,
                parentescoId: parentescoId,
                parentescoLibre: !parentescoId
                  ? (parentescoNombre ?? null)
                  : null,
                ...relFlags,
              },
            });
          }

          // OK de la fila
          results.push({
            nombre: `${nombre} ${apellido}`,
            status: 'OK',
            id_alumno: alumnoId,
          });
        }); // fin transaction
      } catch (err: any) {
        results.push({
          nombre: `${nombre} ${apellido}`.trim(),
          status: 'ERROR',
          message: err?.message || 'Error al importar',
          code: 'DB',
        });
      }
    }

    return results;
  }

  // ===== Notas =====

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
