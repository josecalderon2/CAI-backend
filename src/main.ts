import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  // Prefijo global: TODAS las rutas quedan /api/...
  //app.setGlobalPrefix('api');

  // Configuración de CORS para desarrollo y producción
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origins = frontendUrl.split(',').map((url) => url.trim());

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // true solo si usaras cookies; con Bearer puede ser false
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('API Colegio Amigos de Israel')
    .setDescription('Documentación de la API para pruebas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
