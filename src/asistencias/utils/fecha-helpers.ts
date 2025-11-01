/**
 * Calcula el trimestre basado en el mes de la fecha
 * Trimestre 1: Enero - Abril (1-4)
 * Trimestre 2: Mayo - Julio (5-7)
 * Trimestre 3: Agosto - Octubre (8-10)
 * Trimestre 4: Noviembre - Diciembre (11-12)
 */
export function calcularTrimestre(fecha: Date): number {
  const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11, sumamos 1

  if (mes >= 1 && mes <= 4) return 1;
  if (mes >= 5 && mes <= 7) return 2;
  if (mes >= 8 && mes <= 10) return 3;
  if (mes >= 11 && mes <= 12) return 4;

  // Por defecto (no debería llegar aquí)
  return 1;
}

/**
 * Obtiene el año académico de una fecha
 */
export function obtenerAnioAcademico(fecha: Date): string {
  return fecha.getFullYear().toString();
}
