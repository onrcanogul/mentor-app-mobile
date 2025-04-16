// hooks/useChatSocket.ts
import { useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { domain } from "../services/axios/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MessageType } from "../domain/message";

interface SignalRMessage {
  chatId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  duration?: number;
  messageType: number;
  createdDate: string;
  isRead: boolean;
}

export const useChatSocket = (
  chatId: string,
  onMessageReceived: (message: SignalRMessage) => void
) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const setupConnection = useCallback(async () => {
    try {
      if (connectionRef.current) {
        await connectionRef.current.stop();
        connectionRef.current = null;
      }

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      console.log("SignalR bağlantısı başlatılıyor...");

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${domain}/chatHub?chatId=${chatId}`, {
          accessTokenFactory: () => token,
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .withHubProtocol(new signalR.JsonHubProtocol())
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) {
              return 0;
            } else if (retryContext.previousRetryCount < 3) {
              return 2000;
            } else if (retryContext.previousRetryCount < 5) {
              return 5000;
            }
            return null;
          },
        })
        .configureLogging(signalR.LogLevel.Debug)
        .build();

      // Bağlantı olaylarını dinle
      connection.onreconnecting((error) => {
        console.log("SignalR yeniden bağlanmaya çalışıyor:", error?.message);
      });

      connection.onreconnected((connectionId) => {
        console.log("SignalR yeniden bağlandı. ConnectionId:", connectionId);
      });

      connection.onclose((error) => {
        console.log("SignalR bağlantısı kapandı:", error?.message);
        // 5 saniye sonra yeniden bağlanmayı dene
        setTimeout(() => {
          if (
            !connectionRef.current ||
            connectionRef.current.state ===
              signalR.HubConnectionState.Disconnected
          ) {
            setupConnection();
          }
        }, 5000);
      });

      // Mesaj alma olayını dinle
      connection.on("ReceiveMessage", (message: SignalRMessage) => {
        console.log("Yeni mesaj alındı:", message);
        onMessageReceived(message);
      });

      try {
        // Bağlantıyı başlat
        console.log("Bağlantı başlatılıyor...");
        await connection.start();
        console.log("Bağlantı başarılı! State:", connection.state);

        connectionRef.current = connection;
      } catch (startError) {
        console.error("Bağlantı başlatma hatası:", startError);
        if (startError instanceof Error) {
          console.error("Hata detayı:", startError.message);
          console.error("Stack:", startError.stack);
        }
        throw startError;
      }
    } catch (error) {
      console.error("SignalR bağlantı hatası:", error);
      if (error instanceof Error) {
        console.error("Hata detayı:", error.message);
      }
      // 3 saniye sonra tekrar dene
      setTimeout(setupConnection, 3000);
    }
  }, [chatId]);

  useEffect(() => {
    setupConnection();

    return () => {
      const cleanup = async () => {
        try {
          const connection = connectionRef.current;
          if (connection?.state === signalR.HubConnectionState.Connected) {
            console.log("Bağlantı kapatılıyor...");
            await connection.stop();
            console.log("Bağlantı başarıyla kapatıldı");
          }
        } catch (error) {
          console.error("Bağlantı kapatma hatası:", error);
        } finally {
          connectionRef.current = null;
        }
      };
      cleanup();
    };
  }, [chatId, setupConnection]);

  const sendMessage = async (
    senderId: string,
    content: string,
    mediaUrl?: string,
    duration?: number,
    messageType: number = MessageType.Text
  ) => {
    try {
      const connection = connectionRef.current;

      if (
        !connection ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        console.log(
          "Bağlantı yok veya kopuk, yeniden bağlanmaya çalışılıyor..."
        );
        await setupConnection();
      }

      if (
        !connectionRef.current ||
        connectionRef.current.state !== signalR.HubConnectionState.Connected
      ) {
        throw new Error(
          `Bağlantı kurulamadı. Durum: ${connectionRef.current?.state}`
        );
      }

      console.log("Mesaj gönderiliyor...");
      await connectionRef.current.invoke(
        "SendMessage",
        chatId,
        senderId,
        content,
        mediaUrl,
        duration,
        messageType
      );
      console.log("Mesaj başarıyla gönderildi");
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      if (error instanceof Error) {
        console.error("Hata detayı:", error.message);
        console.error("Stack:", error.stack);
      }
      throw error;
    }
  };

  return { sendMessage };
};
