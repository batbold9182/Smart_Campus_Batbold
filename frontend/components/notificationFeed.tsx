import { ReactNode } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SkeletonList } from "./Skeleton";

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
};

type NotificationFeedStyles = {
  loadingScreen: string;
  title: string;
  errorText: string;
  muted: string;
  notificationCardRead: string;
  notificationCardUnread: string;
  paginationButtonEnabled: string;
  paginationButtonDisabled: string;
  paginationMeta: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
};

type NotificationFeedProps = {
  title: string;
  notifications: NotificationItem[];
  loading: boolean;
  error: string;
  page: number;
  totalPages: number;
  styles: NotificationFeedStyles;
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
  styles,
  onRetry,
  onMarkAsRead,
  onPrevious,
  onNext,
  onBack,
  topContent,
  backLabel = "Back to Dashboard",
}: NotificationFeedProps) {
  if (loading) {
    return (
      <View className={styles.loadingScreen}>
        <Text className={`mb-3 ${styles.title}`}>{title}</Text>
        <SkeletonList rows={4} />
      </View>
    );
  }

  if (error) {
    return (
      <View className={styles.loadingScreen}>
        <Text className={`mb-3 ${styles.title}`}>{title}</Text>
        <Text className={styles.errorText}>{error}</Text>
        <TouchableOpacity className={styles.paginationButtonEnabled} onPress={onRetry}>
          <Text className={styles.buttonPrimaryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-app-bg" contentContainerClassName="p-5 pb-6">
      {topContent}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        ListEmptyComponent={<Text className={`mt-5 text-center ${styles.muted}`}>No notifications found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onMarkAsRead(item._id)}
            className={item.isRead ? styles.notificationCardRead : styles.notificationCardUnread}
          >
            <Text className="mb-[6px] text-[16px] font-bold text-app-text">{item.title}</Text>
            <Text className="mb-2 text-[14px] text-app-text">{item.message}</Text>
            <Text className={`text-[12px] ${styles.muted}`}>{item.isRead ? "Read" : "Tap to mark as read"}</Text>
          </TouchableOpacity>
        )}
      />

      <View className="mb-3 mt-2 flex-row items-center justify-between">
        <TouchableOpacity
          className={loading || page <= 1 ? styles.paginationButtonDisabled : styles.paginationButtonEnabled}
          onPress={onPrevious}
          disabled={loading || page <= 1}
        >
          <Text className={styles.buttonPrimaryText}>Previous</Text>
        </TouchableOpacity>
        <Text className={styles.paginationMeta}>Page {page} / {totalPages}</Text>
        <TouchableOpacity
          className={loading || page >= totalPages ? styles.paginationButtonDisabled : styles.paginationButtonEnabled}
          onPress={onNext}
          disabled={loading || page >= totalPages}
        >
          <Text className={styles.buttonPrimaryText}>Next</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className={styles.buttonPrimary} onPress={onBack}>
        <Text className={styles.buttonPrimaryText}>{backLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
