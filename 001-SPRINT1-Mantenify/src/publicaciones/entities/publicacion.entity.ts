import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { PublicacionCategoria } from 'src/publicaciones/entities/publicacion-categoria.entity';
import { Favorito } from 'src/favoritos/entities/favorito.entity';

@Entity({ name: 'publicaciones' })
export class Publicacion {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'titulo', length: 120 })
  titulo: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    name: 'precio_base',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  precioBase: number;

  @Column({ name: 'ciudad', length: 80, nullable: true })
  ciudad?: string;

  @Column({ name: 'imagen_clave', type: 'text' })
  imagenClave: string; // aquí tendrás la clave de S3

  @Column({ name: 'video_url', type: 'text' })
  videoUrl: string; // URL de YouTube

  // FK usuario_id
  @ManyToOne(() => Usuario, (usuario) => usuario.publicaciones, {
    eager: true,
  })
  usuario: Usuario;

  @OneToMany(
    () => PublicacionCategoria,
    (pc) => pc.publicacion,
  )
  publicacionesCategorias: PublicacionCategoria[];

  @OneToMany(() => Favorito, (fav) => fav.publicacion)
  favoritos: Favorito[];
}
