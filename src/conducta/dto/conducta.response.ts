import { ApiProperty } from '@nestjs/swagger';

export class ConductaResponse {
  @ApiProperty({ example: 1 })
  id_conducta: number;

  @ApiProperty({ example: 12 })
  id_alumno: number;

  @ApiProperty({ example: 7 })
  id_orientador: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la infracción del catálogo',
  })
  id_infraccion_catalogo: number;

  @ApiProperty({
    description: 'Infracción del catálogo',
    example: {
      id_infraccion: 1,
      articulo: '5.1.3',
      descripcion: 'Interrumpir la clase',
      puntos: 1.0,
      categoria: 'MENOS_GRAVE',
    },
  })
  infraccion: any;

  @ApiProperty({
    example: 'Interrumpió la clase varias veces',
    description: 'Observaciones específicas del incidente',
  })
  observacion: string;

  @ApiProperty({
    example: '2025-10-22T00:00:00.000Z',
    description: 'Fecha del incidente registrado',
  })
  fecha: Date;

  @ApiProperty({
    example: '2025',
    description: 'Año académico en que se registró la falta',
  })
  anio_academico: string | null;

  @ApiProperty({
    example: 1,
    description: 'Trimestre (1, 2 o 3)',
  })
  trimestre: number | null;

  @ApiProperty({
    description: 'Información del alumno involucrado',
    example: { id_alumno: 12, nombre: 'Manuel', apellido: 'López' },
  })
  alumno: any;

  @ApiProperty({
    description: 'Información del orientador que registró la falta',
    example: { id_orientador: 7, nombre: 'Ana', apellido: 'Martínez' },
  })
  orientador: any;
}
