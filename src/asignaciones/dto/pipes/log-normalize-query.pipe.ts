import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

function norm(v: any) {
  if (v === '') return undefined;
  if (v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

function deepNormalize(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepNormalize(v);
    } else if (Array.isArray(v)) {
      out[k] = v.map(norm);
    } else {
      out[k] = norm(v);
    }
  }
  return out;
}

@Injectable()
export class LogNormalizeQueryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Loguea lo que llega crudo del framework
    // (aparecerá SIEMPRE aunque falle luego la validación)
    // eslint-disable-next-line no-console
    console.log('[GET /asignaciones/historial] raw query =>', value);

    const normalized = deepNormalize(value);

    // eslint-disable-next-line no-console
    console.log(
      '[GET /asignaciones/historial] normalized query =>',
      normalized,
    );

    // Convierte explícitamente a number los que deben serlo si existen
    const n = normalized;
    const toNum = (x: any) => (x === undefined || x === null ? x : Number(x));

    if (n.id_curso !== undefined) n.id_curso = toNum(n.id_curso);
    if (n.id_orientador !== undefined) n.id_orientador = toNum(n.id_orientador);
    if (n.id_asignatura !== undefined && n.id_asignatura !== null) {
      n.id_asignatura = toNum(n.id_asignatura);
    }

    if (n.page !== undefined) n.page = toNum(n.page);
    if (n.limit !== undefined) n.limit = toNum(n.limit);

    // eslint-disable-next-line no-console
    console.log('[GET /asignaciones/historial] final query =>', n);

    return n;
  }
}
