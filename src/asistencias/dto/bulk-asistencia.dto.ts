import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateAsistenciaDto } from './create-asistencia.dto';

export class BulkAsistenciaDto {
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto dentro del array
  @Type(() => CreateAsistenciaDto)
  registros: CreateAsistenciaDto[];
}
