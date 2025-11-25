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

  // ⚠️ pon la de populares antes de ':id' para evitar conflictos
  @Get('populares/top')
  getMostFavorited() {
    return this.publicacionesService.findMostFavorited(10);
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
}

