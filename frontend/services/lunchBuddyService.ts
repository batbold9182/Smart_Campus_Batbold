import { io, Socket } from "socket.io-client";
import api from "../config/clientAPI";

export type LunchBuddyMessage = {
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

export type LunchBuddyPresencePayload = {
  onlineCount: number;
};

export type LunchBuddySendAck = {
  ok: boolean;
  error?: string;
};

type LunchBuddyHistoryResponse = {
  messages: LunchBuddyMessage[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const getLunchBuddyMessages = async (limit = 50) => {
  const response = await api.get<LunchBuddyHistoryResponse>("/api/lunch-buddy/messages", {
    params: { limit },
  });

  return response.data.messages;
};

export const connectLunchBuddySocket = (token: string): Socket => {
  if (!SOCKET_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  return io(`${SOCKET_BASE_URL}/lunch-buddy`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });
};