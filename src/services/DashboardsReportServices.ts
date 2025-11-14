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
  static async FetchReports(params: string) {
    try {
      const response = await api.get(`/tasks/reports/?${params}`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Reports ", error);
      throw error.response?.data || error.message;
    }
  }

  static async ExportReportsCSV(params: string) {
    try {
      const response = await api.get(`/tasks/reports/?${params}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      console.log("Error Exporting Reports CSV ", error);
      throw error.response?.data || error.message;
    }
  }

  static async ExportReportsRawCSV(params: string) {
    try {
      // append raw=1 safely
      const sep = params && params.length ? "&" : "";
      const response = await api.get(`/tasks/reports/?${params}${sep}raw=1`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      console.log("Error Exporting Raw Reports CSV ", error);
      throw error.response?.data || error.message;
    }
  }
}
