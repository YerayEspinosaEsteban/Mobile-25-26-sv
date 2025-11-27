// src/types/publicacion.ts

// 👤 Tipo de usuario que viene del backend
export type UsuarioApi = {
  id: number;
  nombre: string;
  correo?: string;
  avatarUrl: string | null;
  rol?: "admin" | "usuario";
  creadoEn?: string;
  actualizadoEn?: string;
};

// 🛠 Publicación
// src/types/publicacion.ts

export type PublicacionApi = {
  id: number;
  titulo: string;
  descripcion: string;
  precioBase: string; // PG numérico llega como string
  ciudad: string;
  imagenClave: string;
  videoUrl: string;
  valoracion: number | null;
  numeroValoraciones: number | null;
  creadoEn?: string;
  actualizadoEn?: string;
  usuario?: {
    id: number;
    nombre: string;
    avatarUrl: string | null;
  };
};

export type PublicacionesResponse = {
  total: number;
  publicaciones: PublicacionApi[];
};
