// src/alumnos/dto/update-alumno.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnoDto } from './create-alumno.dto';

export class UpdateAlumnoDto extends PartialType(CreateAlumnoDto) {
  // Puedes agregar campos específicos para la actualización si es necesario
}
