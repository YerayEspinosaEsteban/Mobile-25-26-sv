// src/screens/FiltersScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
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

const CATEGORIES = [
  { key: "fontaneria", label: "Fontanería" },
  { key: "electricidad", label: "Electricidad" },
  { key: "pintura", label: "Pintura" },
  { key: "cerrajeria", label: "Cerrajería" },
  { key: "climatizacion", label: "Climatización" },
  { key: "jardineria", label: "Jardinería" },
  { key: "limpieza", label: "Limpieza" },
  { key: "albanileria", label: "Albañilería" },
];

export default function FiltersScreen() {
  const navigation = useNavigation<any>();

  const [avatarUri, setAvatarUri] = useState<string>(
    "https://randomuser.me/api/portraits/men/43.jpg",
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/usuario/${CURRENT_USER_ID}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json?.avatarUrl) setAvatarUri(json.avatarUrl);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [publicaciones, setPublicaciones] = useState<PublicacionApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ❤️ ids que vienen de la BD
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // 👉 filtros colapsados / desplegados
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  // ===== FAVORITOS: cargar desde backend cuando entras a la pantalla =====
  const loadFavoritos = useCallback(async () => {
    try {
      const ids = await fetchFavoritoIds();
      setFavoriteIds(ids);
    } catch (e) {
      console.log("[Filters] Error cargando favoritos", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavoritos();
    }, [loadFavoritos]),
  );

  // ===== Categorías / switches =====
  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const toggleOnlyFavorites = () => {
    setOnlyFavorites((prev) => !prev);
  };

  // ===== Cargar publicaciones según filtros =====
  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: string[] = ["page=1", "limit=50"];

      if (searchText.trim()) {
        params.push(`q=${encodeURIComponent(searchText.trim())}`);
      }

      // categorías -> ids "1,3,5"
      if (selectedCategories.length > 0) {
        const mapClaveToId: Record<string, number> = {
          fontaneria: 1,
          electricidad: 2,
          pintura: 3,
          cerrajeria: 4,
          climatizacion: 5,
          jardineria: 6,
          limpieza: 7,
          albanileria: 8,
        };

        const ids = selectedCategories
          .map((key) => mapClaveToId[key])
          .filter((id) => !!id);

        if (ids.length > 0) {
          const joined = ids.join(",");
          params.push(`category=${encodeURIComponent(joined)}`);
        }
      }

      const query = params.length ? `?${params.join("&")}` : "";
      console.log("📡 [Filters] GET", `${API_BASE}/publicacion${query}`);

      const res = await fetch(`${API_BASE}/publicacion${query}`);
      const rawBody = await res.text();
      console.log("📥 [Filters] status", res.status, " body:", rawBody);

      if (!res.ok) {
        throw new Error("Respuesta no OK del backend");
      }

      const json: PublicacionesResponse = JSON.parse(rawBody);
      setPublicaciones(json.publicaciones ?? []);
    } catch (e: any) {
      console.log("Error cargando publicaciones en filtros", e);
      setError("No se pudieron cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar sin filtros al entrar por primera vez
  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const handleApply = () => {
    fetchPublicaciones();
    // colapsamos la zona de filtros para dejar espacio a las cards
    setFiltersCollapsed(true);
  };

  // ===== Toggle favorito CON backend =====
  const handleToggleFavorite = async (id: number) => {
    const yaEsFavorito = favoriteIds.includes(id);

    // optimista
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
      console.log("[Filters] Error actualizando favorito", e);
      // si quieres, aquí podrías hacer rollback del estado
    }
  };

  // aplicar “Solo mis favoritos” en cliente
  const visiblePublicaciones = onlyFavorites
    ? publicaciones.filter((p) => favoriteIds.includes(p.id))
    : publicaciones;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header superior de filtros */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtros</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Header visual (logo + avatar) */}
        <View style={{ height: 24 }} />
        <View style={styles.logoRow}>
          <View style={styles.logoTitleContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="flash" size={22} color="#0B0B0B" />
            </View>
            <View>
              <Text style={styles.appTitle}>Mantenify</Text>
              <Text style={styles.appSubtitle}>
                Ajusta tus filtros de mantenimiento
              </Text>
            </View>
          </View>

          <View style={styles.avatarCircle}>
            <Image
              source={{
                uri: avatarUri,
              }}
              style={styles.avatarImage}
            />
          </View>
        </View>

        {/* === Zona de filtros expandida / colapsada === */}
        {filtersCollapsed ? (
          <>
            <View style={{ height: 24 }} />
            <TouchableOpacity
              style={styles.collapsedBar}
              onPress={() => setFiltersCollapsed(false)}
            >
              <View style={styles.collapsedLeft}>
                <Ionicons name="options" size={18} color="#F2B233" />
                <Text style={styles.collapsedText}>
                  Filtros activos – pulsa para editar
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Buscador */}
            <View style={{ height: 24 }} />
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#777777" />
              <TextInput
                placeholder="Buscar por título, ciudad..."
                placeholderTextColor="#777777"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                onSubmitEditing={handleApply}
              />
            </View>

            {/* Categorías */}
            <View style={{ height: 24 }} />
            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.chipsContainer}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategories.includes(cat.key);
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Filtro favoritos */}
            <View style={{ height: 24 }} />
            <Text style={styles.sectionTitle}>Otros filtros</Text>
            <TouchableOpacity
              style={[
                styles.favoriteRow,
                onlyFavorites && styles.favoriteRowActive,
              ]}
              onPress={toggleOnlyFavorites}
            >
              <View style={styles.favoriteLeft}>
                <Ionicons
                  name="heart"
                  size={18}
                  color={onlyFavorites ? "#0B0B0B" : "#F2B233"}
                />
                <Text
                  style={[
                    styles.favoriteText,
                    onlyFavorites && styles.favoriteTextActive,
                  ]}
                >
                  Solo mis favoritos
                </Text>
              </View>
              <View
                style={[
                  styles.toggleCircle,
                  onlyFavorites && styles.toggleCircleActive,
                ]}
              />
            </TouchableOpacity>

            {/* Botón aplicar */}
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              {loading ? (
                <ActivityIndicator color="#0B0B0B" />
              ) : (
                <Text style={styles.applyText}>Aplicar filtros</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Lista de publicaciones filtradas */}
        <View style={{ flex: 1, marginTop: 16 }}>
          {error && visiblePublicaciones.length === 0 && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <FlatList
            data={visiblePublicaciones}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 16 }}>
                <PublicationCard
                  publicacion={item}
                  isFavorite={favoriteIds.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onPressDetail={(id) =>
                    navigation.navigate("HomeStack", {
                      screen: "Detail",
                      params: { id },
                    } as any)
                  }
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  appSubtitle: {
    color: "#A1A1A1",
    fontSize: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F2B233",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26,26,26,0.6)",
  },
  chipActive: {
    backgroundColor: "#F2B233",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#0B0B0B",
    fontWeight: "600",
  },

  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(26,26,26,0.7)",
  },
  favoriteRowActive: {
    backgroundColor: "#F2B233",
  },
  favoriteLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  favoriteText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  favoriteTextActive: {
    color: "#0B0B0B",
    fontWeight: "600",
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#F2B233",
    backgroundColor: "transparent",
  },
  toggleCircleActive: {
    borderColor: "#0B0B0B",
    backgroundColor: "#0B0B0B",
  },

  applyButton: {
    marginTop: 24,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: {
    color: "#0B0B0B",
    fontWeight: "600",
    fontSize: 15,
  },

  collapsedBar: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(26,26,26,0.9)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  collapsedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  collapsedText: {
    color: "#FFFFFF",
    fontSize: 13,
  },

  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 16,
  },
});
