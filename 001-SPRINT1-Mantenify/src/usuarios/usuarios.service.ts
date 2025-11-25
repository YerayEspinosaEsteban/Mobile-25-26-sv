import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
	constructor(
		@InjectRepository(Usuario)
		private readonly usuarioRepo: Repository<Usuario>,
	) {}

	findAll() {
		return this.usuarioRepo.find();
	}

	findOne(id: number) {
		return this.usuarioRepo.findOne({
			where: { id },
			relations: ['publicaciones'],
		});
	}
}
