import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut } from "lucide-react-native";
import { buildFlyerShareUrl, formatDateBR, type Flyer } from "@budega/shared";
import { getActiveFlyers, getFlyerById } from "@/lib/data";
import { EmptyState } from "@/components/empty-state";
import { ReportModal } from "@/components/report-modal";

export default function FlyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [siblings, setSiblings] = useState<Flyer[]>([]);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    (async () => {
      const found = await getFlyerById(id);
      setFlyer(found);
      if (found) setSiblings(await getActiveFlyers(found.market_id));
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator color="#1F7A4D" />
      </View>
    );
  }

  if (!flyer) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-4">
        <EmptyState icon={FileText} title="Encarte não encontrado" />
      </View>
    );
  }

  const image = flyer.file_type === "image" ? flyer.file_url : flyer.cover_url;
  const currentIndex = siblings.findIndex((item) => item.id === flyer.id);
  const previous = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <View>
          <Text className="text-xl font-bold text-neutral-900">{flyer.title}</Text>
          <Text className="text-sm text-neutral-500">
            Válido de {formatDateBR(flyer.valid_from)} até {formatDateBR(flyer.valid_until)}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => Share.share({ message: flyer.title, url: buildFlyerShareUrl(flyer.id) })}
            className="flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2"
          >
            <Text className="font-medium text-neutral-900">Compartilhar</Text>
          </Pressable>
          <ReportModal flyerId={flyer.id} defaultReason="encarte_ilegivel" />
        </View>

        {flyer.description && <Text className="text-sm text-neutral-500">{flyer.description}</Text>}

        <View className="flex-row flex-wrap items-center justify-between gap-2">
          {/* PDF: mostramos a capa e abrimos o arquivo original (o app não renderiza PDF). */}
          {flyer.file_type === "pdf" ? (
            <Pressable
              onPress={() => Linking.openURL(flyer.file_url)}
              accessibilityRole="link"
              className="min-h-11 flex-row items-center gap-2 rounded-full bg-brand-500 px-4"
            >
              <FileText size={16} color="#FFFFFF" />
              <Text className="font-medium text-white">Ver encarte completo (PDF)</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {image && (
            <Pressable
              onPress={() => setZoomed((value) => !value)}
              accessibilityRole="button"
              className="min-h-11 flex-row items-center gap-2 rounded-full border border-neutral-300 px-3"
            >
              {zoomed ? <ZoomOut size={16} color="#124A2F" /> : <ZoomIn size={16} color="#124A2F" />}
              <Text className="font-medium text-neutral-900">{zoomed ? "Diminuir" : "Ampliar"}</Text>
            </Pressable>
          )}
        </View>

        {image && (
          <ScrollView horizontal={zoomed} className="max-h-[70vh] rounded-xl border border-neutral-300 bg-neutral-100">
            <Image
              source={{ uri: image }}
              accessibilityLabel={flyer.file_type === "pdf" ? `Primeira página do encarte ${flyer.title}` : `Encarte ${flyer.title}`}
              style={{ width: zoomed ? 600 : 360, height: zoomed ? 858 : 514 }}
              resizeMode="contain"
            />
          </ScrollView>
        )}

        {flyer.source_url && (
          <Text className="text-xs text-neutral-500">
            Encarte publicado pelo mercado no{" "}
            <Text accessibilityRole="link" onPress={() => Linking.openURL(flyer.source_url!)} className="font-medium text-brand-600 underline">
              site oficial
            </Text>
            . O Budega apenas reúne os encartes; preços e condições são de responsabilidade do mercado.
          </Text>
        )}

        {(previous || next) && (
          <View className="flex-row items-center justify-between pt-2">
            {previous ? (
              <Pressable
                onPress={() => router.push(`/encartes/${previous.id}`)}
                className="flex-row items-center gap-1"
              >
                <ChevronLeft size={16} color="#175C3A" />
                <Text className="font-medium text-brand-600">{previous.title}</Text>
              </Pressable>
            ) : (
              <View />
            )}
            {next && (
              <Pressable onPress={() => router.push(`/encartes/${next.id}`)} className="flex-row items-center gap-1">
                <Text className="font-medium text-brand-600">{next.title}</Text>
                <ChevronRight size={16} color="#175C3A" />
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
