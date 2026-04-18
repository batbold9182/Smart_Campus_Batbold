import {
  connectLearningBuddySocket,
  getLearningBuddyMessages,
  type LearningBuddyMessage,
} from "../services/studentServices/learningBuddyService";
import { useBuddySocket } from "./useBuddySocket";

export function useLearningBuddy() {
  return useBuddySocket<LearningBuddyMessage>({
    connect: connectLearningBuddySocket,
    fetchHistory: getLearningBuddyMessages,
    buddyName: "Learning Buddy",
  });
}
