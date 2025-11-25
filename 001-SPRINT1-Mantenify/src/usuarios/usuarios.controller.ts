import { Controller, Get, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
	constructor(private readonly usuariosService: UsuariosService) {}

	@Get()
	findAll() {
		return this.usuariosService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.usuariosService.findOne(Number(id));
	}
}
