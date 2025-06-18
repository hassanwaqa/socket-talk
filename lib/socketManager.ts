import socket from "./socketClient";

let isConnected = false;

export const connectSocket = () => {
  console.log("connectSocket")
    console.log('isConnected', isConnected)


  if (!isConnected) {
    socket.connect();
    isConnected = true;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("connect_error", (err: any) => {
      console.error("❌ Connection error:", err.message);
    });
  }
};

export const disconnectSocket = () => {
  if (isConnected) {
    socket.disconnect();
    isConnected = false;
    console.log("🛑 Disconnected from socket");
  }
};