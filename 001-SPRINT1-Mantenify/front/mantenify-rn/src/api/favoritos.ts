// src/api/favoritos.ts
import { API_BASE } from "./config";
import { PublicacionApi } from "../types/publicacion";

const USUARIO_DEMO_ID = 1;

// Lo que devuelve tu backend en /favorito
export type FavoritoApi = {
  id: number;
  publicacion: PublicacionApi; // viene con la publicacion completa (por las relations)
  creadoEn: string;
};

// 🔹 Trae TODOS los favoritos (publicaciones completas)
export async function fetchFavoritos(
  usuarioId: number = USUARIO_DEMO_ID,
): Promise<FavoritoApi[]> {
  const res = await fetch(
    `${API_BASE}/favorito?usuario_id=${usuarioId}`,
  );

  const raw = await res.text();

  if (!res.ok) {
    console.log("Error GET /favorito", res.status, raw);
    throw new Error("Error al cargar favoritos");
  }

  return JSON.parse(raw) as FavoritoApi[];
}

// 🔹 Trae sólo los ids de publicaciones marcadas como favorito
export async function fetchFavoritoIds(
  usuarioId: number = USUARIO_DEMO_ID,
): Promise<number[]> {
  const favoritos = await fetchFavoritos(usuarioId);
  return favoritos.map((fav) => fav.publicacion.id);
}

// 🔹 Marca una publicación como favorita
export async function addFavorito(
  publicacionId: number,
  usuarioId: number = USUARIO_DEMO_ID,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/favorito/${publicacionId}?usuario_id=${usuarioId}`,
    {
      method: "POST",
    },
  );

  const raw = await res.text();
  if (!res.ok) {
    console.log("Error POST /favorito", res.status, raw);
    throw new Error("Error al crear favorito");
  }
}

// 🔹 Quita una publicación de favoritos
export async function removeFavorito(
  publicacionId: number,
  usuarioId: number = USUARIO_DEMO_ID,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/favorito/${publicacionId}?usuario_id=${usuarioId}`,
    {
      method: "DELETE",
    },
  );

  const raw = await res.text();
  if (!res.ok) {
    console.log("Error DELETE /favorito", res.status, raw);
    throw new Error("Error al eliminar favorito");
  }
}
