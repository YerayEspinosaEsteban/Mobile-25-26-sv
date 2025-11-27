// src/screens/CreateItemScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE, CURRENT_USER_ID } from "../api/config";
import { createPublicacion } from "../api/publicaciones";

export default function CreateItemScreen() {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState("");
  const [ciudad, setCiudad] = useState("");
  // categorías disponibles (clave -> id)
  const CATEGORIES = [
    { id: 1, key: "fontaneria", label: "Fontanería" },
    { id: 2, key: "electricidad", label: "Electricidad" },
    { id: 3, key: "pintura", label: "Pintura" },
    { id: 4, key: "cerrajeria", label: "Cerrajería" },
    { id: 5, key: "climatizacion", label: "Climatización" },
    { id: 6, key: "jardineria", label: "Jardinería" },
    { id: 7, key: "limpieza", label: "Limpieza" },
    { id: 8, key: "albanileria", label: "Albañilería" },
  ];

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [precioBase, setPrecioBase] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagenClave, setImagenClave] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [descripcion, setDescripcion] = useState("");

  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!titulo.trim() || !descripcion.trim() || !imagenClave.trim()) {
      Alert.alert(
        "Faltan datos",
        "Título, descripción e imagen son obligatorios.",
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        precioBase: String(Number(precioBase) || 0),
        ciudad: ciudad.trim(),
        videoUrl: videoUrl.trim(),
        imagenClave: imagenClave.trim(),
      };

      if (selectedCategoryId !== null) {
        (payload as any).categorias = [selectedCategoryId];
      }

      const created = await createPublicacion(payload);

      Alert.alert("Listo ✅", "Tu truco se ha publicado correctamente.", [
        {
          text: "Ver detalle",
          onPress: () => {
            (navigation as any).navigate("Detail", { id: created.id });
          },
        },
        { text: "Volver", style: "cancel" },
      ]);

      // limpiar formulario
      setTitulo("");
      setCiudad("");
      setPrecioBase("");
      setVideoUrl("");
      setImagenClave("");
      setDescripcion("");
    } catch (e: any) {
      console.log("Error creando publicación", e);
      Alert.alert(
        "Ups",
        "No se pudo crear la publicación. Revisa los datos o el backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <Modal
          visible={categoryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCategoryModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={CATEGORIES}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCategoryId(item.id);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text style={{ color: "#FFFFFF" }}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER: logo + usuario */}
          <View style={styles.header}>
            <View style={styles.logoTitleContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="flash" size={22} color="#0B0B0B" />
              </View>
              <View>
                <Text style={styles.appTitle}>Mantenify</Text>
                <Text style={styles.appSubtitle}>
                  Crea un nuevo truco de mantenimiento
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

          <View style={{ height: 24 }} />

          {/* FORMULARIO */}
          <View style={styles.card}>
            {/* Título */}
            <Text style={styles.label}>Título del truco</Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Cambiar un enchufe de forma segura"
              placeholderTextColor="#777777"
              style={styles.input}
            />

            {/* Ciudad + Precio en fila */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  value={ciudad}
                  onChangeText={setCiudad}
                  placeholder="Madrid, Barcelona..."
                  placeholderTextColor="#777777"
                  style={styles.input}
                />
              </View>

                {/* placeholder column to keep spacing */}
                <View style={{ width: 8 }} />

              <View style={{ width: 110 }}>
                <Text style={styles.label}>Precio base €</Text>
                <TextInput
                  value={precioBase}
                  onChangeText={setPrecioBase}
                  placeholder="35"
                  placeholderTextColor="#777777"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Categoría (desplegable) - colocado debajo del precio */}
            <Text style={styles.label}>Categoría</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdown]}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={{ color: selectedCategoryId ? "#FFFFFF" : "#777777" }}>
                {selectedCategoryId
                  ? CATEGORIES.find((c) => c.id === selectedCategoryId)?.label
                  : "Selecciona una categoría"}
              </Text>
            </TouchableOpacity>

            {/* Video */}
            <Text style={styles.label}>Vídeo (opcional)</Text>
            <TextInput
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="URL de YouTube o similar"
              placeholderTextColor="#777777"
              style={styles.input}
              autoCapitalize="none"
            />

            {/* Imagen clave */}
            <Text style={styles.label}>Imagen (clave en S3)</Text>
            <TextInput
              value={imagenClave}
              onChangeText={setImagenClave}
              placeholder="Ej: WIN_20251029_08_01_26_Pro.jpg"
              placeholderTextColor="#777777"
              style={styles.input}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              Debe coincidir con el nombre del archivo subido a tu bucket S3.
            </Text>

            {/* Descripción */}
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Cuenta paso a paso cómo se hace, herramientas necesarias, consejos..."
              placeholderTextColor="#777777"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* BOTÓN PUBLICAR */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0B0B0B" />
            ) : (
              <View style={styles.submitContent}>
                <Ionicons name="checkmark-circle" size={20} color="#0B0B0B" />
                <Text style={styles.submitText}>Publicar truco</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },

  /* HEADER */
  header: {
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

  /* CARD FORM */
  card: {
    marginTop: 8,
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
  },
  helperText: {
    color: "#777777",
    fontSize: 11,
    marginTop: 4,
  },
  textArea: {
    height: 110,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  /* SUBMIT */
  submitButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    color: "#0B0B0B",
    fontWeight: "600",
    fontSize: 15,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: "#F2B233",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#0B0B0B",
    fontWeight: "600",
  },
  dropdown: {
    justifyContent: "center",
    height: 48,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 12,
    maxHeight: 360,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
