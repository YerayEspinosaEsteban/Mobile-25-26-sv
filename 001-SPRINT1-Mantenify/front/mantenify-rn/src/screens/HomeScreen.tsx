// src/screens/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
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

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [publicaciones, setPublicaciones] = useState<PublicacionApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState("");

  // ❤️ ids que vienen de la BD
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [avatarUri, setAvatarUri] = useState<string>(
    "https://randomuser.me/api/portraits/lego/7.jpg",
  );

  // ---------- Cargar favoritos desde el backend ----------
  const loadFavoritos = useCallback(async () => {
    try {
      const ids = await fetchFavoritoIds();
      setFavoriteIds(ids);
    } catch (e) {
      console.log("Error cargando favoritos", e);
    }
  }, []);

  // Cada vez que entras a Home se actualizan los favoritos
  useFocusEffect(
    useCallback(() => {
      loadFavoritos();
    }, [loadFavoritos]),
  );

  // ---------- Cargar publicaciones desde backend ----------
  const fetchPublicaciones = useCallback(
    async (opts?: { q?: string }) => {
      try {
        setLoading(true);
        setError(null);

        const q = opts?.q ?? (searchText.trim() || undefined);

        const params: string[] = ["page=1", "limit=50"];
        if (q) {
          params.push(`q=${encodeURIComponent(q)}`);
        }

        const query = params.length ? `?${params.join("&")}` : "";
        console.log("📡 GET", `${API_BASE}/publicacion${query}`);

        const res = await fetch(`${API_BASE}/publicacion${query}`);
        const rawBody = await res.text();
        console.log("📥 status", res.status, " body:", rawBody);

        if (!res.ok) {
          throw new Error("Respuesta no OK del backend");
        }

        const json: PublicacionesResponse = JSON.parse(rawBody);
        setPublicaciones(json.publicaciones ?? []);
      } catch (e: any) {
        console.log("Error cargando publicaciones", e);
        setError("No se pudieron cargar las publicaciones.");
      } finally {
        setLoading(false);
      }
    },
    [searchText],
  );

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  // Cargar avatar del usuario configurado (CURRENT_USER_ID)
  useEffect(() => {
    let mounted = true;
    const loadAvatar = async () => {
      try {
        const res = await fetch(`${API_BASE}/usuario/${CURRENT_USER_ID}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json?.avatarUrl) setAvatarUri(json.avatarUrl);
      } catch (e) {
        console.log("Error cargando avatar usuario", e);
      }
    };

    loadAvatar();
    return () => {
      mounted = false;
    };
  }, []);

  // Reload publicaciones when screen gains focus (e.g., after creating a new one)
  useFocusEffect(
    useCallback(() => {
      fetchPublicaciones();
    }, [fetchPublicaciones]),
  );

  // ---------- Handlers de búsqueda ----------
  const handleSearchSubmit = () => {
    fetchPublicaciones({ q: searchText });
  };

  // ---------- Toggle favorito con backend ----------
  const handleToggleFavorite = async (id: number) => {
    const yaEsFavorito = favoriteIds.includes(id);

    // actualización optimista en UI
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
      console.log("Error actualizando favorito", e);
    }
  };

  // ---------- Header que se mueve con el scroll (buscador + carrusel) ----------
  const renderScrollableHeader = () => (
    <View style={styles.scrollHeader}>
      {/* espacio debajo de la appbar fija */}
      <View style={{ height: 8 }} />

      {/* Buscador + botón filtros */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#777777" />
          <TextInput
            placeholder="Buscar trucos, ciudad..."
            placeholderTextColor="#777777"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate("Filters" as never)}
        >
          <Ionicons name="options" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* carrusel de usuarios */}
      <View style={{ height: 20 }} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScrollContent}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {[
          {
            nombre: "Pedro",
            uri: "https://randomuser.me/api/portraits/men/31.jpg",
          },
          {
            nombre: "Laura",
            uri: "https://randomuser.me/api/portraits/women/32.jpg",
          },
          {
            nombre: "Adrian",
            uri: "https://randomuser.me/api/portraits/men/43.jpg",
          },
          {
            nombre: "Manuel",
            uri: "https://randomuser.me/api/portraits/men/44.jpg",
          },
          {
            nombre: "Javier",
            uri: "https://randomuser.me/api/portraits/men/45.jpg",
          },
        ].map((user, idx) => (
          <View key={idx} style={styles.storyItem}>
            <View style={styles.storyRing}>
              <Image source={{ uri: user.uri }} style={styles.storyAvatar} />
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              {user.nombre}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* separación antes de la lista */}
      <View style={{ height: 24 }} />
    </View>
  );

  // ---------- Render ----------

  if (loading && publicaciones.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {/* 🔸 AppBar fija */}
        <View style={styles.appBar}>
          <View style={styles.logoTitleContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="flash" size={22} color="#0B0B0B" />
            </View>
            <View>
              <Text style={styles.appTitle}>Mantenify</Text>
              <Text style={styles.appSubtitle}>
                Trucos y pros de mantenimiento
              </Text>
            </View>
          </View>

          <View style={styles.avatarCircle}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          </View>
        </View>

        <View style={styles.centered}>
          <ActivityIndicator color="#F2B233" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && publicaciones.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {/* AppBar fija */}
        <View style={styles.appBar}>
          <View style={styles.logoTitleContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="flash" size={22} color="#0B0B0B" />
            </View>
            <View>
              <Text style={styles.appTitle}>Mantenify</Text>
              <Text style={styles.appSubtitle}>
                Trucos y pros de mantenimiento
              </Text>
            </View>
          </View>

          <View style={styles.avatarCircle}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          </View>
        </View>

        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* 🔸 Barra fija con solo logo app + nombre + avatar */}
      <View style={styles.appBar}>
        <View style={styles.logoTitleContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="flash" size={22} color="#0B0B0B" />
          </View>
          <View>
            <Text style={styles.appTitle}>Mantenify</Text>
            <Text style={styles.appSubtitle}>
              Trucos y pros de mantenimiento
            </Text>
          </View>
        </View>

        <View style={styles.avatarCircle}>
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        </View>
      </View>

      {/* 🔸 Todo lo demás hace scroll */}
      <FlatList
        data={publicaciones}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderScrollableHeader}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <PublicationCard
              publicacion={item}
              isFavorite={favoriteIds.includes(item.id)}
              onToggleFavorite={handleToggleFavorite}
              onPressDetail={(id) => navigation.navigate("Detail", { id })}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={async () => {
          try {
            setRefreshing(true);
            await fetchPublicaciones();
          } finally {
            setRefreshing(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  appBar: {
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#0B0B0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollHeader: {
    marginTop: 4,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchContainer: {
    flex: 1,
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(26,26,26,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  storiesScrollContent: {
    paddingRight: 16,
    paddingLeft: 4,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 14,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  storyName: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 11,
    maxWidth: 64,
    textAlign: "center",
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 32,
  },
});
