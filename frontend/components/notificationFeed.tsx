import { ReactNode } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonList } from "./Skeleton";
import { AppButton } from "./ui";

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
};

type NotificationFeedProps = {
  title: string;
  notifications: NotificationItem[];
  loading: boolean;
  error: string;
  page: number;
  totalPages: number;
  onRetry: () => void;
  onMarkAsRead: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  topContent?: ReactNode;
  backLabel?: string;
};

export default function NotificationFeed({
  title,
  notifications,
  loading,
  error,
  page,
  totalPages,
  onRetry,
  onMarkAsRead,
  onPrevious,
  onNext,
  onBack,
  topContent,
  backLabel = "Back to Dashboard",
}: NotificationFeedProps) {
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View className="flex-1 bg-app-bg p-5" style={{ paddingTop: insets.top + 20 }}>
        <Text className="mb-3 text-app-xl font-bold text-app-text">{title}</Text>
        <SkeletonList rows={4} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-app-bg p-5" style={{ paddingTop: insets.top + 20 }}>
        <Text className="mb-3 text-app-xl font-bold text-app-text">{title}</Text>
        <Text className="mb-4 text-app-sm text-app-error">{error}</Text>
        <AppButton title="Retry" onPress={onRetry} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-app-bg"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }}
    >
      {topContent}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text className="mt-5 text-center text-app-sm text-app-muted">No notifications found</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onMarkAsRead(item._id)}
            className={`mb-2 rounded-xl border p-4 ${item.isRead ? "border-app-border-light bg-app-bg" : "border-app-primary bg-app-primary-bg"}`}
          >
            <Text className="mb-[6px] text-app-base font-bold text-app-text">{item.title}</Text>
            <Text className="mb-2 text-app-sm text-app-text">{item.message}</Text>
            <Text className={`text-app-xs ${item.isRead ? "text-app-muted" : "text-app-primary"}`}>
              {item.isRead ? "Read" : "Tap to mark as read"}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View className="mb-3 mt-2 flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <AppButton
            title="Previous"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onPress={onPrevious}
          />
        </View>
        <Text className="text-app-sm text-app-muted">Page {page} / {totalPages}</Text>
        <View className="flex-1">
          <AppButton
            title="Next"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onPress={onNext}
          />
        </View>
      </View>

      <AppButton title={backLabel} variant="outline" onPress={onBack} />
    </ScrollView>
  );
}
