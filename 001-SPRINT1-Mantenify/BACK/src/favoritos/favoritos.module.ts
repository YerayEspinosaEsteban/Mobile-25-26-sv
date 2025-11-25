import { Module } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { FavoritosController } from './favoritos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Publicacion } from 'src/publicaciones/entities/publicacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito, Usuario, Publicacion])],
  providers: [FavoritosService],
  controllers: [FavoritosController],
})
export class FavoritosModule {}
