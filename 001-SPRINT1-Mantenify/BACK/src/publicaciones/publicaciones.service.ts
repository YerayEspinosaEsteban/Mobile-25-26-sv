import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { PublicacionCategoria } from './entities/publicacion-categoria.entity';
import { CreatePublicacionDto } from './dtos/create-publicacion.dto';
import { FilterPublicacionesDto } from './dtos/filter-publicaciones.dto';

@Injectable()
export class PublicacionesService {
	constructor(
		@InjectRepository(Publicacion)
		private readonly publicacionRepo: Repository<Publicacion>,
		@InjectRepository(Categoria)
		private readonly categoriaRepo: Repository<Categoria>,
		@InjectRepository(PublicacionCategoria)
		private readonly pubCatRepo: Repository<PublicacionCategoria>,
	) {}

	async findAll(filters: FilterPublicacionesDto) {
		const {
			q,
			category,
			minPrice,
			maxPrice,
			sort = 'precio',
			order = 'DESC',
			page = 1,
			limit = 10,
		} = filters;

		const qb = this.publicacionRepo
			.createQueryBuilder('pub')
			.leftJoinAndSelect('pub.publicacionesCategorias', 'pc')
			.leftJoinAndSelect('pc.categoria', 'cat');

		if (q) {
			qb.andWhere('pub.titulo ILIKE :q OR pub.descripcion ILIKE :q', {
				q: `%${q}%`,
			});
		}

		if (category) {
			qb.andWhere('cat.clave = :category', { category });
		}

		if (minPrice !== undefined) {
			qb.andWhere('pub.precioBase >= :min', { min: minPrice });
		}

		if (maxPrice !== undefined) {
			qb.andWhere('pub.precioBase <= :max', { max: maxPrice });
		}

		if (sort === 'precio') {
			qb.orderBy('pub.precioBase', order as 'ASC' | 'DESC');
		} else if (sort === 'titulo') {
			qb.orderBy('pub.titulo', order as 'ASC' | 'DESC');
		} else {
			qb.orderBy('pub.id', order as 'ASC' | 'DESC');
		}

		qb.skip((page - 1) * limit).take(limit);

		return qb.getMany();
	}

	findOne(id: number) {
		return this.publicacionRepo.findOne({
			where: { id },
			relations: [
				'publicacionesCategorias',
				'publicacionesCategorias.categoria',
				'usuario',
			],
		});
	}

	async create(dto: CreatePublicacionDto, usuarioId: number) {
		const pub = this.publicacionRepo.create({
			titulo: dto.title,
			descripcion: dto.description,
			precioBase: dto.price,
			ciudad: dto.city,
			imagenClave: dto.thumbnailKey,
			videoUrl: dto.videoUrl,
			usuario: { id: usuarioId } as any,
		});

		const saved = await this.publicacionRepo.save(pub);

		if (dto.categories) {
			const claves = dto.categories.split(',').map((s) => s.trim());
			const categorias = await this.categoriaRepo.find({
				where: claves.map((clave) => ({ clave })),
			});

			const relaciones = categorias.map((cat) =>
				this.pubCatRepo.create({
					publicacionId: saved.id,
					categoriaId: cat.id,
				}),
			);

			await this.pubCatRepo.save(relaciones);
		}

		return saved;
	}

	async findMostFavorited(limit = 10) {
		const qb = this.publicacionRepo
			.createQueryBuilder('pub')
			.leftJoin('pub.favoritos', 'fav')
			.addSelect('COUNT(fav.id)', 'favoritesCount')
			.groupBy('pub.id')
			.orderBy('favoritesCount', 'DESC')
			.limit(limit);

		const result = await qb.getRawAndEntities();

		return result.entities.map((pub, index) => ({
			...pub,
			favoritesCount: Number(result.raw[index].favoritesCount) || 0,
		}));
	}
}
 
