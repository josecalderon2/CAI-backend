# Colegio Amigos de Israel - Backend (Producción)

Este repositorio contiene la API del sistema para el Colegio Amigos de Israel.

## Requisitos

- Node.js (v18 o superior)
- npm o yarn
- PostgreSQL
- PM2 (opcional, para gestión de procesos)

## Configuración del entorno

1. Copia el archivo `.env.example` a `.env.production`
2. Configura las variables de entorno en el archivo `.env.production` con los valores adecuados para producción

## Instalación

```bash
# Instalar dependencias
npm ci --only=production

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones de base de datos
npx prisma migrate deploy
```

## Ejecución

### Opción 1: Directamente con Node.js

```bash
# Construir la aplicación
npm run build

# Iniciar en modo producción
NODE_ENV=production npm run start:prod
```

### Opción 2: Usando PM2 (recomendado para producción)

```bash
# Instalar PM2 globalmente si no está instalado
npm install -g pm2

# Construir la aplicación
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.json --env production

# Ver logs
pm2 logs

# Monitorear procesos
pm2 monit
```

## Documentación API

La documentación de la API estará disponible en:
- Ruta: `/api`
- Ejemplo: `https://api.colegioamigosdeisrael.cl/api`

## Mantenimiento

### Actualización

```bash
# Detener la aplicación (si está usando PM2)
pm2 stop cai-backend

# Pull de los cambios
git pull origin produccion

# Instalar dependencias
npm ci --only=production

# Construir la aplicación
npm run build

# Aplicar migraciones si hay nuevas
npx prisma migrate deploy

# Reiniciar la aplicación
pm2 restart cai-backend
```

### Backup de base de datos

```bash
# Exportar esquema de la base de datos
pg_dump -U usuario -d cai_db -s > schema_backup.sql

# Exportar datos
pg_dump -U usuario -d cai_db -a > data_backup.sql
```