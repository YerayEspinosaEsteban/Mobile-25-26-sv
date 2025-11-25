import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PublicacionCategoria } from 'src/publicaciones/entities/publicacion-categoria.entity';

@Entity({ name: 'categorias' })
export class Categoria {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'clave', length: 50, unique: true })
  clave: string; // "fontaneria", "electricidad"...

  @Column({ name: 'nombre', length: 80 })
  nombre: string;

  @OneToMany(() => PublicacionCategoria, (pc) => pc.categoria)
  publicacionesCategorias: PublicacionCategoria[];
}
