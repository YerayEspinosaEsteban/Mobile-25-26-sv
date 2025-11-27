// src/components/PublicationCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { S3_BASE } from "../api/config";
import { PublicacionApi } from "../types/publicacion";

type Props = {
  publicacion: PublicacionApi;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onPressDetail?: (id: number) => void;
};

const PublicationCard: React.FC<Props> = ({
  publicacion,
  isFavorite,
  onToggleFavorite,
  onPressDetail,
}) => {
  const thumbnailUri =
    publicacion.imagenClave && publicacion.imagenClave !== ""
      ? `${S3_BASE}/${publicacion.imagenClave}`
      : undefined;

  const handleFavoritePress = () => {
    if (onToggleFavorite) {
      onToggleFavorite(publicacion.id);
    }
  };

  const handleImagePress = () => {
    if (onPressDetail) {
      onPressDetail(publicacion.id);
    }
  };

  const handleCardPress = () => {
    if (onPressDetail) onPressDetail(publicacion.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handleCardPress}
      style={styles.card}
    >
      {/* ───────── Línea superior: usuario + ciudad + rating ───────── */}
      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <View style={styles.avatarWrapper}>
            {publicacion.usuario?.avatarUrl ? (
              <Image
                source={{ uri: publicacion.usuario.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {publicacion.usuario?.nombre?.charAt(0) ?? "T"}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.userName}>
              {publicacion.usuario?.nombre ?? "Técnico Mantenify"}
            </Text>
            <Text style={styles.cityText}>{publicacion.ciudad}</Text>
          </View>
        </View>

        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>
            {publicacion.valoracion ?? "4.0"}
          </Text>
        </View>
      </View>

      {/* ───────── Foto cuadrada (clicable) ───────── */}
      {thumbnailUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: thumbnailUri }} style={styles.image} />
        </View>
      )}

      {/* ───────── Línea inferior: corazón + título/desc corta ───────── */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "#F2B233" : "#FFFFFF"}
          />
        </TouchableOpacity>

        <View style={styles.captionContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {publicacion.titulo}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {publicacion.descripcion}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PublicationCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },

  /* ─── TOP LINE ─── */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cityText: {
    color: "#A1A1A1",
    fontSize: 12,
  },
  ratingPill: {
    minWidth: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ─── IMAGE ─── */
  imageContainer: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "#000000",
  },
  image: {
    width: "100%",
    aspectRatio: 1, // cuadrada
  },

  /* ─── BOTTOM LINE ─── */
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  heartButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  captionContainer: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    marginTop: 2,
    color: "#C6C6C6",
    fontSize: 12,
  },
});
