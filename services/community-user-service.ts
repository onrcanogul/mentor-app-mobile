import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Category } from "../domain/category";
import { CommunityUser } from "../domain/communityUser";
import i18n from "../i18n";
import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";

class CommunityUserservice {
  endpoint = "/communityuser";

  async get(userId: string) {
    try {
      const response: ServiceResponse<CommunityUser> = (
        await api.get(`${this.endpoint}/${userId}`)
      ).data;
      return response.data;
    } catch (error: any) {
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
}

export default new CommunityUserservice();
