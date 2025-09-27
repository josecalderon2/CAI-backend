// prisma/seed/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function getOrCreateCargo(nombre: 'Admin' | 'P.A' | 'Orientador') {
  // Si nombre NO es unique en DB, usamos findFirst+create. Si lo es, upsert con where:nombre.
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

  // ADMIN
  await prisma.administrativo.upsert({
    where: { email: 'admin@colegio.edu' },
    update: {
      password: passAdmin,
      id_cargo_administrativo: cargos.adminId,
      direccion: 'Santa Ana',
      dui: '00000000-0',
      telefono: '7000-0000',
      modalidad: 'Presencial',
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
      modalidad: 'Presencial',
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
      modalidad: 'Presencial',
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
      modalidad: 'Presencial',
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

const PARENTESCOS_BASE = [
  'Padre',
  'Madre',
  'Hermano/a',
  'Abuelo/a',
  'Tío/a',
  'Tutor legal',
  'Otro',
] as const;
type ParNombre = (typeof PARENTESCOS_BASE)[number];

async function seedParentescos(): Promise<Record<ParNombre, number>> {
  const out: Partial<Record<ParNombre, number>> = {};

  for (const nombre of PARENTESCOS_BASE) {
    // nombre es @unique en tu schema → upsert directo por nombre
    const up = await prisma.parentesco.upsert({
      where: { nombre } as Prisma.ParentescoWhereUniqueInput,
      update: {},
      create: { nombre },
      select: { id_parentesco: true },
    });
    out[nombre] = up.id_parentesco;
  }

  console.log('Parentescos OK:', out);
  return out as Record<ParNombre, number>;
}

async function seedAlumnoConResponsables(
  parentescos: Record<ParNombre, number>,
) {
  // Alumno de ejemplo (usa todos los campos requeridos de tu schema)
  const fechaNacimiento = new Date('2012-05-15');

  let alumno = await prisma.alumno.findFirst({
    where: { nombre: 'Carlos', apellido: 'Pérez', fechaNacimiento },
    select: { id_alumno: true },
  });

  if (!alumno) {
    alumno = await prisma.alumno.create({
      data: {
        photo: null,
        nombre: 'Carlos',
        apellido: 'Pérez',
        genero: 'Masculino',
        fechaNacimiento,
        nacionalidad: 'Salvadoreña',
        telefono: '7000-0001',
        edad: 12, // opcional
        partidaNumero: '123456',
        folio: '45',
        libro: 'A-12',
        anioPartida: '2012',
        departamentoNacimiento: 'Santa Ana',
        municipioNacimiento: 'Santa Ana',
        tipoSangre: 'O+',
        problemaFisico: 'Ninguno',
        observacionesMedicas: 'N/A',
        centroAsistencial: 'Unidad de Salud Santa Ana',
        medicoNombre: 'Dra. López',
        medicoTelefono: '2222-1111',
        zonaResidencia: 'Urbana',
        direccion: 'Col. Las Magnolias, #123',
        departamento: 'Santa Ana',
        municipio: 'Santa Ana',
        distanciaKM: 3.5,
        medioTransporte: 'Bus',
        activo: true,

        firmaPadre: false,
        firmaMadre: false,
        firmaResponsable: false,

        // Crear el detalle 1–1 (opcional, pero útil para probar)
        alumnoDetalle: {
          create: {
            repiteGrado: 'No',
            condicionado: 'No',
            enfermedades: null,
            medicamentoPrescrito: null,
            observaciones: 'N/A',
            capacidadPago: true,
            tieneHermanos: true,
            detalleHermanos: { cantidad: 2, edades: [8, 14] } as any,
            viveCon: 'Padres',
            dependenciaEconomica: 'Padres',
            custodiaLegal: 'Padres',
          },
        },
      },
      select: { id_alumno: true },
    });
    console.log('Alumno creado:', alumno.id_alumno);
  } else {
    console.log('Alumno ya existía:', alumno.id_alumno);
  }

  // Responsables (Padre y Madre) — evitamos duplicar usando DUI + alumnoId
  const padreDui = '01234567-8';
  const madreDui = '12345678-9';

  const padre = await prisma.responsable.findFirst({
    where: { dui: padreDui, alumnoId: alumno.id_alumno },
    select: { id: true },
  });

  if (!padre) {
    await prisma.responsable.create({
      data: {
        nombre: 'Juan',
        apellido: 'Pérez',
        dui: padreDui,
        telefono: '7000-1000',
        email: 'juan.perez@example.com',
        tipo: 'Padre',
        fechaNacimiento: new Date('1985-01-10'),
        departamentoNacimiento: 'Santa Ana',
        municipioNacimiento: 'Santa Ana',
        estadoFamiliar: 'Casado',
        zonaResidencia: 'Urbana',
        direccion: 'Col. Las Magnolias, #123',
        profesion: 'Técnico',
        ultimoGradoEstudiado: 'Bachillerato',
        ocupacion: 'Empleado',
        religion: 'Católica',
        firmaFoto: true,
        alumnoId: alumno.id_alumno,
        parentescoId: parentescos['Padre'],
      },
    });
    console.log('Responsable Padre creado');
  } else {
    console.log('Responsable Padre ya existía');
  }

  const madre = await prisma.responsable.findFirst({
    where: { dui: madreDui, alumnoId: alumno.id_alumno },
    select: { id: true },
  });

  if (!madre) {
    await prisma.responsable.create({
      data: {
        nombre: 'María',
        apellido: 'López',
        dui: madreDui,
        telefono: '7000-2000',
        email: 'maria.lopez@example.com',
        tipo: 'Madre',
        fechaNacimiento: new Date('1987-07-22'),
        departamentoNacimiento: 'Santa Ana',
        municipioNacimiento: 'Santa Ana',
        estadoFamiliar: 'Casado',
        zonaResidencia: 'Urbana',
        direccion: 'Col. Las Magnolias, #123',
        profesion: 'Comerciante',
        ultimoGradoEstudiado: 'Universitario',
        ocupacion: 'Independiente',
        religion: 'Católica',
        firmaFoto: true,
        alumnoId: alumno.id_alumno,
        parentescoId: parentescos['Madre'],
      },
    });
    console.log('Responsable Madre creado');
  } else {
    console.log('Responsable Madre ya existía');
  }
}

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  await prisma.$connect();
  console.log('Conectado a la BD ✅');

  const cargos = await seedCargos();
  await seedUsuarios(cargos);

  const parentescos = await seedParentescos();
  await seedAlumnoConResponsables(parentescos);

  console.log('Seed COMPLETADO ✅');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
