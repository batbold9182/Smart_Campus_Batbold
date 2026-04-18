import {
  connectLunchBuddySocket,
  getLunchBuddyMessages,
  type LunchBuddyMessage,
} from "../services/studentServices/lunchBuddyService";
import { useBuddySocket } from "./useBuddySocket";

export function useLunchBuddy(enabled = true) {
  return useBuddySocket<LunchBuddyMessage>({
    connect: connectLunchBuddySocket,
    fetchHistory: getLunchBuddyMessages,
    buddyName: "Lunch Buddy",
    enabled,
  });
}
