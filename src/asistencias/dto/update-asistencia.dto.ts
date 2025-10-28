import { PartialType } from '@nestjs/mapped-types';
import { CreateAsistenciaDto } from './create-asistencia.dto';

// Hereda todas las validaciones de Create... pero las hace opcionales.
export class UpdateAsistenciaDto extends PartialType(CreateAsistenciaDto) {}
