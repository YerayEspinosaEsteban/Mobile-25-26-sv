// src/api/publicaciones.ts
import { PublicacionApi } from "../types/publicacion";
import { API_BASE, CURRENT_USER_ID } from "./config";

export type PublicacionesResponse = {
  total: number;
  publicaciones: PublicacionApi[];
};

// 🔹 Versión simplificada: de momento NO usamos filtros, sólo GET /publicacion
export async function getPublicaciones(): Promise<PublicacionesResponse> {
  const url = `${API_BASE}/publicacion`;

  console.log("📡 Llamando a:", url);

  const res = await fetch(url);

  // ---- DEBUG GORDO: ver exactamente qué responde Nest ----
  const rawText = await res.text();
  console.log(
    "📥 Respuesta /publicacion -> status:",
    res.status,
    res.statusText,
    "body:",
    rawText,
  );

  // Si no es OK, devolvemos lista vacía para que no rompa la UI
  if (!res.ok) {
    throw new Error("Respuesta no OK del backend");
  }

  // Si es OK, parseamos el JSON
  const json = JSON.parse(rawText) as PublicacionesResponse;
  return json;
}

// 🔹 Traer una sola publicación por ID (detalle)
export async function getPublicacion(id: number): Promise<PublicacionApi | null> {
  const url = `${API_BASE}/publicacion/${id}`;
  console.log("📡 Llamando a detalle:", url);
  try {
    const res = await fetch(url);
    const raw = await res.text();
    console.log("📥 Respuesta detalle ->", res.status, res.statusText, raw);
    if (!res.ok) {
      return null;
    }
    const json = JSON.parse(raw) as PublicacionApi;
    return json;
  } catch (e) {
    console.log("❌ Error fetch detalle", e);
    return null;
  }
}

// 🔹 Crear nueva publicación (POST /publicacion)
export async function createPublicacion(payload: Partial<PublicacionApi>): Promise<PublicacionApi> {
  const url = `${API_BASE}/publicacion`;
  console.log("📡 POST ->", url, payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // El servidor espera `usuario_id` en el DTO; enviamos ese campo.
    body: JSON.stringify({ ...payload, usuario_id: CURRENT_USER_ID }),
  });

  const raw = await res.text();
  console.log("📥 Respuesta POST /publicacion ->", res.status, raw);

  if (!res.ok) {
    throw new Error(`Error creando publicación: ${res.status} ${raw}`);
  }

  return JSON.parse(raw) as PublicacionApi;
}
