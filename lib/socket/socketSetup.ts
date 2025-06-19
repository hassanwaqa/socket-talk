// socketSetup.js
import socket from "./socketClient";
import { handleIncomingSocketMessage } from "./socketEvents";

export const setupSocketListeners = () => {
  socket.on("message", (response: any) => {
    handleIncomingSocketMessage(response);
  });
};
