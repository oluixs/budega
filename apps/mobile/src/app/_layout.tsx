import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: "#1F7A4D" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mercados/[slug]" options={{ title: "Mercado" }} />
        <Stack.Screen name="ofertas/[id]" options={{ title: "Oferta" }} />
        <Stack.Screen name="encartes/[id]" options={{ title: "Encarte" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
