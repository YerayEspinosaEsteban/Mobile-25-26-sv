import { Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';

@Controller()
export class FavoritosController {
	constructor(private readonly favoritosService: FavoritosService) {}

	// Español
	@Get('usuarios/:id/favoritos')
	getUserFavorites(@Param('id') id: string) {
		return this.favoritosService.getUserFavorites(Number(id));
	}

	// Alias inglés legacy
	@Get('users/:id/favorites')
	getUserFavoritesAlias(@Param('id') id: string) {
		return this.favoritosService.getUserFavorites(Number(id));
	}

	// Español
	@Post('favoritos/:publicacionId')
	addFavorite(@Param('publicacionId') publicacionId: string) {
		const usuarioDemoId = 1;
		return this.favoritosService.addFavorite(usuarioDemoId, Number(publicacionId));
	}

	// Alias inglés legacy
	@Post('favorites/:publicacionId')
	addFavoriteAlias(@Param('publicacionId') publicacionId: string) {
		const usuarioDemoId = 1;
		return this.favoritosService.addFavorite(usuarioDemoId, Number(publicacionId));
	}

	// Español
	@Delete('favoritos/:publicacionId')
	removeFavorite(@Param('publicacionId') publicacionId: string) {
		const usuarioDemoId = 1;
		return this.favoritosService.removeFavorite(usuarioDemoId, Number(publicacionId));
	}

	// Alias inglés legacy
	@Delete('favorites/:publicacionId')
	removeFavoriteAlias(@Param('publicacionId') publicacionId: string) {
		const usuarioDemoId = 1;
		return this.favoritosService.removeFavorite(usuarioDemoId, Number(publicacionId));
	}
}
