#!/bin/bash

# Script de despliegue en producción
echo "Iniciando despliegue en producción..."

# Cambiar a la rama de producción
git checkout produccion
git pull origin produccion

# Instalar dependencias
echo "Instalando dependencias..."
npm ci --only=production

# Generar Prisma Client
echo "Generando Prisma Client..."
npx prisma generate

# Ejecutar migraciones de base de datos
echo "Aplicando migraciones de base de datos..."
npx prisma migrate deploy

# Construir la aplicación
echo "Construyendo la aplicación..."
npm run build

# Detener la aplicación existente (si está usando PM2)
if command -v pm2 &> /dev/null; then
    echo "Deteniendo la aplicación actual..."
    pm2 stop cai-backend || true
fi

# Iniciar con PM2 (si está instalado)
if command -v pm2 &> /dev/null; then
    echo "Iniciando la aplicación con PM2..."
    pm2 start ecosystem.config.json --env production
else
    echo "PM2 no está instalado. Iniciando con Node.js..."
    NODE_ENV=production npm run start:prod &
fi

echo "¡Despliegue completado con éxito!"