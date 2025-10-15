import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PerfilService } from './perfil.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('Perfil')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Patch()
  updatePerfil(@Req() req: any, @Body() dto: UpdatePerfilDto) {
    return this.perfilService.updatePerfil(req.user, dto);
  }

  @Patch('password')
  updatePassword(@Req() req: any, @Body() dto: UpdatePasswordDto) {
    return this.perfilService.updatePassword(req.user, dto.currentPass, dto.newPass);
  }
}
