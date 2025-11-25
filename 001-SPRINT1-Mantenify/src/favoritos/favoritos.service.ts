import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './entities/favorito.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Publicacion } from 'src/publicaciones/entities/publicacion.entity';

@Injectable()
export class FavoritosService {
	constructor(
		@InjectRepository(Favorito)
		private readonly favoritoRepo: Repository<Favorito>,
		@InjectRepository(Usuario)
		private readonly usuarioRepo: Repository<Usuario>,
		@InjectRepository(Publicacion)
		private readonly publicacionRepo: Repository<Publicacion>,
	) {}

	async getUserFavorites(userId: number) {
		const favoritos = await this.favoritoRepo.find({
			where: { usuario: { id: userId } },
			relations: ['publicacion'],
		});

		return favoritos.map((f) => f.publicacion);
	}

	async addFavorite(userId: number, publicacionId: number) {
		const usuario = await this.usuarioRepo.findOneBy({ id: userId });
		const publicacion = await this.publicacionRepo.findOneBy({ id: publicacionId });

		if (!usuario || !publicacion) {
			throw new Error('Usuario o publicación no existentes');
		}

		const fav = this.favoritoRepo.create({ usuario, publicacion });
		return this.favoritoRepo.save(fav);
	}

	async removeFavorite(userId: number, publicacionId: number) {
		const fav = await this.favoritoRepo.findOne({
			where: { usuario: { id: userId }, publicacion: { id: publicacionId } },
			relations: ['usuario', 'publicacion'],
		});

		if (!fav) return;

		return this.favoritoRepo.remove(fav);
	}
}
