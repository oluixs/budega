import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { authSchema, buildWebUrl } from "@budega/shared";
import { isMock, supabase } from "@/lib/supabase";

export default function PerfilScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      Alert.alert("Dados inválidos", parsed.error.issues[0]?.message ?? "Revise e-mail e senha.");
      return;
    }

    if (isMock) {
      Alert.alert(
        "Modo demonstração",
        "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY para habilitar login real. Por enquanto, você pode continuar usando o Budega sem conta.",
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Erro ao entrar", error.message);
    else Alert.alert("Login realizado com sucesso.");
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-6 p-4 pb-10 pt-14">
      <View>
        <Text className="text-2xl font-bold text-neutral-900">Perfil</Text>
        <Text className="mt-1 text-neutral-500">
          Entrar é opcional — só é necessário para sincronizar favoritos entre
          aparelhos. Consultar mercados e ofertas nunca exige cadastro.
        </Text>
      </View>

      <View className="gap-3">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-3"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Senha"
          secureTextEntry
          className="rounded-lg border border-neutral-300 bg-white px-4 py-3"
        />
        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          className="items-center rounded-full bg-brand-500 py-3"
        >
          <Text className="font-semibold text-white">{loading ? "Entrando..." : "Entrar"}</Text>
        </Pressable>
      </View>

      <View className="gap-1 border-t border-neutral-200 pt-4">
        {/* Google Play e App Store exigem acesso à política de privacidade dentro do app. */}
        <Text
          accessibilityRole="link"
          onPress={() => Linking.openURL(buildWebUrl("/privacidade"))}
          className="py-2 font-medium text-brand-600 underline"
        >
          Política de Privacidade
        </Text>
        <Text
          accessibilityRole="link"
          onPress={() => Linking.openURL(buildWebUrl("/termos"))}
          className="py-2 font-medium text-brand-600 underline"
        >
          Termos de Uso
        </Text>
        <Text className="mt-2 text-neutral-500">Budega v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
