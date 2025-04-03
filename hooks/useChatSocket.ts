// hooks/useChatSocket.ts
import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { domain } from "../services/axios/axiosInstance";

export const useChatSocket = (
  chatId: string,
  onMessageReceived: (senderId: string, message: string) => void
) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${domain}/chatHub?chatId=${chatId}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.on("ReceiveMessage", (senderId: string, message: string) => {
      onMessageReceived(senderId, message);
    });

    connection
      .start()
      .then(() => {
        console.log("SignalR bağlantısı kuruldu.");
      })
      .catch((err) => {
        console.error("SignalR bağlantı hatası:", err);
      });

    return () => {
      connection.stop();
    };
  }, [chatId]);

  const sendMessage = async (senderId: string, message: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke(
        "SendMessage",
        chatId,
        senderId,
        message
      );
    } else {
      console.warn("SignalR bağlı değil.");
    }
  };

  return { sendMessage };
};
