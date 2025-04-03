import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Message } from "../domain/message";
import api from "./axios/axiosInstance";

class MessageService {
  endpoint = "/message";

  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const response: ServiceResponse<Message[]> = (
        await api.get(`${this.endpoint}/chat/${chatId}`)
      ).data;

      if (response.isSuccessful) {
        return response.data;
      } else {
        console.error("Mesajlar yüklenemedi.");
        return [];
      }
    } catch (error) {
      console.error("Hata:", error);
      return [];
    }
  }

  async create(
    model: Partial<Message>,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(this.endpoint, model)
      ).data;

      if (response.isSuccessful) {
        successCallback();
      } else {
        errorCallback();
      }
    } catch (error) {
      console.error("Mesaj oluşturma hatası:", error);
      errorCallback();
    }
  }

  async update(
    model: Partial<Message>,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.put(this.endpoint, model)
      ).data;

      if (response.isSuccessful) {
        successCallback();
      } else {
        errorCallback();
      }
    } catch (error) {
      console.error("Mesaj güncelleme hatası:", error);
      errorCallback();
    }
  }

  async delete(
    id: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.delete(`${this.endpoint}/${id}`)
      ).data;

      if (response.isSuccessful) {
        successCallback();
      } else {
        errorCallback();
      }
    } catch (error) {
      console.error("Mesaj silme hatası:", error);
      errorCallback();
    }
  }
}

export default new MessageService();
