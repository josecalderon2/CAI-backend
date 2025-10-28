import { PartialType } from '@nestjs/mapped-types';
import { CreateConductaDto } from './create-conducta.dto';

export class UpdateConductaDto extends PartialType(CreateConductaDto) {}
