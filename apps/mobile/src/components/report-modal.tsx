import { useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Flag, X } from "lucide-react-native";
import type { ReportReason } from "@budega/shared";
import { submitReport } from "@/lib/actions";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "preco_incorreto", label: "Preço incorreto" },
  { value: "oferta_vencida", label: "Oferta vencida" },
  { value: "mercado_incorreto", label: "Mercado incorreto" },
  { value: "conteudo_inadequado", label: "Conteúdo inadequado" },
  { value: "encarte_ilegivel", label: "Encarte ilegível" },
];

interface ReportModalProps {
  marketId?: string;
  offerId?: string;
  flyerId?: string;
  defaultReason?: ReportReason;
}

export function ReportModal({ marketId, offerId, flyerId, defaultReason }: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>(defaultReason ?? "preco_incorreto");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitReport({
      market_id: marketId ?? null,
      offer_id: offerId ?? null,
      flyer_id: flyerId ?? null,
      reason,
      description: description || null,
    });
    setSubmitting(false);
    Alert.alert(result.success ? "Obrigado!" : "Ops", result.message);
    if (result.success) {
      setOpen(false);
      setDescription("");
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2"
      >
        <Flag size={16} color="#4A463D" />
        <Text className="font-medium text-neutral-900">Denunciar</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="gap-4 rounded-t-2xl bg-white p-4 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-neutral-900">Denunciar conteúdo</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <X size={20} color="#4A463D" />
              </Pressable>
            </View>

            <View className="gap-2">
              {REASONS.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setReason(item.value)}
                  className={`rounded-lg border px-4 py-3 ${
                    reason === item.value ? "border-brand-500 bg-brand-50" : "border-neutral-300"
                  }`}
                >
                  <Text className={reason === item.value ? "font-medium text-brand-700" : "text-neutral-700"}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Detalhes (opcional)"
              multiline
              className="min-h-20 rounded-lg border border-neutral-300 px-4 py-3"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className="items-center rounded-full bg-brand-500 py-3"
            >
              <Text className="font-semibold text-white">{submitting ? "Enviando..." : "Enviar denúncia"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
