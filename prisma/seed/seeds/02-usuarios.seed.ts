import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsuarios(
  prisma: PrismaClient,
  cargos: { adminId: number; paId: number; oriId: number },
) {
  console.log('🔹 Seeding: Usuarios (Admin, P.A, Orientador)...');

  const passAdmin = await bcrypt.hash('Admin123*', 10);
  const passPA = await bcrypt.hash('Pa12345*', 10);
  const passOri = await bcrypt.hash('Ori12345*', 10);

  // Admin
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

  // P.A (Asistente Pedagógico)
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

  // Orientador
  await prisma.orientador.upsert({
    where: { email: 'orientador@colegio.edu' },
    update: {
      password: passOri,
      id_cargo_administrativo: cargos.oriId,
      apellido: 'Orientador',
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

  console.log('✅ Usuarios OK (Admin, P.A, Orientador)');
}
