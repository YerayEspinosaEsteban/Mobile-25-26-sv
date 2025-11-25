import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { PublicacionCategoria } from './entities/publicacion-categoria.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Publicacion,
      PublicacionCategoria,
      Categoria,
    ]),
  ],
  providers: [PublicacionesService],
  controllers: [PublicacionesController],
})
export class PublicacionesModule {}
