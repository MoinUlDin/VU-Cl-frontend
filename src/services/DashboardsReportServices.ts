import api from "./api";

export default class DashboardsReportServices {
  static async AdminDashboard() {
    try {
      const response = await api.get(`/tasks/admin-dashboard/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Admin Dashboard ", error);
      throw error.response?.data || error.message;
    }
  }
  static async MemberDashboard() {
    try {
      const response = await api.get(`/tasks/member-dashboard/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Admin Dashboard ", error);
      throw error.response?.data || error.message;
    }
  }
}
