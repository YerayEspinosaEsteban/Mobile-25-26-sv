import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Publicacion } from './publicacion.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';

@Entity({ name: 'publicaciones_categorias' })
export class PublicacionCategoria {
  @PrimaryColumn({ name: 'publicacion_id', type: 'int' })
  publicacionId: number;

  @PrimaryColumn({ name: 'categoria_id', type: 'int' })
  categoriaId: number;

  @ManyToOne(
    () => Publicacion,
    (pub) => pub.publicacionesCategorias,
    { onDelete: 'CASCADE' },
  )
  publicacion: Publicacion;

  @ManyToOne(
    () => Categoria,
    (cat) => cat.publicacionesCategorias,
    { onDelete: 'CASCADE' },
  )
  categoria: Categoria;
}
