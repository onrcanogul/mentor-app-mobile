import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Category } from "../domain/category";
import { Goal } from "../domain/goal";
import { Mentee } from "../domain/mentee";
import i18n from "../i18n";
import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";

class MenteeService {
  endpoint = "/mentee";

  async get(userId: string) {
    try {
      const response: ServiceResponse<Mentee> = (
        await api.get(`${this.endpoint}/${userId}`)
      ).data;
      return response.data;
    } catch (error) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }
  async addCategory(userId: string, category: Category[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/add-category/${userId}`, category)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async addGoal(model: Partial<Goal>) {
    try {
      const response: ServiceResponse<Goal> = (
        await api.post(`${this.endpoint}/add-goal`, model)
      ).data;
      return response.data;
    } catch (error: any) {
      toastrService.error(error);
    }
  }

  async removeGoal(id: string) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/remove-goal/${id}`)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(error);
    }
  }
}

export default new MenteeService();
