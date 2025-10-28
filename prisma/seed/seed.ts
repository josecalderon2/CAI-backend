// prisma/seed/seed.ts
import {
  PrismaClient,
  Prisma,
  CategoriaInfraccion, // Importar el nuevo Enum
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/* =========================
   Helpers / Catálogos
========================= */
async function getOrCreateCargo(nombre: 'Admin' | 'P.A' | 'Orientador') {
  const up = await prisma.cargo_administrativo.findFirst({
    where: { nombre },
    select: { id_cargo_administrativo: true },
  });
  if (up) return up.id_cargo_administrativo;

  const created = await prisma.cargo_administrativo.create({
    data: { nombre },
    select: { id_cargo_administrativo: true },
  });
  return created.id_cargo_administrativo;
}

async function seedCargos() {
  const adminId = await getOrCreateCargo('Admin');
  const paId = await getOrCreateCargo('P.A');
  const oriId = await getOrCreateCargo('Orientador');
  console.log('Cargos OK:', { adminId, paId, oriId });
  return { adminId, paId, oriId };
}

async function seedUsuarios(cargos: {
  adminId: number;
  paId: number;
  oriId: number;
}) {
  const passAdmin = await bcrypt.hash('Admin123*', 10);
  const passPA = await bcrypt.hash('Pa12345*', 10);
  const passOri = await bcrypt.hash('Ori12345*', 10);

  await prisma.administrativo.upsert({
    where: { email: 'admin@colegio.edu' },
    update: {
      password: passAdmin,
      id_cargo_administrativo: cargos.adminId,
      direccion: 'Santa Ana',
      dui: '00000000-0',
      telefono: '7000-0000',
    },
    create: {
      nombre: 'Ada',
      apellido: 'Admin',
      email: 'admin@colegio.edu',
      password: passAdmin,
      id_cargo_administrativo: cargos.adminId,
      activo: true,
      direccion: 'Santa Ana',
      dui: '00000000-0',
      telefono: '7000-0000',
    },
  });

  await prisma.administrativo.upsert({
    where: { email: 'pa@colegio.edu' },
    update: {
      password: passPA,
      id_cargo_administrativo: cargos.paId,
      direccion: 'Santa Ana',
      dui: '11111111-1',
      telefono: '7000-0001',
    },
    create: {
      nombre: 'Paola',
      apellido: 'Asist',
      email: 'pa@colegio.edu',
      password: passPA,
      id_cargo_administrativo: cargos.paId,
      activo: true,
      direccion: 'Santa Ana',
      dui: '11111111-1',
      telefono: '7000-0001',
    },
  });

  await prisma.orientador.upsert({
    where: { email: 'orientador@colegio.edu' },
    update: {
      password: passOri,
      id_cargo_administrativo: cargos.oriId,
      apellido: 'Gómez',
      activo: true,
      nombre: 'Orlando',
      dui: '22222222-2',
      telefono: '7000-0002',
      direccion: 'Colonia Escalón, San Salvador',
    },
    create: {
      nombre: 'Orlando',
      apellido: 'Orientador',
      email: 'orientador@colegio.edu',
      password: passOri,
      id_cargo_administrativo: cargos.oriId,
      activo: true,
      dui: '22222222-2',
      telefono: '7000-0002',
      direccion: 'Colonia Escalón, San Salvador',
    },
  });

  console.log('Usuarios OK (Admin, P.A, Orientador)');
}

async function seedParentescos() {
  const parentescos = [
    'Padre',
    'Madre',
    'Abuelo/a',
    'Tío/a',
    'Hermano/a',
    'Tutor legal',
    'Responsable de transporte',
    'Contacto de emergencia',
  ];

  for (const nombre of parentescos) {
    await prisma.parentesco.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log('Parentescos OK');
}

async function seedTipoActividades() {
  const tipos = [
    'Examen parcial',
    'Examen final',
    'Laboratorio',
    'Tarea',
    'Proyecto',
    'Participación',
  ];

  for (const nombre of tipos) {
    const existente = await prisma.tipo_actividad.findFirst({
      where: { nombre },
    });

    if (!existente) {
      await prisma.tipo_actividad.create({
        data: { nombre },
      });
    }
  }

  console.log('Tipos de actividad OK');
}

async function seedJornadas() {
  const jornadas = ['Diurna'];

  for (const nombre of jornadas) {
    const exists = await prisma.jornada.findFirst({ where: { nombre } });
    if (!exists) {
      await prisma.jornada.create({ data: { nombre } });
    }
  }

  console.log('Jornadas OK:', jornadas);
}

async function seedGradosAcademicos() {
  const grados = [
    { nombre: 'Primera Infancia', nota_minima: 7.0 },
    { nombre: 'Primaria', nota_minima: 7.0 },
    { nombre: 'Secundaria', nota_minima: 7.0 },
  ];

  const jornada = await prisma.jornada.findFirst({
    where: { nombre: 'Diurna' },
  });

  for (const grado of grados) {
    const exists = await prisma.grado_Academico.findFirst({
      where: { nombre: grado.nombre },
    });

    if (!exists) {
      await prisma.grado_Academico.create({
        data: {
          nombre: grado.nombre,
          nota_minima: grado.nota_minima,
          id_jornada: jornada?.id_jornada,
        },
      });
    }
  }

  console.log('Grados Académicos OK:', grados.map((g) => g.nombre).join(', '));
}

/* ==============================
   NUEVO SEED: Catálogo Infracciones
============================== */
/**
 * Puebla la tabla `InfraccionCatalogo` con datos del manual.
 */
async function seedInfracciones() {
  console.log('⏳ Poblando Catálogo de Infracciones...');

  // Definimos la data de las infracciones
  const infraccionesData: Prisma.InfraccionCatalogoCreateInput[] = [
    // --- Menos Graves (1 punto) ---
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-001',
      descripcion: 'Presentación personal indecorosa o uniforme incompleto',
      puntos: 1,
    },
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-002',
      descripcion: 'Llegada tardía (Acumulación)',
      puntos: 1,
    },
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-003',
      descripcion: 'Incumplimiento de tareas',
      puntos: 1,
    },
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-004',
      descripcion: 'Uso de lenguaje inadecuado (sobrenombres, vulgar)',
      puntos: 1,
    },

    // --- Graves (3 puntos) ---
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-001',
      descripcion: 'Uso de maquillaje, tinte o uñas acrílicas',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-002',
      descripcion: 'Manifestaciones de noviazgo',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-003',
      descripcion: 'Dañar mobiliario o infraestructura',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-004',
      descripcion: 'Falta de respeto al personal (docente, admin, etc.)',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-005',
      descripcion: 'Intento de fraude en tareas o trabajos',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-006',
      descripcion: 'Uso de celular sin permiso en clase',
      puntos: 3,
    },
    // Este maneja el caso de 0.3 puntos visto en el Excel
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-007',
      descripcion: 'Falta de respeto (Artículo 5.1.3 literal e) - Peso 0.3',
      puntos: 0.3,
    },

    // --- Muy Graves (5 puntos) ---
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-001',
      descripcion: 'Abandonar el colegio sin autorización',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-002',
      descripcion: 'Hurto o robo de pertenencias',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-003',
      descripcion: 'Agresión física o verbal (Atentar contra la integridad)',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-004',
      descripcion: 'Acoso escolar (Bullying)',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-005',
      descripcion: 'Introducir/ingerir alcohol o sustancias prohibidas',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-006',
      descripcion: 'Fraude comprobado en exámenes',
      puntos: 5,
    },
  ];

  // Usamos upsert para que sea idempotente, usando 'articulo' como llave
  for (const data of infraccionesData) {
    await prisma.infraccionCatalogo.upsert({
      where: { articulo: data.articulo },
      update: data,
      create: data,
    });
  }

  console.log(
    `✅ Catálogo de Infracciones OK (${infraccionesData.length} registros).`,
  );
}

