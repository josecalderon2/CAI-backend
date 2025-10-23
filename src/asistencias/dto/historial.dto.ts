// src/asistencias/dto/historial.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AccionAsistencia, EstadoAsistencia } from '@prisma/client';

export class AsistenciaHistorialDto {
  @ApiProperty() id_historial: number;
  @ApiProperty({ nullable: true }) id_asistencia: number | null;
  @ApiProperty() id_alumno: number;
  @ApiProperty() id_asignatura: number;
  @ApiProperty() fecha: Date;
  @ApiProperty({ nullable: true }) actor_orientador_id?: number | null;
  @ApiProperty({ nullable: true }) actor_admin_id?: number | null;
  @ApiProperty({ nullable: true }) actor_email?: string | null;

  @ApiProperty({ enum: EstadoAsistencia, nullable: true })
  estado_anterior?: EstadoAsistencia | null;
  @ApiProperty({ enum: EstadoAsistencia, nullable: true })
  estado_nuevo?: EstadoAsistencia | null;
  @ApiProperty({ nullable: true }) observ_anterior?: string | null;
  @ApiProperty({ nullable: true }) observ_nueva?: string | null;

  @ApiProperty({ nullable: true }) orientador_anterior?: number | null;
  @ApiProperty({ nullable: true }) orientador_nuevo?: number | null;
  @ApiProperty({ nullable: true }) fecha_anterior?: Date | null;
  @ApiProperty({ nullable: true }) fecha_nueva?: Date | null;

  @ApiProperty({ nullable: true }) correlacion_id?: string | null;
  @ApiProperty({ nullable: true }) ip?: string | null;
  @ApiProperty({ nullable: true }) userAgent?: string | null;
  @ApiProperty() creadoEn: Date;
}
