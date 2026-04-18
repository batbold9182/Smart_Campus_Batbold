import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

type NetworkStatus = {
  isOnline: boolean;
  /** True only after the connection has been restored at least once since the app started. */
  justReconnected: boolean;
};

/**
 * Returns the current network connectivity status.
 * `justReconnected` flips to true for one tick when connectivity is restored
 * so callers can trigger a retry without any additional flag management.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // Fetch the initial state
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;

      setIsOnline((prev) => {
        if (!prev && connected) {
          // Was offline, now online → signal a reconnect
          setJustReconnected(true);
        }
        return connected;
      });
    });

    return unsubscribe;
  }, []);

  // Reset justReconnected after one render cycle
  useEffect(() => {
    if (!justReconnected) return;
    const id = setTimeout(() => setJustReconnected(false), 0);
    return () => clearTimeout(id);
  }, [justReconnected]);

  return { isOnline, justReconnected };
}