/* =========================
   Alumno Ejemplo (detallado)
========================= */
async function seedAlumnoEjemplo() {
  const responsablePadre = await prisma.responsable.upsert({
    where: { dui: '01234567-8' },
    update: {
      tipoDocumento: 'DUI',
      numeroDocumento: '01234567-8',
      naturalizado: false,
      telefonoFijo: '2440-1111',
    },
    create: {
      nombre: 'Ronald Antonio',
      apellido: 'Acosta Flores',
      dui: '01234567-8',
      telefono: '7986-9463',
      telefonoFijo: '2440-1111',
      email: 'ronald.acosta@ejemplo.com',
      direccion: 'Prado Real calle A casa 15, Santa Ana',
      lugarTrabajo: 'Empresa ABC',
      profesionOficio: 'Ingeniero',
      ultimoGradoEstudiado: 'Universidad',
      ocupacion: 'Gerente de proyectos',
      religion: 'Católica',
      zonaResidencia: 'Urbana',
      estadoFamiliar: 'Casado',
      tipoDocumento: 'DUI',
      numeroDocumento: '01234567-8',
      naturalizado: false,
    },
  });

  const responsableMadre = await prisma.responsable.upsert({
    where: { dui: '12345678-9' },
    update: {
      tipoDocumento: 'DUI',
      numeroDocumento: '12345678-9',
      naturalizado: false,
      telefonoFijo: '2440-2222',
    },
    create: {
      nombre: 'Carmen Sonia',
      apellido: 'Pineda de Acosta',
      dui: '12345678-9',
      telefono: '7123-4567',
      telefonoFijo: '2440-2222',
      email: 'carmen.pineda@ejemplo.com',
      direccion: 'Prado Real calle A casa 15, Santa Ana',
      lugarTrabajo: 'Empresa XYZ',
      profesionOficio: 'Doctora',
      ultimoGradoEstudiado: 'Universidad',
      ocupacion: 'Médico general',
      religion: 'Católica',
      zonaResidencia: 'Urbana',
      estadoFamiliar: 'Casada',
      tipoDocumento: 'DUI',
      numeroDocumento: '12345678-9',
      naturalizado: false,
    },
  });

  const responsableEmergencia = await prisma.responsable.upsert({
    where: { dui: '87654321-0' },
    update: {
      tipoDocumento: 'DUI',
      numeroDocumento: '87654321-0',
      naturalizado: false,
    },
    create: {
      nombre: 'Carlos Javier',
      apellido: 'Sosa Pineda',
      dui: '87654321-0',
      telefono: '7777-7777',
      direccion: 'Colonia Las Flores, Santa Ana',
      profesionOficio: 'Comerciante',
      ocupacion: 'Dueño de negocio',
      estadoFamiliar: 'Soltero',
      tipoDocumento: 'DUI',
      numeroDocumento: '87654321-0',
      naturalizado: false,
    },
  });

  const parentescoPadre = await prisma.parentesco.findFirst({
    where: { nombre: 'Padre' },
  });
  const parentescoMadre = await prisma.parentesco.findFirst({
    where: { nombre: 'Madre' },
  });
  const parentescoTio = await prisma.parentesco.findFirst({
    where: { nombre: 'Tío/a' },
  });

  const alumnoCreado = await prisma.alumno.upsert({
    where: { numeroMatricula: 'MAT-2025-0001' },
    update: {
      anioEscolar: '2025',
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: true,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: true,
      religion: 'Católica',
      direccion: 'Prado Real calle A casa 15',
      municipio: 'Santa Ana',
      departamento: 'Santa Ana',
      medioTransporte: 'Microbús',
      encargadoTransporte: 'Transporte Escolar Seguro',
      encargadoTelefono: '7123-9876',
    },
    create: {
      nombre: 'Diego Antonio',
      apellido: 'Acosta Pineda',
      genero: 'M',
      // En tu modelo usas String; mantengo formato mixto como venía
      fechaNacimiento: '23/06/2010',
      nacionalidad: 'Salvadoreña',
      edad: 14,
      partidaNumero: '123456',
      folio: '123',
      libro: '456',
      anioPartida: '2010',
      departamentoNacimiento: 'Santa Ana',
      municipioNacimiento: 'Santa Ana',
      tipoSangre: 'O+',
      problemaFisico: 'No',
      observacionesMedicas: 'Alérgico a la penicilina',
      centroAsistencial: 'Hospital San Juan de Dios',
      medicoNombre: 'Dr. Fernando Menjívar',
      medicoTelefono: '2440-0000',
      zonaResidencia: 'Urbana',
      direccion: 'Prado Real calle A casa 15',
      municipio: 'Santa Ana',
      departamento: 'Santa Ana',
      distanciaKM: 2.5,
      medioTransporte: 'Microbús',
      encargadoTransporte: 'Transporte Escolar Seguro',
      encargadoTelefono: '7123-9876',
      repiteGrado: false,
      condicionado: false,
      activo: true,

      anioEscolar: '2025',
      numeroMatricula: 'MAT-2025-0001',
      fechaMatricula: new Date('2025-01-10T15:30:00Z'),
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: true,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: true,
      religion: 'Católica',

      detalle: {
        create: {
          viveCon: 'Ambos Padres',
          dependenciaEconomica: 'Padre y Madre',
          capacidadPago: true,
          hermanosEnColegio: [
            { nombre: 'Jimena Acosta', grado: '4-1' },
          ] as Prisma.InputJsonValue,

          emergencia1Nombre: 'Carlos Javier Sosa',
          emergencia1Parentesco: 'Tío',
          emergencia1Telefono: '7777-7777',
          emergencia2Nombre: 'María López',
          emergencia2Parentesco: 'Vecina',
          emergencia2Telefono: '7865-2222',

          tenenciaVivienda: 'Propia',
        },
      },
      responsables: {
        create: [
          {
            responsableId: responsablePadre.id_responsable,
            parentescoId: parentescoPadre?.id_parentesco,
            esPrincipal: true,
            firma: true,
            permiteTraslado: true,
            puedeRetirarAlumno: true,
            contactoEmergencia: true,
          },
          {
            responsableId: responsableMadre.id_responsable,
            parentescoId: parentescoMadre?.id_parentesco,
            esPrincipal: false,
            firma: true,
            permiteTraslado: true,
            puedeRetirarAlumno: true,
            contactoEmergencia: true,
          },
          {
            responsableId: responsableEmergencia.id_responsable,
            parentescoId: parentescoTio?.id_parentesco,
            parentescoLibre: 'Tío',
            esPrincipal: false,
            firma: false,
            permiteTraslado: false,
            puedeRetirarAlumno: true,
            contactoEmergencia: true,
          },
        ],
      },
    },
  });

  console.log('Alumno 1 creado/actualizado:', alumnoCreado.id_alumno);
  return alumnoCreado;
}

