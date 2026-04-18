import {
  connectPartyBuddySocket,
  getPartyBuddyMessages,
  type PartyBuddyMessage,
} from "../services/studentServices/partyBuddyService";
import { useBuddySocket } from "./useBuddySocket";

export function usePartyBuddy() {
  return useBuddySocket<PartyBuddyMessage>({
    connect: connectPartyBuddySocket,
    fetchHistory: getPartyBuddyMessages,
    buddyName: "Party Buddy",
  });
}
