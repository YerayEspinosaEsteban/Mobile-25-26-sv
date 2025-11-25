import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [DatabaseModule, UsuariosModule, CategoriasModule, PublicacionesModule, FavoritosModule, UploadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
