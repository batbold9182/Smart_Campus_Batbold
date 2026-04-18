import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getToken } from "../services/tokenStorage";

export type BuddyMessage = {
  id: string;
  text: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    program: string | null;
  };
};

type SendAck = { ok: boolean; error?: string };

type Options<T extends BuddyMessage> = {
  connect: (token: string) => Promise<Socket>;
  fetchHistory: (limit: number) => Promise<T[]>;
  buddyName: string;
  /** When false the socket is torn down and state is reset. Default: true. */
  enabled?: boolean;
};

export type BuddySocketResult<T extends BuddyMessage> = {
  messages: T[];
  loading: boolean;
  sending: boolean;
  error: string;
  statusLabel: string;
  onlineCount: number;
  isConnected: () => boolean;
  send: (text: string, onSuccess: () => void, onError: (msg: string) => void) => void;
};

/**
 * Generic hook that owns the full socket lifecycle for a buddy chat room.
 * Handles: connect, disconnect, reconnect, visibility-change, presence:update, message:new.
 *
 * Pass `enabled={false}` to lazily activate (used by VizjaFriends hub/section switching).
 */
export function useBuddySocket<T extends BuddyMessage>({
  connect,
  fetchHistory,
  buddyName,
  enabled = true,
}: Options<T>): BuddySocketResult<T> {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [statusLabel, setStatusLabel] = useState("Connecting...");
  const [onlineCount, setOnlineCount] = useState(0);

  const appendMessage = useCallback((message: T) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setMessages([]);
      setSending(false);
      setOnlineCount(0);
      setError("");
      setStatusLabel("Connecting...");
      setLoading(true);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setStatusLabel("Connecting...");
    setError("");

    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState === "hidden") {
        socketRef.current?.disconnect();
      } else {
        socketRef.current?.connect();
      }
    };

    const init = async () => {
      try {
        const token = await getToken();
        const history = await fetchHistory(60);

        if (!isMounted) return;
        setMessages(history);

        const socket = await connect(token ?? "");
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!isMounted) return;
          fetchHistory(100).then((msgs) => { if (isMounted) setMessages(msgs); });
          setStatusLabel("Live");
          setError("");
        });

        socket.on("disconnect", () => {
          if (!isMounted) return;
          setStatusLabel("Reconnecting...");
        });

        socket.on("connect_error", (err: Error) => {
          if (!isMounted) return;
          setStatusLabel("Offline");
          setError(err.message || `Unable to connect to ${buddyName}`);
        });

        socket.on("reconnect_failed", () => {
          if (!isMounted) return;
          setStatusLabel("Offline");
          setError(`Could not reconnect to ${buddyName}. Please reload the page.`);
        });

        socket.on("presence:update", (payload: { onlineCount: number }) => {
          if (!isMounted) return;
          setOnlineCount(payload.onlineCount ?? 0);
        });

        socket.on("message:new", (message: T) => {
          if (!isMounted) return;
          appendMessage(message);
        });

        if (typeof document !== "undefined") {
          document.addEventListener("visibilitychange", handleVisibilityChange);
        }

        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || `Failed to load ${buddyName}`);
        setStatusLabel("Offline");
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [enabled, connect, fetchHistory, buddyName, appendMessage]);

  const send = useCallback(
    (text: string, onSuccess: () => void, onError: (msg: string) => void) => {
      const socket = socketRef.current;
      if (!socket) return;
      setSending(true);
      socket.emit("message:send", { text }, (response: SendAck) => {
        setSending(false);
        if (response?.ok) {
          onSuccess();
        } else {
          onError(response?.error || "Please try again.");
        }
      });
    },
    []
  );

  const isConnected = useCallback(() => socketRef.current?.connected ?? false, []);

  return { messages, loading, sending, error, statusLabel, onlineCount, send, isConnected };
}
