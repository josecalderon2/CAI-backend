import { ApiProperty } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';

export class AsistenciaResponse {
  @ApiProperty({ example: 1 })
  id_asistencia: number;

  @ApiProperty({ example: 12 })
  id_alumno: number;

  @ApiProperty({ example: 4 })
  id_asignatura: number;

  @ApiProperty({ example: 7 })
  id_orientador: number;

  @ApiProperty({
    example: '2025-10-22T00:00:00.000Z',
    description: 'Fecha del registro de asistencia',
  })
  fecha: Date;

  @ApiProperty({
    enum: EstadoAsistencia,
    example: 'P',
    description: 'Estado de asistencia (P, E, SP o A)',
  })
  estado: EstadoAsistencia;

  @ApiProperty({
    example: 'Llegó puntual y con uniforme completo',
    required: false,
  })
  observacion: string | null;

  @ApiProperty({
    example: '2025-10-22T12:00:00.000Z',
    description: 'Fecha y hora en que se creó el registro',
  })
  creadoEn: Date;

  @ApiProperty({
    example: '2025',
    description: 'Año académico del registro',
  })
  anio_academico: string | null;

  @ApiProperty({
    example: 1,
    description: 'Trimestre (1, 2 o 3)',
  })
  trimestre: number | null;

  @ApiProperty({
    description: 'Información básica del alumno',
    example: { id_alumno: 12, nombre: 'Manuel', apellido: 'López' },
  })
  alumno: any;

  @ApiProperty({
    description: 'Información de la asignatura',
    example: { id_asignatura: 4, nombre: 'Matemática' },
  })
  asignatura: any;

  @ApiProperty({
    description: 'Información del orientador (docente)',
    example: { id_orientador: 7, nombre: 'Ana', apellido: 'Martínez' },
  })
  orientador: any;
}

// Clase para respuestas de consolidado mensual o trimestral
export class AsistenciaConsolidadoResponse {
  @ApiProperty({ example: 1 })
  id_alumno: number;

  @ApiProperty({
    example: { id_alumno: 1, nombre: 'Kendel', apellido: 'Arevalo' },
    description: 'Datos del alumno',
  })
  alumno: any;

  @ApiProperty({ example: 80, description: 'Cantidad de asistencias (P + E)' })
  presentes: number;

  @ApiProperty({ example: 2, description: 'Cantidad de ausencias sin permiso (SP)' })
  sin_permiso: number;

  @ApiProperty({ example: 1, description: 'Faltas menos graves registradas' })
  menos_graves: number;

  @ApiProperty({ example: 0, description: 'Faltas graves registradas' })
  graves: number;

  @ApiProperty({ example: 0, description: 'Faltas muy graves registradas' })
  muy_graves: number;

  @ApiProperty({
    example: 9.6,
    description: 'Nota final de conducta (escala 0 a 10)',
  })
  nota_conducta: number;
}
