import { io, Socket } from "socket.io-client";
import api from "../../config/clientAPI";

export type LearningBuddyMessage = {
  id: string;
  text: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    program: string | null;
    yearLevel: number | null;
    profile: string;
  };
};

export type LearningBuddyPresencePayload = {
  onlineCount: number;
};

export type LearningBuddySendAck = {
  ok: boolean;
  error?: string;
};

type HistoryResponse = {
  messages: LearningBuddyMessage[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const getLearningBuddyMessages = async (limit = 50) => {
  const response = await api.get<HistoryResponse>("/api/learning-buddy/messages", {
    params: { limit },
  });

  return response.data.messages;
};

export const connectLearningBuddySocket = (token: string): Socket => {
  if (!SOCKET_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  return io(`${SOCKET_BASE_URL}/learning-buddy`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });
};
