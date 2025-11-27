import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import YoutubePlayer from 'react-native-youtube-iframe';
import { S3_BASE } from "../api/config";
import { addFavorito, fetchFavoritoIds, removeFavorito } from "../api/favoritos";
import { getPublicacion } from "../api/publicaciones";
import { PublicacionApi } from "../types/publicacion";

type DetailRouteParams = { id: number };

function extractYoutubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  // capture 11-character YouTube ids from youtu.be, watch?v=, or /shorts/
  const re = /(?:youtube\.com.*[?&]v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const m = url.match(re);
  return m ? m[1] : null;
}

export default function DetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as DetailRouteParams) || { id: 0 };

  const [data, setData] = useState<PublicacionApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritosIds, setFavoritosIds] = useState<number[]>([]);
  const isFavorite = favoritosIds.includes(id);
  const videoRef = useRef<Video | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const loadFavoritos = useCallback(async () => {
    try {
      const ids = await fetchFavoritoIds();
      setFavoritosIds(ids);
    } catch {}
  }, []);

  const loadDetalle = useCallback(async () => {
    setLoading(true);
    setError(null);
    const pub = await getPublicacion(id);
    if (!pub) {
      setError("No se pudo cargar la publicación");
    }
    setData(pub);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadDetalle();
    loadFavoritos();
  }, [loadDetalle, loadFavoritos]);

  const toggleFavorito = async () => {
    try {
      if (isFavorite) {
        await removeFavorito(id);
        setFavoritosIds((prev) => prev.filter((x) => x !== id));
      } else {
        await addFavorito(id);
        setFavoritosIds((prev) => [...prev, id]);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar favorito");
    }
  };

  const thumbnailUri = data?.imagenClave ? `${S3_BASE}/${data.imagenClave}` : undefined;
  const youtubeId = extractYoutubeId(data?.videoUrl ?? null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        {/* Header bajado */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (typeof (navigation as any).canGoBack === 'function' && (navigation as any).canGoBack()) {
                navigation.goBack();
              } else {
                // Fallback a pantalla Home dentro del stack
                // @ts-ignore
                navigation.navigate('Home');
              }
            }}
            activeOpacity={0.7}
            accessibilityLabel="Volver"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>Detalle</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color="#F2B233" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadDetalle}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && data && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Usuario y rating */}
            <View style={styles.userRow}>
              <View style={styles.avatarWrapper}>
                {data.usuario?.avatarUrl ? (
                  <Image source={{ uri: data.usuario.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>{data.usuario?.nombre?.charAt(0) ?? "T"}</Text>
                  </View>
                )}
              </View>
              <View style={styles.userTextBlock}>
                <Text style={styles.userName}>{data.usuario?.nombre ?? "Técnico"}</Text>
                <Text style={styles.cityText}>{data.ciudad}</Text>
              </View>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>{data.valoracion ?? "4.0"}</Text>
              </View>
            </View>

            {/* Texto */}
            <Text style={styles.title}>{data.titulo}</Text>
            <Text style={styles.description}>{data.descripcion}</Text>

            {/* Imagen */}
            {thumbnailUri && <Image source={{ uri: thumbnailUri }} style={styles.imagePlain} />}

            {/* Precio */}
            <Text style={styles.price}>Desde {data.precioBase} €</Text>

            {/* Video: si es YouTube usamos WebView embed, si no usamos expo-av Video */}
            {data.videoUrl ? (
              youtubeId ? (
                // Embed YouTube using react-native-youtube-iframe; add a fallback button below
                <View style={{ marginHorizontal: 13, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' }}>
                  <YoutubePlayer
                    height={215}
                    play={false}
                    videoId={youtubeId}
                  />

                  <TouchableOpacity
                    style={[styles.youtubeFallback, { justifyContent: 'center' }]}
                    onPress={() => {
                      const url = data.videoUrl || `https://www.youtube.com/watch?v=${youtubeId}`;
                      Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir YouTube'));
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="logo-youtube" size={18} color="#FFFFFF" />
                    <Text style={[styles.youtubeTitle, { marginLeft: 10, fontSize: 14 }]}>Abrir en YouTube</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.videoContainer}>
                  {videoLoading && !videoError && (
                    <View style={styles.videoLoadingOverlay}>
                      <ActivityIndicator color="#F2B233" />
                      <Text style={styles.videoLoadingText}>Cargando video...</Text>
                    </View>
                  )}
                  {videoError && (
                    <View style={styles.videoErrorBox}>
                      <Ionicons name="alert-circle" size={28} color="#F2B233" />
                      <Text style={styles.videoErrorText}>Video no disponible</Text>
                    </View>
                  )}
                  {!videoError && (
                    <Video
                      ref={videoRef}
                      source={{ uri: data.videoUrl }}
                      style={styles.video}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      onLoadStart={() => { setVideoLoading(true); setVideoError(null); }}
                      onReadyForDisplay={() => setVideoLoading(false)}
                      onError={(e) => { setVideoLoading(false); setVideoError('error'); console.log('Video error', e); }}
                    />
                  )}
                </View>
              )
            ) : null}

            {/* Favorito debajo del video */}
            <TouchableOpacity style={styles.inlineFavBtn} onPress={toggleFavorito} activeOpacity={0.85}>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#F2B233" : "#FFFFFF"} />
              <Text style={styles.inlineFavText}>{isFavorite ? "En favoritos" : "Agregar a favoritos"}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#050509" },
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 32 : 42,
    paddingBottom: 24,
    marginTop: 12,
    marginBottom: 8,
  },
  backBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  topTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 8, color: "#C6C6C6" },
  errorText: { color: "#FF6B6B", fontSize: 14 },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8,  backgroundColor: "#F2B233" },
  retryText: { color: "#0B0B0B", fontWeight: "600" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 130, paddingTop: 4 },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  avatarWrapper: { width: 48, height: 48,  overflow: "hidden", backgroundColor: "#1A1A1A" },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarInitial: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  userTextBlock: { flex: 1, marginLeft: 18 },
  userName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginBottom: 2 },
  cityText: { color: "#A1A1A1", fontSize: 13 },
  ratingPill: { minWidth: 44, paddingHorizontal: 12, paddingVertical: 6,  backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center" },
  ratingText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  description: { color: "#C6C6C6", fontSize: 15, lineHeight: 22, marginBottom: 22 },
  imagePlain: { width: "100%", aspectRatio: 1, marginBottom: 26 },
  price: { color: "#F2B233", fontSize: 16, fontWeight: "700", marginBottom: 24 },
  videoContainer: { marginBottom: 24,  overflow: "hidden", backgroundColor: "#000",  position: 'relative' },
  video: { width: "100%", aspectRatio: 16/9 },
  videoLoadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', gap: 10 },
  videoLoadingText: { color: '#FFFFFF', marginTop: 8, fontSize: 13 },
  videoErrorBox: { width: '100%', aspectRatio: 16/9, justifyContent: 'center', alignItems: 'center', gap: 8 },
  videoErrorText: { color: '#F2B233', fontSize: 14, fontWeight: '600' },
  inlineFavBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.08)", paddingVertical: 16, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  inlineFavText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  youtubeFallback: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  youtubeTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  youtubeSubtitle: { color: '#C6C6C6', fontSize: 12, marginTop: 4 },
});
