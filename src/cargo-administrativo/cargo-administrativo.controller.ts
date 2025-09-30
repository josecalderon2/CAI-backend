import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoAdministrativoService } from './cargo-administrativo.service';
import { CreateCargoAdministrativoDto } from './dto/create-cargo-administrativo.dto';
import { UpdateCargoAdministrativoDto } from './dto/update-cargo-administrativo.dto';

@Controller('cargo-administrativo')
export class CargoAdministrativoController {
  constructor(private readonly cargoAdministrativoService: CargoAdministrativoService) {}

  @Post()
  create(@Body() createCargoAdministrativoDto: CreateCargoAdministrativoDto) {
    return this.cargoAdministrativoService.create(createCargoAdministrativoDto);
  }

  @Get()
  findAll() {
    return this.cargoAdministrativoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargoAdministrativoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCargoAdministrativoDto: UpdateCargoAdministrativoDto,
  ) {
    return this.cargoAdministrativoService.update(+id, updateCargoAdministrativoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargoAdministrativoService.remove(+id);
  }
}