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
    update: { password: passAdmin, id_cargo_administrativo: cargos.adminId },
    create: {
      nombre: 'Ada',
      apellido: 'Admin',
      email: 'admin@colegio.edu',
      password: passAdmin,
      id_cargo_administrativo: cargos.adminId,
      activo: true,
    },
  });

  // P.A
  await prisma.administrativo.upsert({
    where: { email: 'pa@colegio.edu' },
    update: { password: passPA, id_cargo_administrativo: cargos.paId },
    create: {
      nombre: 'Paola',
      apellido: 'Asist',
      email: 'pa@colegio.edu',
      password: passPA,
      id_cargo_administrativo: cargos.paId,
      activo: true,
    },
  });

  // ORIENTADOR (ahora con id_cargo_administrativo obligatorio)
  await prisma.orientador.upsert({
    where: { email: 'orientador@colegio.edu' },
    update: {
      password: passOri,
      id_cargo_administrativo: cargos.oriId,
      apellido: 'Gómez',
      activo: true,
      nombre: 'Orlando',
    },
    create: {
      nombre: 'Orlando',
      apellido: 'Orientador',
      email: 'orientador@colegio.edu',
      password: passOri,
      id_cargo_administrativo: cargos.oriId,
      activo: true,
    },
  });

  console.log('Usuarios OK (Admin, P.A, Orientador)');
}

async function main() {
  const cargos = await seedCargos();
  await seedUsuarios(cargos);
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
