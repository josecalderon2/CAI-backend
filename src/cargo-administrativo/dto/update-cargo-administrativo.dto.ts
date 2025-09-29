import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoAdministrativoDto } from './create-cargo-administrativo.dto';

export class UpdateCargoAdministrativoDto extends PartialType(CreateCargoAdministrativoDto) {}