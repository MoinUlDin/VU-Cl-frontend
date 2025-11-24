import api from "./api";

export default class TaskServices {
  static async FetchTasks() {
    try {
      const response = await api.get(`/tasks/tasks/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async DeleteTask(id: string) {
    try {
      const response = await api.get(`/tasks/tasks/${id}/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async createTask(payload: any) {
    try {
      const response = await api.post(`/tasks/tasks/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async updateTask(id: number | string, payload: any) {
    try {
      const response = await api.patch(`/tasks/tasks/${id}/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async fetchMembersTasks() {
    try {
      const response = await api.get(`/tasks/assignments/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async updateMembersTasks(id: string, payload: any) {
    try {
      const response = await api.patch(`/tasks/status/${id}/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async PostComment(payload: any) {
    try {
      const response = await api.post(`/tasks/comments/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
  static async FetchComments(id: string) {
    try {
      const response = await api.get(`/tasks/${id}/comments/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Tasks ", error);
      throw error.response?.data || error.message;
    }
  }
}
