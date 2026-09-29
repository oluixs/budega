import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Share, Text, View } from "react-native";
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

        <Pressable
          onPress={() => setZoomed((value) => !value)}
          className="flex-row items-center gap-2 self-end rounded-full border border-neutral-300 px-3 py-2"
        >
          {zoomed ? <ZoomOut size={16} color="#124A2F" /> : <ZoomIn size={16} color="#124A2F" />}
          <Text className="font-medium text-neutral-900">{zoomed ? "Diminuir" : "Ampliar"}</Text>
        </Pressable>

        <ScrollView horizontal={zoomed} className="max-h-[70vh] rounded-xl border border-neutral-300 bg-neutral-100">
          <Image
            source={{ uri: flyer.file_url }}
            style={{ width: zoomed ? 600 : 360, height: zoomed ? 840 : 504 }}
            resizeMode="contain"
          />
        </ScrollView>

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