async function seedAlumnoEjemplo2() {
  const alumno2 = await prisma.alumno.upsert({
    where: { numeroMatricula: 'MAT-2025-0002' },
    update: { anioEscolar: '2025', estadoMatricula: 'INSCRITO' },
    create: {
      nombre: 'Ruth',
      apellido: 'Lemus',
      genero: 'F',
      fechaNacimiento: '12/02/2010',
      edad: 15,
      activo: true,
      anioEscolar: '2025',
      numeroMatricula: 'MAT-2025-0002',
      fechaMatricula: new Date('2025-01-11T15:30:00Z'),
      estadoMatricula: 'INSCRITO',
    },
  });
  console.log('Alumno 2 creado/actualizado:', alumno2.id_alumno);
  return alumno2;
}

async function seedMetodosEvaluacion() {
  const metodos = ['Numerico', 'Conceptual / Cualitativo', 'Cuantitativo'];

  for (const nombre of metodos) {
    const existente = await prisma.metodo_evaluacion.findFirst({
      where: { nombre },
    });
    if (!existente) {
      await prisma.metodo_evaluacion.create({ data: { nombre } });
    }
  }
  console.log('Métodos de Evaluación OK');
}

async function seedTiposAsignatura() {
  const tipos = [
    'Basica',
    'Formativa',
    'Conductual',
    'Especial',
    'Asistencia',
    'PAES',
  ];

  for (const nombre of tipos) {
    const existente = await prisma.tipo_Asignatura.findFirst({
      where: { nombre },
    });
    if (!existente) await prisma.tipo_Asignatura.create({ data: { nombre } });
  }
  console.log('Tipos de Asignatura OK');
}

