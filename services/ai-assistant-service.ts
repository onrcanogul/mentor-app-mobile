import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";
import { AIChat } from "../domain/aichat";
import i18n from "../i18n"; // burası önemli

class AIAssistantService {
  endpoint = "/aiassistant";

  async getPrevious(userId: string) {
    try {
      const response = await api.get(`${this.endpoint}/${userId}`);
      return response.data.data;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async getChat(id: string) {
    try {
      const response = await api.get(`${this.endpoint}/chat/${id}`);
      return response.data.data;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async startChat(model: Partial<AIChat>) {
    try {
      const response = await api.post(`${this.endpoint}`, model);
      return response.data.data;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async askQuestion(chatId: string, question: string, senderType: number) {
    try {
      const response = await api.post(
        `${this.endpoint}/ask-question/${chatId}/${senderType}/${question}`
      );
      return response.data.data;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }
}

export default new AIAssistantService();
