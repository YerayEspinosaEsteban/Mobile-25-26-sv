import { Controller, Get } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller()
export class CategoriasController {
	constructor(private readonly categoriasService: CategoriasService) {}

	// Español: GET /categorias
	@Get('categorias')
	findAll() {
		return this.categoriasService.findAll();
	}

	// Inglés legacy: GET /categories
	@Get('categories')
	findAllLegacy() {
		return this.categoriasService.findAll();
	}
}
