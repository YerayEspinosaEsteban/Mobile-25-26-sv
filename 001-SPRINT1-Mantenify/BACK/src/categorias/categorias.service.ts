import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriasService {
	constructor(
		@InjectRepository(Categoria)
		private readonly categoriaRepo: Repository<Categoria>,
	) {}

	findAll() {
		return this.categoriaRepo.find();
	}
}
