import { envConfig } from "@/config/envConfig";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const isSocketConfigured = () => Boolean(envConfig.socketUrl);

export const getSocket = (): Socket | null => {
  if (!envConfig.socketUrl) return null;

  if (!socket) {
    socket = io(envConfig.socketUrl, {
      autoConnect: false,
      transports: ["websocket"],
      timeout: 5000,
      reconnection: false,
    });
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
