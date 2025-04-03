import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Report } from "../domain/report";
import api from "./axios/axiosInstance";

export default class ReportService {
  endpoint = "/report";

  async get(
    id: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<Report[]> = (
      await api.get(`${this.endpoint}/${id}`)
    ).data;
    if (response.isSuccessful) {
      successCallback();
      return response.data;
    } else {
      errorCallback();
    }
  }

  async create(
    model: Partial<Report>,
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
    model: Partial<Report>,
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
