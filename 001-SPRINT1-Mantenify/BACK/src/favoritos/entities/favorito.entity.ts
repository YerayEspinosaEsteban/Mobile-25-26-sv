import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Publicacion } from 'src/publicaciones/entities/publicacion.entity';

@Entity({ name: 'favoritos' })
@Unique(['usuario', 'publicacion'])
export class Favorito {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.favoritos, {
    onDelete: 'CASCADE',
  })
  // FK usuario_id
  usuario: Usuario;

  @ManyToOne(() => Publicacion, (pub) => pub.favoritos, {
    onDelete: 'CASCADE',
  })
  // FK publicacion_id
  publicacion: Publicacion;
}
