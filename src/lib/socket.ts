import { envConfig } from "@/config/envConfig";
import { getAccessToken } from "@/lib/auth/token";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const isSocketConfigured = () => Boolean(envConfig.socketUrl);

export const getSocket = (): Socket | null => {
  if (!envConfig.socketUrl) return null;

  const token = getAccessToken() || undefined;

  if (!socket) {
    socket = io(envConfig.socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      timeout: 8000,
      reconnection: true,
      reconnectionAttempts: 5,
      auth: { token },
    });
  } else {
    // Keep handshake token in sync after login / password change
    socket.auth = { token };
  }

  return socket;
};

export const resetSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
};
