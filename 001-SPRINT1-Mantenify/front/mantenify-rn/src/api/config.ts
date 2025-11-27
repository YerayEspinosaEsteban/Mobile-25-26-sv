// src/api/config.ts

// 💻 Tu backend Nest corriendo en el PC, accesible desde el emulador Android
export const API_BASE = "http://10.0.2.2:3000";

// 🪣 Bucket S3 (solo base, luego haremos `${S3_BASE}/${imagenClave}`)
export const S3_BASE = "https://mantenify-imagenes.s3.amazonaws.com";

// 👤 Usuario “logueado” fijo (para trabajo de clase)
export const CURRENT_USER_ID = 1;

// Helper sencillo para GET
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} - ${text}`);
  }

  return (await res.json()) as T;
}
