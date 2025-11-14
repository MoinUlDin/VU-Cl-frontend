import api from "./api";

export default class UserManagerment {
  static async FetchactiveUsers() {
    try {
      const response = await api.get(`/tasks/auth/active-users/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
  static async FetchMembers() {
    try {
      const response = await api.get(`/tasks/auth/members/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching members Only ", error);
      throw error.response?.data || error.message;
    }
  }
  static async FetchpendingRequests() {
    try {
      const response = await api.get(`/tasks/auth/inactive-users/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
  static async ApproveRequest(payload: any) {
    try {
      const response = await api.post(`/tasks/auth/approve/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
  static async RejectRequest(payload: any) {
    try {
      const response = await api.post(`/tasks/auth/approve/`, payload);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Pending ", error);
      throw error.response?.data || error.message;
    }
  }
}
