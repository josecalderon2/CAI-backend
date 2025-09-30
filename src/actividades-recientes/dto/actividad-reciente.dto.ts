import { ApiProperty } from '@nestjs/swagger';

export class ActividadRecienteDto {
  @ApiProperty({ description: 'Descripción de la actividad' })
  descripcion: string;

  @ApiProperty({ description: 'Fecha de la actividad' })
  fecha: Date;

  @ApiProperty({
    description: 'Tipo de actividad (success, info, warning)',
    enum: ['success', 'info', 'warning'],
  })
  tipo: 'success' | 'info' | 'warning';
}

export class ActividadRecienteResponseDto {
  @ApiProperty({ type: [ActividadRecienteDto] })
  items: ActividadRecienteDto[];
}