async function seedSistemasEvaluacion() {
  const sistemas = [
    { nombre: 'Educacion Basica - 4', etapas: 4 },
    { nombre: 'Socioafectiva - 4 etapas', etapas: 4 },
    { nombre: 'Asistencia NO - 4 etapas', etapas: 4 },
    { nombre: 'Bachillerato General - 4 etapas', etapas: 4 },
    { nombre: 'Educacion General - 4 etapas', etapas: 4 },
    { nombre: 'Educacion Basica - 3 etapas', etapas: 3 },
    { nombre: 'Conductual - 3 etapas', etapas: 3 },
    { nombre: 'Educacion Parvularia - 3 etapas', etapas: 3 },
    { nombre: 'Area Formativa - 3 etapas', etapas: 3 },
    { nombre: 'ASISTENCIA - 3 Etapas', etapas: 3 },
  ];

  for (const sistema of sistemas) {
    const existente = await prisma.sistema_Evaluacion.findFirst({
      where: { nombre: sistema.nombre },
    });
    if (!existente) {
      await prisma.sistema_Evaluacion.create({
        data: { nombre: sistema.nombre, etapas: sistema.etapas },
      });
    }
  }
  console.log('Sistemas de Evaluación OK');
}

/* =========================
   Cursos / Asignaturas / AO
========================= */
async function ensureOrientadorExtra(
  email: string,
  nombre: string,
  apellido: string,
  cargos: { oriId: number },
) {
  const exists = await prisma.orientador.findUnique({ where: { email } });
  if (exists) return exists;

  const pass = await bcrypt.hash('Ori2*12345', 10);
  return prisma.orientador.create({
    data: {
      nombre,
      apellido,
      email,
      password: pass,
      id_cargo_administrativo: cargos.oriId,
      activo: true,
      dui: '33333333-3',
      telefono: '7000-0003',
      direccion: 'Col. Escalón, San Salvador',
    },
  });
}

