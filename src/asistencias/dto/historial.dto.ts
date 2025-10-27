// src/asistencias/dto/historial.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AccionAsistencia, EstadoAsistencia } from '@prisma/client';

export class AsistenciaHistorialDto {
  @ApiProperty() id_historial: number;
  @ApiProperty({ nullable: true }) id_asistencia: number | null;
  @ApiProperty() id_alumno: number;
  @ApiProperty() id_asignatura: number;
  @ApiProperty() fecha: Date;
  @ApiProperty() id_orientador_registro: number;

  @ApiProperty({ enum: EstadoAsistencia, nullable: true })
  estado_anterior?: EstadoAsistencia | null;
  @ApiProperty({ enum: EstadoAsistencia, nullable: true })
  estado_nuevo?: EstadoAsistencia | null;
  @ApiProperty({ nullable: true }) observ_anterior?: string | null;
  @ApiProperty({ nullable: true }) observ_nueva?: string | null;

  @ApiProperty() creadoEn: Date;
}
