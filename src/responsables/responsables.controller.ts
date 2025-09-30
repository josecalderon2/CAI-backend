import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ResponsablesService } from './responsables.service';
import { CreateResponsableDto, UpdateResponsableDto } from './dto';

@Controller('responsables')
export class ResponsablesController {
  constructor(private readonly responsablesService: ResponsablesService) {}

  @Post()
  create(@Body() createResponsableDto: CreateResponsableDto) {
    return this.responsablesService.create(createResponsableDto);
  }

  @Get()
  findAll() {
    return this.responsablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responsablesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResponsableDto: UpdateResponsableDto,
  ) {
    return this.responsablesService.update(+id, updateResponsableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.responsablesService.remove(+id);
  }
}
