# Configuración para despliegue en producción

# Instalar dependencias
npm ci --only=production

# Construir la aplicación
npm run build

# Iniciar la aplicación en modo producción
NODE_ENV=production npm run start:prod