async function getOrCreateCurso(
  nombre: string,
  seccion: string,
  id_grado_academico: number | undefined,
  id_orientador: number,
  cupo = 30,
  aula?: string,
  anio_academico?: string,
) {
  const found = await prisma.curso.findFirst({ where: { nombre, seccion } });
  if (found) {
    const dataUpdate: Prisma.CursoUpdateInput = {};
    if (found.id_orientador !== id_orientador) {
      dataUpdate.orientador = { connect: { id_orientador } };
    }
    if (found.cupo !== cupo) dataUpdate.cupo = cupo;
    if (aula && found.aula !== aula) dataUpdate.aula = aula;
    if (anio_academico && found.anio_academico !== anio_academico) {
      dataUpdate.anio_academico = anio_academico;
    }
    if (Object.keys(dataUpdate).length) {
      return prisma.curso.update({
        where: { id_curso: found.id_curso },
        data: dataUpdate,
      });
    }
    return found;
  }

  return prisma.curso.create({
    data: {
      nombre,
      seccion,
      id_grado_academico,
      id_orientador,
      cupo,
      aula,
      activo: true,
      anio_academico,
    },
  });
}

async function getCatalogIds() {
  const metodo = await prisma.metodo_evaluacion.findFirst({
    where: { nombre: 'Numerico' },
  });
  const tipo = await prisma.tipo_Asignatura.findFirst({
    where: { nombre: 'Basica' },
  });
  const sistema = await prisma.sistema_Evaluacion.findFirst({
    where: { nombre: 'Educacion Basica - 4' },
  });
  if (!metodo || !tipo || !sistema) {
    throw new Error(
      'Faltan catálogos: metodo_evaluacion/tipo_Asignatura/sistema_Evaluacion. Corre primero los seeds de catálogos.',
    );
  }
  return {
    id_metodo_evaluacion: metodo.id_metodo_evaluacion,
    id_tipo_asignatura: tipo.id_tipo_asignatura,
    id_sistema_evaluacion: sistema.id_sistema_evaluacion,
  };
}

async function getOrCreateAsignatura(
  nombre: string,
  id_curso: number,
  extra: {
    orden_en_reporte?: string;
    horas_semanas?: number;
    id_metodo_evaluacion: number;
    id_tipo_asignatura: number;
    id_sistema_evaluacion: number;
  },
) {
  const found = await prisma.asignatura.findFirst({
    where: { nombre, id_curso },
  });
  if (found) return found;

  return prisma.asignatura.create({
    data: {
      nombre,
      id_curso,
      orden_en_reporte: extra.orden_en_reporte ?? null,
      horas_semanas: extra.horas_semanas ?? 5,
      id_metodo_evaluacion: extra.id_metodo_evaluacion,
      id_tipo_asignatura: extra.id_tipo_asignatura,
      id_sistema_evaluacion: extra.id_sistema_evaluacion,
    },
  });
}

async function upsertAsignacionAO(params: {
  id_asignatura: number;
  id_orientador: number;
  anio_academico: string;
  fecha_asignacion?: Date;
  activo?: boolean;
}) {
  return prisma.asignaturaOrientador.upsert({
    where: {
      id_asignatura_id_orientador_anio_academico: {
        id_asignatura: params.id_asignatura,
        id_orientador: params.id_orientador,
        anio_academico: params.anio_academico,
      },
    },
    update: {
      activo: params.activo ?? true,
      fecha_asignacion: params.fecha_asignacion ?? new Date(),
      fecha_fin: null,
    },
    create: {
      id_asignatura: params.id_asignatura,
      id_orientador: params.id_orientador,
      anio_academico: params.anio_academico,
      activo: params.activo ?? true,
      fecha_asignacion: params.fecha_asignacion ?? new Date(),
    },
  });
}

