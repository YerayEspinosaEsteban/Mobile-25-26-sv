// src/screens/FavoritesScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FavoritoApi, fetchFavoritos, removeFavorito } from "../api/favoritos";
import PublicationCard from "../components/PublicationCard";

const USUARIO_DEMO_ID = 1;

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();

  const [favoritos, setFavoritos] = useState<FavoritoApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavoritos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFavoritos(USUARIO_DEMO_ID);
      setFavoritos(data);
    } catch (e: any) {
      console.log("Error cargando favoritos", e);
      setError("No se pudieron cargar tus favoritos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavoritos();
    }, [loadFavoritos]),
  );

  const handleToggleFavorite = async (publicacionId: number) => {
    // optimista: la quitamos de la lista
    setFavoritos((prev) =>
      prev.filter((fav) => fav.publicacion.id !== publicacionId),
    );

    try {
      await removeFavorito(publicacionId, USUARIO_DEMO_ID);
    } catch (e) {
      console.log("Error quitando favorito", e);
      // si quieres: revertir el cambio si falla
    }
  };

  const handlePressDetail = (id: number) => {
    navigation.navigate("HomeStack", { screen: "Detail", params: { id } } as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Tus favoritos</Text>
        <Ionicons name="heart" size={22} color="#F2B233" />
      </View>

      {loading && favoritos.length === 0 && (
        <View style={styles.center}>
          <ActivityIndicator color="#F2B233" size="large" />
        </View>
      )}

      {error && favoritos.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && favoritos.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={42} color="#777777" />
          <Text style={styles.emptyTitle}>Todavía no tienes favoritos</Text>
          <Text style={styles.emptySubtitle}>
            Marca con el corazón las publicaciones que más te interesen.
          </Text>
        </View>
      )}

      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <PublicationCard
              publicacion={item.publicacion}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
              onPressDetail={handlePressDetail}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 120,
  },
  center: {
    alignItems: "center",
    marginTop: 40,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
  },
  emptyTitle: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptySubtitle: {
    marginTop: 4,
    color: "#A1A1A1",
    fontSize: 13,
    textAlign: "center",
  },
});
