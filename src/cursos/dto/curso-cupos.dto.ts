import { ApiProperty } from '@nestjs/swagger';

export class CursoCuposDto {
  @ApiProperty({ example: 1 })
  id_curso: number;

  @ApiProperty({ example: '3A' })
  nombre: string;

  @ApiProperty({ example: 'Sección A' })
  seccion?: string;

  @ApiProperty({ example: 'Descripción del curso' })
  descripcion?: string;

  @ApiProperty({ example: 30, description: 'Capacidad total del curso' })
  cupoTotal: number;

  @ApiProperty({ example: 25, description: 'Número de alumnos inscritos' })
  cuposOcupados: number;

  @ApiProperty({ example: 5, description: 'Número de cupos disponibles' })
  cuposDisponibles: number;

  @ApiProperty({ example: 83.33, description: 'Porcentaje de ocupación' })
  porcentajeOcupacion: number;
}

export class ListaCursosCuposDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  pages: number;

  @ApiProperty({ type: [CursoCuposDto] })
  items: CursoCuposDto[];
}
