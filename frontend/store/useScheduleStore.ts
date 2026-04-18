import { create } from "zustand";

type ScheduleStore = {
  todaySchedule: any[];
  setTodaySchedule: (items: any[]) => void;
  clear: () => void;
};

export const useScheduleStore = create<ScheduleStore>((set) => ({
  todaySchedule: [],
  setTodaySchedule: (items) => set({ todaySchedule: items }),
  clear: () => set({ todaySchedule: [] }),
}));
