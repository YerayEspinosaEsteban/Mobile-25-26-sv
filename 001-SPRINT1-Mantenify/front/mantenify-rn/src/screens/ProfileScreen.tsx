// src/screens/ProfileScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE, CURRENT_USER_ID } from "../api/config";
import {
  addFavorito,
  fetchFavoritoIds,
  removeFavorito,
} from "../api/favoritos";
import PublicationCard from "../components/PublicationCard";
import {
  PublicacionApi,
  PublicacionesResponse,
} from "../types/publicacion";

// usamos usuario fijo desde la config
const USUARIO_DEMO_ID = CURRENT_USER_ID;

// Tipo mínimo para el usuario que viene de /usuario/:id
type UsuarioApi = {
  id: number;
  nombre: string;
  avatarUrl: string | null;
  // si en el futuro añades ciudad al usuario, la podrás usar aquí
  // ciudad?: string | null;
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [usuario, setUsuario] = useState<UsuarioApi | null>(null);

  const [publicaciones, setPublicaciones] = useState<PublicacionApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ---------- Cargar datos usuario ----------
  const fetchUsuario = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/usuario/${USUARIO_DEMO_ID}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar el usuario");
      }
      const json: UsuarioApi = await res.json();
      setUsuario(json);
    } catch (e) {
      console.log("Error cargando usuario de perfil", e);
    }
  }, []);

  // ---------- Favoritos desde backend ----------
  const loadFavoritos = useCallback(async () => {
    try {
      const ids = await fetchFavoritoIds();
      setFavoriteIds(ids);
    } catch (e) {
      console.log("Error cargando favoritos (perfil)", e);
    }
  }, []);

  // ---------- Publicaciones del usuario ----------
  const fetchMisPublicaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = ["page=1", "limit=50"];
      const query = `?${params.join("&")}`;

      console.log("📡 [Perfil] GET", `${API_BASE}/publicacion${query}`);
      const res = await fetch(`${API_BASE}/publicacion${query}`);
      const rawBody = await res.text();
      console.log("📥 [Perfil] status", res.status, " body:", rawBody);

      if (!res.ok) {
        throw new Error("Respuesta no OK del backend");
      }

      const json: PublicacionesResponse = JSON.parse(rawBody);
      const all = json.publicaciones ?? [];

      // solo publicaciones cuyo usuario sea el USUARIO_DEMO_ID
      const mine = all.filter(
        (p) => p.usuario && p.usuario.id === USUARIO_DEMO_ID,
      );

      setPublicaciones(mine);
    } catch (e: any) {
      console.log("Error cargando publicaciones en perfil", e);
      setError("No se pudieron cargar tus publicaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Efecto inicial ----------
  useEffect(() => {
    fetchUsuario();
    fetchMisPublicaciones();
    loadFavoritos();
  }, [fetchUsuario, fetchMisPublicaciones, loadFavoritos]);

  // Recargar cuando la pantalla gana foco (vuelves desde Create/Detail)
  useEffect(() => {
    const onFocus = () => {
      fetchMisPublicaciones();
      loadFavoritos();
    };

    // React Navigation focus handled elsewhere; simplest is to re-run on mount
    // and offer pull-to-refresh. If you use useFocusEffect elsewhere, we can
    // switch to that pattern.
    onFocus();
  }, [fetchMisPublicaciones, loadFavoritos]);

  // ---------- Toggle favorito ----------
  const handleToggleFavorite = async (id: number) => {
    const yaEsFavorito = favoriteIds.includes(id);

    // actualización optimista
    setFavoriteIds((prev) =>
      yaEsFavorito ? prev.filter((x) => x !== id) : [...prev, id],
    );

    try {
      if (yaEsFavorito) {
        await removeFavorito(id);
      } else {
        await addFavorito(id);
      }
    } catch (e) {
      console.log("Error actualizando favorito (perfil)", e);
    }
  };

  // ---------- Header de perfil ----------
  const renderProfileHeader = () => {
    const totalTrabajos = publicaciones.length;
    const totalFavoritos = favoriteIds.length;

    const avatarUri =
      usuario?.avatarUrl ??
      "https://randomuser.me/api/portraits/men/43.jpg";

    const nombreMostrar = usuario?.nombre ?? "Mi perfil";

    return (
      <View style={styles.profileHeader}>
        {/* Avatar + nombre + botón editar */}
        <View style={styles.headerTopRow}>
          <View style={styles.avatarBigWrapper}>
            <Image source={{ uri: avatarUri }} style={styles.avatarBig} />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.profileName}>{nombreMostrar}</Text>
            <View style={styles.cityRow}>
              <Ionicons name="flash" size={14} color="#F2B233" />
              <Text style={styles.profileCity}>Técnico Mantenify</Text>
            </View>
          </View>

          {/* Botón editar sin funcionalidad real */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              console.log("Editar perfil (sin funcionalidad todavía)");
            }}
          >
            <Ionicons name="create-outline" size={18} color="#0B0B0B" />
          </TouchableOpacity>
        </View>

        {/* Bio (de momento fija, puedes cambiarla cuando añadas campo en BD) */}
        <Text style={styles.bioText}>
          Compartiendo trucos y soluciones rápidas de mantenimiento en casa.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.7</Text>
            <Text style={styles.statLabel}>Valoración media</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalTrabajos}</Text>
            <Text style={styles.statLabel}>Trabajos creados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalFavoritos}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
        </View>

        {/* Botones extra (solo UI) */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => console.log("Editar perfil (botón grande)")}
          >
            <Text style={styles.primaryActionText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => console.log("Configurar cuenta")}
          >
            <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            <Text style={styles.secondaryActionText}>Configuración</Text>
          </TouchableOpacity>
        </View>

        {/* Separador + título de sección */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis publicaciones</Text>
          <Text style={styles.sectionCount}>{totalTrabajos}</Text>
        </View>
      </View>
    );
  };

  // ---------- Render principal ----------
  if (loading && publicaciones.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color="#F2B233" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={publicaciones}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderProfileHeader}
        renderItem={({ item }) => (
          <PublicationCard
            publicacion={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={handleToggleFavorite}
            onPressDetail={(id) =>
              navigation.navigate("HomeStack", { screen: "Detail", params: { id } } as any)
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={async () => {
          try {
            setRefreshing(true);
            await fetchMisPublicaciones();
          } finally {
            setRefreshing(false);
          }
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              Todavía no tienes publicaciones.
            </Text>
          ) : null
        }
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  /* ---- Header perfil ---- */
  profileHeader: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBigWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#F2B233",
    overflow: "hidden",
  },
  avatarBig: {
    width: "100%",
    height: "100%",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  profileCity: {
    color: "#A1A1A1",
    fontSize: 13,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  bioText: {
    marginTop: 12,
    color: "#C6C6C6",
    fontSize: 13,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statLabel: {
    marginTop: 4,
    color: "#A1A1A1",
    fontSize: 11,
    textAlign: "center",
  },

  actionsRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },
  primaryActionButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    color: "#0B0B0B",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    height: 44,
  },
  secondaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
  },

  sectionHeader: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionCount: {
    color: "#A1A1A1",
    fontSize: 13,
  },

  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#A1A1A1",
  },
  errorText: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    color: "#FF6B6B",
  },
});