async function seedCursosAsignaturasYAsignaciones(cargos: {
  adminId: number;
  paId: number;
  oriId: number;
}) {
  const ori1 = await prisma.orientador.findUnique({
    where: { email: 'orientador@colegio.edu' },
  });
  if (!ori1)
    throw new Error('No existe orientador@colegio.edu. Revisa seedUsuarios()');

  const ori2 = await ensureOrientadorExtra(
    'maria.orientadora@colegio.edu',
    'María',
    'López',
    cargos,
  );

  const primaria = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Primaria' },
  });
  if (!primaria)
    throw new Error(
      'No existe Grado_Academico "Primaria". Revisa seedGradosAcademicos().',
    );

  const anio = '2025';
  const fAsign = new Date('2025-01-15T12:00:00Z');

  const curso5A = await getOrCreateCurso(
    'Quinto Grado',
    'A',
    primaria.id_grado_academico,
    ori1.id_orientador,
    35,
    'A-5',
    anio,
  );
  const curso6B = await getOrCreateCurso(
    'Sexto Grado',
    'B',
    primaria.id_grado_academico,
    ori2.id_orientador,
    32,
    'B-6',
    anio,
  );

  const cats = await getCatalogIds();

  const mat5A = await getOrCreateAsignatura('Matemática I', curso5A.id_curso, {
    ...cats,
    orden_en_reporte: '01',
    horas_semanas: 5,
  });
  const len5A = await getOrCreateAsignatura(
    'Lenguaje y Literatura',
    curso5A.id_curso,
    {
      ...cats,
      orden_en_reporte: '02',
      horas_semanas: 4,
    },
  );
  const cie5A = await getOrCreateAsignatura(
    'Ciencias Naturales',
    curso5A.id_curso,
    {
      ...cats,
      orden_en_reporte: '03',
      horas_semanas: 3,
    },
  );

  const mat6B = await getOrCreateAsignatura('Matemática II', curso6B.id_curso, {
    ...cats,
    orden_en_reporte: '01',
    horas_semanas: 5,
  });
  const len6B = await getOrCreateAsignatura(
    'Lenguaje y Literatura II',
    curso6B.id_curso,
    {
      ...cats,
      orden_en_reporte: '02',
      horas_semanas: 4,
    },
  );
  const soc6B = await getOrCreateAsignatura(
    'Ciencias Sociales',
    curso6B.id_curso,
    {
      ...cats,
      orden_en_reporte: '03',
      horas_semanas: 3,
    },
  );

  await upsertAsignacionAO({
    id_asignatura: mat5A.id_asignatura,
    id_orientador: ori1.id_orientador,
    anio_academico: anio,
    fecha_asignacion: fAsign,
    activo: true,
  });
  await upsertAsignacionAO({
    id_asignatura: len5A.id_asignatura,
    id_orientador: ori2.id_orientador,
    anio_academico: anio,
    fecha_asignacion: fAsign,
    activo: true,
  });
  await upsertAsignacionAO({
    id_asignatura: mat6B.id_asignatura,
    id_orientador: ori2.id_orientador,
    anio_academico: anio,
    fecha_asignacion: fAsign,
    activo: true,
  });
  await upsertAsignacionAO({
    id_asignatura: soc6B.id_asignatura,
    id_orientador: ori1.id_orientador,
    anio_academico: anio,
    fecha_asignacion: fAsign,
    activo: true,
  });

  console.log('Cursos/Asignaturas/Asignaciones OK:', {
    cursos: [curso5A.id_curso, curso6B.id_curso],
    asignaturas5A: [
      mat5A.id_asignatura,
      len5A.id_asignatura,
      cie5A.id_asignatura,
    ],
    asignaturas6B: [
      mat6B.id_asignatura,
      len6B.id_asignatura,
      soc6B.id_asignatura,
    ],
    orientadores: [ori1.id_orientador, ori2.id_orientador],
  });

  // === IDs útiles para probar asistencia ===
  const ids = {
    orientadores: {
      ori1: ori1.id_orientador,
      ori2: ori2.id_orientador,
    },
    cursos: {
      curso5A: curso5A.id_curso,
      curso6B: curso6B.id_curso,
    },
    asignaturas: {
      mat5A: mat5A.id_asignatura,
      len5A: len5A.id_asignatura,
      cie5A: cie5A.id_asignatura,
      mat6B: mat6B.id_asignatura,
      len6B: len6B.id_asignatura,
      soc6B: soc6B.id_asignatura,
    },
  };
  console.log('=== IDs para probar asistencia ===');
  console.log(JSON.stringify(ids, null, 2));
}

