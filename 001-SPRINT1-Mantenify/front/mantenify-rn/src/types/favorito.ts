// src/types/favorito.ts
import { PublicacionApi } from "./publicacion";

export type FavoritoApi = {
  id: number;
  publicacion: PublicacionApi;
  creadoEn?: string;
};
