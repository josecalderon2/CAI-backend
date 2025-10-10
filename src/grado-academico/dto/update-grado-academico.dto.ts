import { PartialType } from '@nestjs/swagger';
import { CreateGradoAcademicoDto } from './create-grado-academico.dto';

export class UpdateGradoAcademicoDto extends PartialType(
  CreateGradoAcademicoDto,
) {}