/* =========================
   MV Asignaciones
========================= */
async function ensureMVAsignaciones() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname='public' AND matviewname='mv_asignaciones'
      ) THEN
        CREATE MATERIALIZED VIEW public.mv_asignaciones AS
        SELECT
          ao.id_asignatura_orientador,
          ao.id_asignatura,
          a.nombre                               AS nombre_asignatura,
          a.horas_semanas,
          ao.id_orientador,
          (o.nombre || ' ' || o.apellido)        AS docente,
          c.id_curso,
          c.nombre                               AS curso,
          c.seccion,
          c.id_orientador                        AS orientador_principal_id,
          (op.nombre || ' ' || op.apellido)      AS orientador_principal,
          ao.anio_academico,
          ao.fecha_asignacion,
          ao.fecha_fin,
          ao.activo,
          CASE WHEN c.id_orientador = ao.id_orientador THEN TRUE ELSE FALSE END AS es_orientador
        FROM public."AsignaturaOrientador" ao
        JOIN public."Asignatura" a
          ON a.id_asignatura = ao.id_asignatura
        LEFT JOIN public."Curso" c
          ON c.id_curso = a.id_curso
        LEFT JOIN public."orientadores" o
          ON o.id_orientador = ao.id_orientador
        LEFT JOIN public."orientadores" op
          ON op.id_orientador = c.id_orientador
        WITH NO DATA;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS mv_asignaciones_pk
    ON public.mv_asignaciones (id_asignatura_orientador);
  `);

  try {
    await prisma.$executeRawUnsafe(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_asignaciones;
    `);
    console.log('MV mv_asignaciones refrescada (CONCURRENTLY).');
  } catch (e) {
    console.warn(
      'REFRESH CONCURRENTLY falló, usando REFRESH normal:',
      (e as Error).message,
    );
    await prisma.$executeRawUnsafe(`
      REFRESH MATERIALIZED VIEW public.mv_asignaciones;
    `);
    console.log('MV mv_asignaciones refrescada (normal).');
  }

  console.log('Materialized View OK: mv_asignaciones');
}

