import ServiceResponse from "../domain/base/serviceResponse";
import { Category } from "../domain/category";
import api from "./axios/axiosInstance";

class CategoryService {
  endpoint = "/category";

  async get(successCallback: () => void, errorCallback: () => void) {
    const response: ServiceResponse<Category[]> = (
      await api.get(`${this.endpoint}`)
    ).data;
    return response.data;
  }
}

export default new CategoryService();
