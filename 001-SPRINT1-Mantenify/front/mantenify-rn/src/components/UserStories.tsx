import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";

export type StoryUser = {
  id: number;
  nombre: string;
  avatarUrl: string | null;
};

type Props = {
  users: StoryUser[];
};

export default function UserStories({ users }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {users.map((u) => (
        <View key={u.id} style={styles.item}>
          {u.avatarUrl ? (
            <Image source={{ uri: u.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {u.nombre.trim().charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>
            {u.nombre}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  } as any,
  item: {
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#F2B233",
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#F2B233",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
  },
  name: {
    marginTop: 4,
    fontSize: 11,
    color: "#A1A1A1",
    maxWidth: 70,
    textAlign: "center",
  },
});
