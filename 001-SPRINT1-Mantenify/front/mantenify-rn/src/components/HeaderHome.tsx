import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type HeaderUser = {
  id: number;
  nombre: string;
  avatarUrl: string | null;
};

type Props = {
  user: HeaderUser | null;
};

export default function HeaderHome({ user }: Props) {
  const inicial =
    user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? "M";

  return (
    <View style={styles.container}>
      {/* Logo / icono app */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="flash" size={22} color="#0B0B0B" />
        </View>
        <View>
          <Text style={styles.title}>Mantenify</Text>
          <Text style={styles.subtitle}>
            Trucos y pros de mantenimiento
          </Text>
        </View>
      </View>

      {/* Avatar usuario */}
      <View style={styles.avatarWrapper}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{inicial}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
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
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#A1A1A1",
    fontSize: 12,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
