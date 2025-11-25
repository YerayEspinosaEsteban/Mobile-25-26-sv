import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { FilterPublicacionesDto } from './dtos/filter-publicaciones.dto';
import { CreatePublicacionDto } from './dtos/create-publicacion.dto';

@Controller('publicaciones')
export class PublicacionesController {
	constructor(private readonly publicacionesService: PublicacionesService) {}

	@Get()
	findAll(@Query() filters: FilterPublicacionesDto) {
		return this.publicacionesService.findAll(filters);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.publicacionesService.findOne(Number(id));
	}

	@Post()
	create(@Body() dto: CreatePublicacionDto) {
		const usuarioDemoId = 1;
		return this.publicacionesService.create(dto, usuarioDemoId);
	}

		@Get('populares')
	getMostFavorited() {
		return this.publicacionesService.findMostFavorited(10);
	}

		// Alias compatible con rutas antiguas
		@Get('popular/top')
		getMostFavoritedAlias() {
			return this.publicacionesService.findMostFavorited(10);
		}
}
