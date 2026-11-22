"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket, isSocketConfigured, resetSocket } from "@/lib/socket";
import { AUTH_CHANGED_EVENT, getAccessToken } from "@/lib/auth/token";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSocketConfigured()) return;

    const connectWithAuth = () => {
      const token = getAccessToken();
      if (!token) {
        resetSocket();
        setSocket(null);
        setIsConnected(false);
        return;
      }

      const instance = getSocket();
      if (!instance) return;

      setSocket(instance);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      const handleConnectError = () => setIsConnected(false);

      instance.off("connect", handleConnect);
      instance.off("disconnect", handleDisconnect);
      instance.off("connect_error", handleConnectError);
      instance.on("connect", handleConnect);
      instance.on("disconnect", handleDisconnect);
      instance.on("connect_error", handleConnectError);

      if (instance.connected) {
        instance.disconnect();
      }
      instance.connect();
    };

    connectWithAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, connectWithAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, connectWithAuth);
      resetSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
