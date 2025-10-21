import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ImportResult {
  nombre: string;
  status: 'OK' | 'ERROR' | 'WARNING';
  message?: string;
  id_alumno?: number;
  inserted?: number;
  code?: string;
}

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================
  // =================== Helpers de Excel ======================
  // ==========================================================

  private toStr(v: any) {
    return (v === null || v === undefined ? '' : String(v)).trim();
  }

  /** snake_case básico y sin tildes */
  private normKeyToSnake(k: string): string {
    return this.toStr(k)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /** Convierte a Date soportando:
   *  - Date (objeto JS)
   *  - Serial Excel (número desde 1899-12-30)
   *  - 'DD/MM/YYYY' o 'DD-MM-YYYY'
   *  - Cadenas tipo "Wed Aug 05 2015 00:00:00 GMT-0700 (PDT)"
   *  - ISO / parseo nativo
   */
  private toDateExcelFlexible(val: any): Date | null {
    if (val === undefined || val === null || val === '') return null;

    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

    if (typeof val === 'number' && Number.isFinite(val)) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      const ms = excelEpoch + Math.round(val * 86400000);
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }

    const s = this.toStr(val);
    if (!s) return null;

    if (/GMT|UTC/.test(s)) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }

    const m = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(s);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }

    const d2 = new Date(s);
    return isNaN(d2.getTime()) ? null : d2;
  }

  private nullIfExcelError(v: any) {
    const s = this.toStr(v);
    if (!s) return null;
    if (s.startsWith('#')) return null; // #ERROR!, #VALUE!, etc.
    return v;
  }

  private safeJsonOrNull(v: any) {
    const raw = this.nullIfExcelError(v);
    if (raw == null) return null;
    const s = this.toStr(raw);
    if (!s) return null;
    if (!/^[\[\{]/.test(s)) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  /** Lee y normaliza la hoja "Alumnos" (o cae a la tercera si no existe el nombre) */
  private readAlumnosSheet(buffer: Buffer): Array<Record<string, any>> {
    const wb = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    const sheetName =
      wb.SheetNames.find((n) => n.trim().toLowerCase() === 'alumnos') ||
      wb.SheetNames[2];

    if (!sheetName) {
      throw new BadRequestException(
        'No se encontró la hoja "Alumnos" ni existe una tercera hoja en el archivo.',
      );
    }
    const ws = wb.Sheets[sheetName];

    // Leemos en crudo
    const raw = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
      defval: null,
      raw: true,
    });

    // Normalizamos keys a snake_case y limpiamos formatos especiales
    const rows = raw.map((row) => {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        out[this.normKeyToSnake(k)] = v;
      }

      if ('fecha_matricula' in out) {
        out['fecha_matricula'] = this.toDateExcelFlexible(
          out['fecha_matricula'],
        );
      }
      if ('fecha_nacimiento' in out) {
        out['fecha_nacimiento'] = this.toStr(out['fecha_nacimiento']); // tu modelo guarda string (DD/MM/YYYY)
      }
      if ('hermanos_en_colegio' in out) {
        out['hermanos_en_colegio'] = this.safeJsonOrNull(
          out['hermanos_en_colegio'],
        );
      }

      // Trim strings
      Object.keys(out).forEach((k) => {
        if (typeof out[k] === 'string') out[k] = out[k].trim();
      });

      return out;
    });

    return rows;
  }

  /** Reduce a las columnas que tu import realmente usa */
  private shapeRowsForImport(rows: Array<Record<string, any>>) {
    const KEEP = new Set([
      // alumno base / matrícula
      'numero_matricula',
      'anio_escolar',
      'estado_matricula',
      'fecha_matricula',
      'nombre',
      'apellido',
      'genero',
      'fecha_nacimiento',
      'nacionalidad',
      'edad',
      'partida_numero',
      'folio',
      'libro',
      'anio_partida',
      'departamento_nacimiento',
      'municipio_nacimiento',
      'tipo_sangre',
      'problema_fisico',
      'observaciones_medicas',
      'centro_asistencial',
      'medico_nombre',
      'medico_telefono',
      'religion',
      'zona_residencia',
      'direccion',
      'municipio',
      'departamento',
      'distancia_km',
      'medio_transporte',
      'encargado_transporte',
      'encargado_telefono',
      'repite_grado',
      'condicionado',
      'activo',
      'usa_transporte_escolar',
      'autoriza_atencion_medica',
      'autoriza_uso_imagen',
      'autoriza_actividades_religiosas',
      // detalle:
      'vive_con',
      'dependencia_economica',
      'capacidad_pago',
      'tenencia_vivienda',
      'emergencia1_nombre',
      'emergencia1_parentesco',
      'emergencia1_telefono',
      'emergencia2_nombre',
      'emergencia2_parentesco',
      'emergencia2_telefono',
      'tiene_hermanos_en_colegio',
      'hermanos_en_colegio',
      // responsable principal:
      'r_apellido',
      'r_nombre',
      'r_dui',
      'r_email',
      'r_telefono',
      'r_telefono_fijo',
      'r_parentesco',
      'r_tipo_documento',
      'r_numero_documento',
      'r_naturalizado',
      // flags relación
      'es_principal',
      'firma',
      'permite_traslado',
      'puede_retirar',
      'contacto_emergencia',
    ]);
    return rows.map((r) => {
      const o: Record<string, any> = {};
      for (const [k, v] of Object.entries(r)) if (KEEP.has(k)) o[k] = v;
      return o;
    });
  }

  // ==========================================================
  // ================== Helpers de Import BD ==================
  // ==========================================================

  private toNullableString(val: any): string | null {
    if (val === undefined || val === null) return null;
    if (typeof val === 'boolean') return null;
    const s = String(val).trim();
    return s.length ? s : null;
  }

  private toBool(val: any, defaultValue = false): boolean {
    if (val === undefined || val === null || val === '') return defaultValue;
    let s = String(val).trim().toLowerCase();
    s = s.normalize('NFD').replace(/\p{M}+/gu, '');
    const trueSet = new Set([
      'true',
      '1',
      'si',
      'x',
      'verdadero',
      'v',
      'yes',
      'y',
      'sí',
    ]);
    const falseSet = new Set(['false', '0', 'no', 'falso', 'f', 'not', 'n']);
    if (trueSet.has(s)) return true;
    if (falseSet.has(s)) return false;
    return defaultValue;
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

  private normalizeRow<T extends Record<string, any>>(row: T): T {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      const key = k?.toString().trim().toLowerCase().replace(/\s+/g, '_');
      out[key] = typeof v === 'string' ? v.trim() : v;
    }
    return out as T;
  }

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
  private pickBool(r: any, snake: string, camel: string, def = false): boolean {
    const v = r[snake] ?? r[camel];
    return this.toBool(v, def);
  }

  private toJson(val: any): any | null {
    const s = this.toNullableString(val);
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  private sanitizeDoc(val: string | null | undefined) {
    const s = this.toNullableString(val);
    return s ? s.replace(/[^\dA-Za-z-]/g, '').toUpperCase() : null;
  }

  // ==========================================================
  // ================ Importación: Matrícula ==================
  // ==========================================================

  /** Punto de entrada para archivo Excel de Matrícula */
  async importMatriculaDesdeExcel(buffer: Buffer) {
    const rowsRaw = this.readAlumnosSheet(buffer);
    const rows = this.shapeRowsForImport(rowsRaw);
    if (!rows.length) {
      throw new BadRequestException('La hoja "Alumnos" no tiene registros.');
    }
    return this.importMatricula(rows);
  }

  /** Importa a BD según tu schema.prisma */
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

          const fechaMatricula =
            (r['fecha_matricula'] instanceof Date
              ? (r['fecha_matricula'] as Date)
              : this.toDateExcelFlexible(r['fecha_matricula'])) || null;

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

            // extras opcionales
            religion: this.pickStr(r, 'r_religion', 'rReligion'),
            zonaResidencia: this.pickStr(
              r,
              'r_zona_residencia',
              'rZonaResidencia',
            ),
            estadoFamiliar: this.pickStr(
              r,
              'r_estado_familiar',
              'rEstadoFamiliar',
            ),
            empresaTransporte: this.pickStr(
              r,
              'r_empresa_transporte',
              'rEmpresaTransporte',
            ),
            placaVehiculo: this.pickStr(
              r,
              'r_placa_vehiculo',
              'rPlacaVehiculo',
            ),
            tipoVehiculo: this.pickStr(r, 'r_tipo_vehiculo', 'rTipoVehiculo'),
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

          // -------- Upsert Alumno_Detalle --------
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

            tieneHermanosEnColegio: this.pickBool(
              r,
              'tiene_hermanos_en_colegio',
              'tieneHermanosEnColegio',
              false,
            ),
            hermanosEnColegio:
              this.toJson(r['hermanos_en_colegio'] ?? r['hermanosEnColegio']) ??
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
            tieneHermanosEnColegio: createDetalleData.tieneHermanosEnColegio,
            hermanosEnColegio: createDetalleData.hermanosEnColegio,
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
            where: { alumnoId, responsableId: responsable.id_responsable },
            select: { id: true },
          });

          if (relExist) {
            await tx.alumnoResponsable.update({
              where: { id: relExist.id },
              data: {
                parentescoId,
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
                parentescoId,
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
        });
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
}
