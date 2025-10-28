import { PartialType } from '@nestjs/mapped-types';
import { CreateInfraccionCatalogoDto } from './create-infraccion-catalogo.dto';

export class UpdateInfraccionCatalogoDto extends PartialType(
  CreateInfraccionCatalogoDto,
) {}
