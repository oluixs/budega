import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <Icon color="#175C3A" size={24} />
      </View>
      <Text className="text-center text-lg font-semibold text-neutral-900">{title}</Text>
      {description && <Text className="text-center text-neutral-500">{description}</Text>}
    </View>
  );
}
