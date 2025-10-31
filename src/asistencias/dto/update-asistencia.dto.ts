import { PartialType } from '@nestjs/swagger';
import { CreateAsistenciaDto } from './create-asistencia.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * DTO para actualizar un registro de asistencia existente.
 * Todos los campos son opcionales, solo se actualizan los que se envían.
 *
 * Casos de uso comunes:
 * - Cambiar estado de SP (Sin Permiso) a E (Excusado) cuando el alumno trae justificación
 * - Agregar observaciones a un registro existente
 * - Corregir el estado de asistencia por error humano
 */
export class UpdateAsistenciaDto extends PartialType(CreateAsistenciaDto) {
  @ApiPropertyOptional({
    enum: EstadoAsistencia,
    description:
      'Nuevo estado de asistencia. Común: cambiar de SP a E cuando se justifica',
    example: 'E',
  })
  @IsEnum(EstadoAsistencia)
  @IsOptional()
  estado?: EstadoAsistencia;

  @ApiPropertyOptional({
    description:
      'Observación sobre el cambio realizado o motivo de la corrección',
    example: 'Cambio de SP a E - Alumno presentó constancia médica',
  })
  @IsString()
  @IsOptional()
  observacion?: string;
}
