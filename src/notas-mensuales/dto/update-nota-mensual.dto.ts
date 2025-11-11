import { PartialType } from '@nestjs/swagger';
import { CreateNotaMensualDto } from './create-nota-mensual.dto';
import { OmitType } from '@nestjs/swagger';

// Omitimos los campos que no deberían cambiar en una actualización
export class UpdateNotaMensualDto extends PartialType(
  OmitType(CreateNotaMensualDto, ['id_alumno', 'id_asignatura', 'mes', 'anio'] as const),
) {}
