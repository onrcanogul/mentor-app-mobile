import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Match } from "../domain/match";
import i18n from "../i18n";
import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";

class MatchService {
  endpoint = "/match";
  async get(
    id: string,
    successCallback: () => void,
    errorCallback: () => void
  ): Promise<Match[]> {
    try {
      console.log("Fetching matches for user:", id);
      const response: ServiceResponse<Match[]> = (
        await api.get(`${this.endpoint}/${id}`)
      ).data;
      console.log("Match service response:", response);
      if (response.isSuccessful) {
        successCallback();
        return response.data;
      }
      errorCallback();
      return [];
    } catch (error) {
      console.error("Error in match service:", error);
      errorCallback();
      return [];
    }
  }

  async create(
    model: Partial<Match>,
    successCallback: (data: Match) => void,
    errorCallback: () => void
  ) {
    try {
      const response: ServiceResponse<Match> = (
        await api.post(this.endpoint, model)
      ).data;
      if (response.isSuccessful) {
        successCallback(response.data);
        return response.data;
      }
      errorCallback();
      return null;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async createCommunity(
    model: Partial<Match>,
    successCallback: (data: Match) => void,
    errorCallback: () => void
  ) {
    try {
      const response: ServiceResponse<Match> = (
        await api.post(this.endpoint + "/community", model)
      ).data;
      if (response.isSuccessful) {
        successCallback(response.data);
        return response.data;
      }
      errorCallback();
      return null;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async accept(
    matchId: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<NoContent> = (
      await api.post(this.endpoint + "/accept/" + matchId)
    ).data;
    if (response.isSuccessful) {
      successCallback();
    } else {
      errorCallback();
    }
  }

  async reject(
    matchId: string,
    successCallback: () => void,
    errorCallback: () => void
  ) {
    const response: ServiceResponse<NoContent> = (
      await api.post(this.endpoint + "/reject/" + matchId)
    ).data;
    if (response.isSuccessful) {
      successCallback();
    } else {
      errorCallback();
    }
  }

  async update(
    model: Partial<Match>,
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

export default new MatchService();
