import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativoModule } from './administrativo/administrativo.module';
import { AuthModule } from './auth/auth.module';
import { OrientadorModule } from './orientador/orientador.module';
import { MailModule } from './mail/mail.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { ResponsablesModule } from './responsables/responsables.module';
import { ParentescoModule } from './parentesco/parentesco.module';
import { CargoAdministrativoModule } from './cargo-administrativo/cargo-administrativo.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { ActividadesRecientesModule } from './actividades-recientes/actividades-recientes.module';
import { CursosModule } from './cursos/cursos.module';
import { GradoAcademicoModule } from './grado-academico/grado-academico.module';
import { JornadasModule } from './jornadas/jornadas.module';
import { AsignaturasModule } from './asignaturas/asignaturas.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MetodosEvaluacionModule } from './metodos-evaluacion/metodos-evaluacion.module';
import { TiposAsignaturaModule } from './tipos-asignatura/tipos-asignatura.module';
import { SistemasEvaluacionModule } from './sistemas-evaluacion/sistemas-evaluacion.module';
import { ImportModule } from './import/import.module';
import { ConductaModule as ConductasInfraccionesModule } from './conducta/conducta.module';
import { ResumenModule } from './asistencias/resumen/resumen.module';
import { ConductaModule as ConductaAsistenciaModule } from './asistencias/conductaAsistencia/conductaAsistencia.module';
import { AsistenciaModule } from './asistencias/asistencia.module';
import { SistemaEvaluacionModule } from './sistema-evaluacion/sistema-evaluacion.module';

import { PromocionesModule } from './promociones/promociones.module';
@Module({
  imports: [
    AdministrativoModule,
    AuthModule,
    CargoAdministrativoModule,
    OrientadorModule,
    MailModule,
    AlumnosModule,
    ResponsablesModule,
    ParentescoModule,
    EstadisticasModule,
    CursosModule,
    GradoAcademicoModule,
    JornadasModule,
    ActividadesRecientesModule,
    AsignaturasModule,
    AsignacionesModule,
    MetodosEvaluacionModule,
    TiposAsignaturaModule,
    SistemasEvaluacionModule,
    ImportModule,
    ResumenModule,
    ConductasInfraccionesModule,
    ConductaAsistenciaModule,
    AsistenciaModule,
    SistemaEvaluacionModule,
    PromocionesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
