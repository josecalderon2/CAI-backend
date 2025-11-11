import { PartialType } from '@nestjs/swagger';
import { CreateCalificacionDto } from './create-calificacion.dto';

export class UpdateCalificacionDto extends PartialType(CreateCalificacionDto) {}
