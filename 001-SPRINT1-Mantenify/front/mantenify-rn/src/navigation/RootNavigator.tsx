// src/navigation/RootNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import DetailScreen from "../screens/DetailScreen";
import FiltersScreen from "../screens/FiltersScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import CreateItemScreen from "../screens/CreateItemScreen";
import ProfileScreen from "../screens/ProfileScreen";

// ---------- Tipos ----------
type HomeStackParamList = {
  Home: undefined;
  Detail: { id: number };
  Filters: undefined;
};

type TabParamList = {
  HomeStack: undefined;
  Favorites: undefined;
  CreateItem: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ---------- Stack de Home ----------
function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} />
    </Stack.Navigator>
  );
}

// ---------- Custom TabBar ----------
// ---------- Custom TabBar ----------
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {/* Píldora de navegación (left) */}
      <View style={styles.pillWrapper}>
        <View style={styles.tabBarBlur} />

        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const iconName =
              route.name === "HomeStack"
                ? "home"
                : route.name === "Favorites"
                ? "heart"
                : route.name === "CreateItem"
                ? "add"
                : "person";

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={iconName as any}
                  size={22}
                  color={isFocused ? "#0B0B0B" : "#A1A1A1"}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* El '+' está ahora dentro de la píldora como una pestaña normal */}
    </View>
  );
}

// ---------- RootNavigator (SOLO Tab.Navigator, sin NavigationContainer) ----------
function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeStack" component={HomeStackNavigator} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="CreateItem" component={CreateItemScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default RootNavigator;

// ---------- Estilos ----------
const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 24 : 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 34, // margen lateral en pantalla
  },

  // wrapper de la píldora (menu)
  pillWrapper: {
    width: 260,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
  },

  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
  },

  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 80,
    borderRadius: 40,
    paddingHorizontal: 16,
  },

  tabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 26, 0.40)",
  },

  tabButtonActive: {
    backgroundColor: "#F2B233",
  },

  // botón + flotante
  // (removed floating FAB styles; CreateItem is now a normal tab)
});
