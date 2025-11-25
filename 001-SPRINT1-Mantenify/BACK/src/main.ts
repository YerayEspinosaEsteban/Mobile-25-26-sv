import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global para DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,   // elimina campos que no están en DTO
      transform: true,   // castea tipos (string -> number, etc.)
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Mantenify API')
    .setDescription('API de la red social de profesionales de mantenimiento')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

