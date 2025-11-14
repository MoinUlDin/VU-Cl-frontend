import api from "./api";

export default class NotificationServices {
  static async FetchNotifications() {
    try {
      const response = await api.get(`/tasks/notifications/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
  static async MarkAsRead(id: string) {
    try {
      const response = await api.post(`/tasks/notification/${id}/mark-read/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
  static async MarkAllAsRead() {
    try {
      const response = await api.post(`/tasks/notification/mark-all-read/`);
      return response.data;
    } catch (error: any) {
      console.log("Error Fetching Active Users ", error);
      throw error.response?.data || error.message;
    }
  }
}
