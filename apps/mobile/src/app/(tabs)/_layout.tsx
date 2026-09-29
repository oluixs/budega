import { Tabs } from "expo-router";
import { Compass, Heart, Search, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1F7A4D",
        tabBarInactiveTintColor: "#8A8375",
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
