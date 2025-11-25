import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsNotEmpty({ message: 'thumbnailKey es obligatorio' })
  thumbnailKey: string; // se guardará en imagen_clave

  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @Matches(/(youtube\.com|youtu\.be)/, {
    message: 'videoUrl debe ser una URL de YouTube',
  })
  videoUrl: string;

  // slugs de categorías separados por comas: "fontaneria,electricidad"
  @IsString()
  @IsOptional()
  categories?: string;
}
