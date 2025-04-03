import ServiceResponse, { NoContent } from "../domain/base/serviceResponse";
import { Category } from "../domain/category";
import { Certificate } from "../domain/certificate";
import { Education } from "../domain/education";
import { Experience } from "../domain/experience";
import { Mentor } from "../domain/mentor";
import { Skill } from "../domain/skill";
import i18n from "../i18n";
import api from "./axios/axiosInstance";
import toastrService from "./toastr-service";

class MentorService {
  endpoint = "/mentor";

  async get(userId: string) {
    const response: ServiceResponse<Mentor> = (
      await api.get(`${this.endpoint}/${userId}`)
    ).data;
    return response.data;
  }
  async addCategory(userId: string, category: Category[]) {
    const response: ServiceResponse<NoContent> = (
      await api.post(`${this.endpoint}/add-category/${userId}`, category)
    ).data;
    return response.isSuccessful;
  }

  async saveCertificates(userId: string, certificates: Certificate[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/certificates/${userId}`, certificates)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async saveEducations(userId: string, educations: Education[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/educations/${userId}`, educations)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async saveExperiences(userId: string, experiences: Experience[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/experiences/${userId}`, experiences)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }

  async saveSkills(userId: string, skills: Skill[]) {
    try {
      const response: ServiceResponse<NoContent> = (
        await api.post(`${this.endpoint}/skills/${userId}`, skills)
      ).data;
      return response.isSuccessful;
    } catch (error: any) {
      toastrService.error(i18n.t(error.response.data.errors[0]));
    }
  }
}

export default new MentorService();
