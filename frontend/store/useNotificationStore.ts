import { create } from "zustand";
import { getUnreadCount } from "../services/notificationService";

type NotificationStore = {
  unreadCount: number;
  fetchCount: (signal?: AbortSignal) => Promise<void>;
  clear: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  fetchCount: async (signal?: AbortSignal) => {
    try {
      const data = await getUnreadCount(signal);
      set({ unreadCount: data?.unreadCount ?? 0 });
    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        set({ unreadCount: 0 });
      }
    }
  },
  clear: () => set({ unreadCount: 0 }),
}));
