import { io, Socket } from "socket.io-client";
import api from "../../config/clientAPI";

export type PartyBuddyMessage = {
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

export type PartyBuddyPresencePayload = {
  onlineCount: number;
};

export type PartyBuddySendAck = {
  ok: boolean;
  error?: string;
};

type HistoryResponse = {
  messages: PartyBuddyMessage[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const getPartyBuddyMessages = async (limit = 50) => {
  const response = await api.get<HistoryResponse>("/api/party-buddy/messages", {
    params: { limit },
  });

  return response.data.messages;
};

export const connectPartyBuddySocket = (token: string): Socket => {
  if (!SOCKET_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  return io(`${SOCKET_BASE_URL}/party-buddy`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });
};
