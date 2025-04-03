import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Notification } from "../domain/notification";
import i18n from "../i18n";
import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";

class NotificationService {
  endpoint = "/notification";

  async get(
    id: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<Notification[]> = (
      await api.get(`${this.endpoint}/${id}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
      return response.data;
    }
    errorCallback();
    return [];
  }

  async read(id: string): Promise<boolean> {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/${id}`)
      ).data;
      return response.isSuccessful;
    } catch (error) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async create(
    model: Partial<Notification>,
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

  async update(
    model: Partial<Notification>,
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

export default new NotificationService();
