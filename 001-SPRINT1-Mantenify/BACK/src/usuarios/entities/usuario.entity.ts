import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Publicacion } from 'src/publicaciones/entities/publicacion.entity';
import { Favorito } from 'src/favoritos/entities/favorito.entity';  

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'nombre', length: 80 })
  nombre: string;

  @Column({ name: 'correo', length: 120, unique: true })
  correo: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Publicacion, (pub) => pub.usuario)
  publicaciones: Publicacion[];

  @OneToMany(() => Favorito, (fav) => fav.usuario)
  favoritos: Favorito[];
}
