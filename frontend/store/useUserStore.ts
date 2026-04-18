import { create } from "zustand";
import { getProfile, type AppUserProfile } from "../services/userService";

type UserStore = {
  user: AppUserProfile | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  clear: () => void;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,
  fetchUser: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const user = await getProfile();
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  clear: () => set({ user: null }),
}));