/* =================================
   MODIFICADO: 7°A con Conducta Nueva
================================= */
async function seedCurso7A() {
  console.log(
    '⏳ Creando datos de prueba para 7°A (con conducta actualizada)...',
  );

  const orientador = await prisma.orientador.findUnique({
    where: { email: 'orientador@colegio.edu' },
  });
  const gradoSecundaria = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Secundaria' },
  });
  const catalogos = await getCatalogIds();

  // --- Buscamos las infracciones que creamos en seedInfracciones() ---
  const faltaLeve = await prisma.infraccionCatalogo.findUnique({
    where: { articulo: 'MG-003' }, // 'Incumplimiento de tareas'
    select: { id_infraccion: true },
  });
  const faltaGrave = await prisma.infraccionCatalogo.findUnique({
    where: { articulo: 'G-006' }, // 'Uso de celular sin permiso en clase'
    select: { id_infraccion: true },
  });

  if (!faltaLeve || !faltaGrave) {
    throw new Error(
      'Infracciones de catálogo (MG-003, G-006) no encontradas. Asegúrate de correr seedInfracciones() primero.',
    );
  }
  // --- Fin de la búsqueda de infracciones ---

  // 🔹 Curso
  const curso7A = await getOrCreateCurso(
    'Séptimo Grado',
    'A',
    gradoSecundaria?.id_grado_academico,
    orientador!.id_orientador,
    30,
    'A-7',
    '2025',
  );

  // 🔹 Asignaturas
  const mat7A = await getOrCreateAsignatura('Matemática', curso7A.id_curso, {
    ...catalogos,
    orden_en_reporte: '01',
    horas_semanas: 5,
  });
  const cie7A = await getOrCreateAsignatura('Ciencias', curso7A.id_curso, {
    ...catalogos,
    orden_en_reporte: '02',
    horas_semanas: 4,
  });

  // 🔹 Asignar al orientador
  await upsertAsignacionAO({
    id_asignatura: mat7A.id_asignatura,
    id_orientador: orientador!.id_orientador,
    anio_academico: '2025',
    activo: true,
  });
  await upsertAsignacionAO({
    id_asignatura: cie7A.id_asignatura,
    id_orientador: orientador!.id_orientador,
    anio_academico: '2025',
    activo: true,
  });

  // 🔹 Crear/Asegurar 5 alumnos de ejemplo (IDEMPOTENTE)
  const alumnos: { id_alumno: number; nombre: string }[] = [];

  for (let i = 0; i < 5; i++) {
    const n = i + 1;
    const numeroMatricula = `MAT-7A-${n}`;
    const baseData = {
      nombre: `Alumno${n}`,
      apellido: `Prueba7A`,
      genero: n % 2 === 1 ? 'M' : 'F', // alterna M/F
      // En tu modelo, fechaNacimiento es String (mantengo YYYY-MM-DD para estos)
      fechaNacimiento: `2011-0${((i % 9) + 1).toString()}-15`,
      edad: 13,
      anioEscolar: '2025',
      estadoMatricula: 'INSCRITO',
      activo: true,
    };

    // Upsert por numeroMatricula (UNIQUE)
    const alumno = await prisma.alumno.upsert({
      where: { numeroMatricula },
      update: {
        ...baseData,
        // No toques relación aquí para evitar duplicar conexiones si ya existe
      },
      create: {
        ...baseData,
        numeroMatricula,
        cursos: { connect: { id_curso: curso7A.id_curso } }, // al crear sí conectamos
      },
      select: { id_alumno: true, nombre: true },
    });

    // Intento de conectar al curso si entramos por "update":
    // si ya estaba conectado, ignoramos el error (p.ej. por unique en tabla intermedia)
    try {
      await prisma.alumno.update({
        where: { id_alumno: alumno.id_alumno },
        data: { cursos: { connect: { id_curso: curso7A.id_curso } } },
        select: { id_alumno: true },
      });
    } catch (e: any) {
      // Ignorar duplicado de conexión; si es otro error, lo relanzamos
      if (e?.code !== 'P2002') {
        // Algunos drivers podrían no dar code; si quieres ser más laxo, comenta el if
        // console.warn('Aviso al conectar curso7A:', e?.message ?? e);
      }
    }

    alumnos.push(alumno);
  }

  // 🔹 Asistencias y conductas (3 trimestres)
  const fechasTrimestres = [
    { trimestre: 1, fechas: ['2025-02-01', '2025-02-15', '2025-03-10'] },
    { trimestre: 2, fechas: ['2025-05-01', '2025-05-15', '2025-06-10'] },
    { trimestre: 3, fechas: ['2025-08-01', '2025-08-15', '2025-09-10'] },
  ];

  for (const alumno of alumnos) {
    for (const { trimestre, fechas } of fechasTrimestres) {
      for (const fecha of fechas) {
        const estado =
          alumno.nombre === 'Alumno5'
            ? (['P', 'SP', 'E', 'A'] as const)[Math.floor(Math.random() * 4)]
            : 'P';
        await prisma.asistencia.createMany({
          data: [
            {
              id_alumno: alumno.id_alumno,
              id_asignatura: mat7A.id_asignatura,
              id_orientador: orientador!.id_orientador,
              fecha: new Date(fecha),
              estado,
              anio_academico: '2025',
              trimestre,
            },
            {
              id_alumno: alumno.id_alumno,
              id_asignatura: cie7A.id_asignatura,
              id_orientador: orientador!.id_orientador,
              fecha: new Date(fecha),
              estado,
              anio_academico: '2025',
              trimestre,
            },
          ],
          skipDuplicates: true, // Esto funciona por el @@unique en Asistencia
        });
      }

      // --- BLOQUE DE CONDUCTA ACTUALIZADO ---
      if (alumno.nombre === 'Alumno5') {
        // Asignar una falta aleatoria (leve o grave)
        const faltaAleatoria = Math.random() > 0.5 ? faltaLeve : faltaGrave;

        await prisma.conducta
          .create({
            data: {
              id_alumno: alumno.id_alumno,
              id_orientador: orientador!.id_orientador,
              id_asignatura: cie7A.id_asignatura, // Ocurrió en Ciencias
              fecha: new Date(fechas[1]), // El día 15 del mes

              // Campos NUEVOS:
              id_infraccion_catalogo: faltaAleatoria.id_infraccion,
              observacion: `Incidente reportado por orientador en T${trimestre}`,

              // Campos de reporte
              anio_academico: '2025',
              trimestre,
            },
          })
          .catch(() => {
            // Ignorar si ya existe (para idempotencia 'suave')
            // Para hacerlo 100% idempotente, deberías agregar
            // @@unique([id_alumno, id_infraccion_catalogo, fecha]) al modelo Conducta
          });
      }
      // --- FIN BLOQUE DE CONDUCTA ---
    }
  }

  console.log(
    '✅ Curso 7°A, alumnos, asistencias y conductas (NUEVO MODELO) creados/asegurados.',
  );
}

/* =========================
   MAIN
========================= */
async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  await prisma.$connect();
  console.log('Conectado a la BD');

  const cargos = await seedCargos();
  await seedJornadas();
  await seedGradosAcademicos();
  await seedUsuarios(cargos);
  await seedParentescos();
  await seedTipoActividades();

  // --- NUEVO ORDEN ---
  // 1. Poblar catálogos de evaluación
  await seedMetodosEvaluacion();
  await seedTiposAsignatura();
  await seedSistemasEvaluacion();

  // 2. Poblar el NUEVO catálogo de infracciones
  await seedInfracciones();

  // 3. Crear alumnos de ejemplo
  await seedAlumnoEjemplo();
  await seedAlumnoEjemplo2(); // segundo alumno

  // 4. Crear cursos y asignarlos a docentes
  await seedCursosAsignaturasYAsignaciones(cargos);

  // 5. Crear el curso 7A y sus datos (que AHORA depende de Infracciones)
  await seedCurso7A();

  // 6. Refrescar la Vista Materializada
  await ensureMVAsignaciones();
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
