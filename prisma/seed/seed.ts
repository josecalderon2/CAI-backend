import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function getOrCreateCargo(nombre: 'Admin' | 'P.A' | 'Orientador') {
  const existing = await prisma.cargo_administrativo.findFirst({
    where: { nombre },
    select: { id_cargo_administrativo: true },
  });

  if (existing) return existing.id_cargo_administrativo;

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

  // ADMIN
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

  // P.A
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

  // ORIENTADOR (id_cargo_administrativo, dui, telefono y direccion obligatorios)
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
  // Crear tipos de parentescos comunes
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
  // Crear tipos de actividades para evaluaciones
  const tipos = [
    'Examen parcial',
    'Examen final',
    'Laboratorio',
    'Tarea',
    'Proyecto',
    'Participación',
  ];

  for (const nombre of tipos) {
    // Buscar primero si existe
    const existente = await prisma.tipo_actividad.findFirst({
      where: { nombre },
    });

    // Si no existe, crearlo
    if (!existente) {
      await prisma.tipo_actividad.create({
        data: { nombre },
      });
    }
  }

  console.log('Tipos de actividad OK');
}

async function seedAlumnoEjemplo() {
  // 1. Crear responsables del alumno
  const responsablePadre = await prisma.responsable.upsert({
    where: { dui: '01234567-8' },
    update: {},
    create: {
      nombre: 'Ronald Antonio',
      apellido: 'Acosta Flores',
      dui: '01234567-8',
      telefono: '7986-9463',
      email: 'ronald.acosta@ejemplo.com',
      direccion: 'Prado Real calle A casa 15, Santa Ana',
      lugarTrabajo: 'Empresa ABC',
      profesionOficio: 'Ingeniero',
      ultimoGradoEstudiado: 'Universidad',
      ocupacion: 'Gerente de proyectos',
      religion: 'Católica',
      zonaResidencia: 'Urbana',
      estadoFamiliar: 'Casado',
    },
  });

  const responsableMadre = await prisma.responsable.upsert({
    where: { dui: '12345678-9' },
    update: {},
    create: {
      nombre: 'Carmen Sonia',
      apellido: 'Pineda de Acosta',
      dui: '12345678-9',
      telefono: '7123-4567',
      email: 'carmen.pineda@ejemplo.com',
      direccion: 'Prado Real calle A casa 15, Santa Ana',
      lugarTrabajo: 'Empresa XYZ',
      profesionOficio: 'Doctora',
      ultimoGradoEstudiado: 'Universidad',
      ocupacion: 'Médico general',
      religion: 'Católica',
      zonaResidencia: 'Urbana',
      estadoFamiliar: 'Casada',
    },
  });

  const responsableEmergencia = await prisma.responsable.upsert({
    where: { dui: '87654321-0' },
    update: {},
    create: {
      nombre: 'Carlos Javier',
      apellido: 'Sosa Pineda',
      dui: '87654321-0',
      telefono: '7777-7777',
      direccion: 'Colonia Las Flores, Santa Ana',
      profesionOficio: 'Comerciante',
      ocupacion: 'Dueño de negocio',
      estadoFamiliar: 'Soltero',
    },
  });

  // 2. Obtener IDs de parentescos
  const parentescoPadre = await prisma.parentesco.findFirst({
    where: { nombre: 'Padre' },
  });

  const parentescoMadre = await prisma.parentesco.findFirst({
    where: { nombre: 'Madre' },
  });

  const parentescoTio = await prisma.parentesco.findFirst({
    where: { nombre: 'Tío/a' },
  });

  // 3. Crear alumno con todos los campos
  const alumnoCreado = await prisma.alumno.create({
    data: {
      nombre: 'Diego Antonio',
      apellido: 'Acosta Pineda',
      genero: 'M',
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
      // Crear detalles del alumno
      detalle: {
        create: {
          viveCon: 'Ambos Padres',
          dependenciaEconomica: 'Padre y Madre',
          capacidadPago: true,
          hermanosEnColegio: JSON.stringify([
            { nombre: 'Jimena Acosta', grado: '4-1' },
          ]),
        },
      },
      // Relacionar con responsables
      responsables: {
        create: [
          {
            responsableId: responsablePadre.id_responsable,
            parentescoId: parentescoPadre?.id_parentesco,
            esPrincipal: true,
            firma: true,
            permiteTraslado: true,
            puedeRetirarAlumno: true,
          },
          {
            responsableId: responsableMadre.id_responsable,
            parentescoId: parentescoMadre?.id_parentesco,
            esPrincipal: false,
            firma: true,
            permiteTraslado: true,
            puedeRetirarAlumno: true,
          },
          {
            responsableId: responsableEmergencia.id_responsable,
            parentescoId: parentescoTio?.id_parentesco,
            parentescoLibre: 'Tío',
            esPrincipal: false,
            firma: false,
            permiteTraslado: false,
            puedeRetirarAlumno: true,
          },
        ],
      },
    },
  });

  console.log('Alumno de ejemplo creado:', alumnoCreado.id_alumno);
  return alumnoCreado;
}

async function main() {
  const cargos = await seedCargos();
  await seedUsuarios(cargos);
  await seedParentescos();
  await seedTipoActividades();
  await seedAlumnoEjemplo();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });