import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Chat } from "../domain/chat";
import i18n from "../i18n";
import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";

class ChatService {
  endpoint = "/chat";

  async get(
    userId: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<Chat[]> = (
      await api.get(`${this.endpoint}/${userId}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
      return response.data;
    } else {
      errorCallback();
    }
  }

  async getForCommunity(
    userId: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<Chat[]> = (
      await api.get(`${this.endpoint}/community/${userId}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
      return response.data;
    } else {
      errorCallback();
    }
  }

  async getById(
    id: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<Chat> = (
      await api.get(`${this.endpoint}/single/${id}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
      return response.data;
    }
    errorCallback();
    return null;
  }

  async create(
    model: Partial<Chat>,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<NoContent> = (
      await api.post(this.endpoint, model)
    ).data;
    if (response.isSuccessful) {
      successCallback();
    } else {
      errorCallback();
    }
  }

  async close(id: string) {
    try {
      const response = await api.post(`${this.endpoint}/close/${id}`);
      return response.data.isSuccessful;
    } catch (error) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async update(
    model: Partial<Chat>,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<NoContent> = (
      await api.put(this.endpoint, model)
    ).data;
    if (response.isSuccessful) {
      successCallback();
    } else {
      errorCallback();
    }
  }

  async delete(
    id: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<NoContent> = (
      await api.delete(`${this.endpoint}/${id}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
    } else {
      errorCallback();
    }
  }
}

export default new ChatService();
