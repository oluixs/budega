import { Tabs } from "expo-router";
import { Compass, Heart, Search, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// O navegador reserva ~28 px para o ícone; a barra precisa de altura para ele + rótulo de 16 px.
const TAB_ICON_SIZE = 22;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1F7A4D",
        // neutral-700 (9,4:1 no branco): aba inativa bem legível; a ativa usa a cor da marca.
        tabBarInactiveTintColor: "#4A463D",
        // Rótulos de 12 px (mínimo do DESIGN.md) não cabem na altura padrão da barra, e uma
        // altura fixa sem a área segura os cortava em aparelhos com barra de gestos ou
        // indicador do iPhone. Altura = conteúdo + inset inferior (ver .audit/errors/2026-09-29/).
        tabBarStyle: { height: 70 + insets.bottom, paddingTop: 6, paddingBottom: 8 + insets.bottom },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color }) => <Compass color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => <Search color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color }) => <Heart color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User color={color} size={TAB_ICON_SIZE} />,
        }}
      />
    </Tabs>
  );
}
