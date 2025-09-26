import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized! Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Notification API functions
export const notificationAPI = {
  getNotifications: (
    params: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: string;
    } = {}
  ) => api.get("/notifications", { params }),

  // Get unread notifications count
  getUnreadCount: () => api.get("/notifications/unread-count"),

  // Mark a specific notification as read
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  // Mark all or selected notifications as read
  markAllAsRead: (notificationIds?: string[]) =>
    api.patch("/notifications/mark-all-read", { notificationIds }),

  // Delete a specific notification
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

  // Clear all read notifications
  clearAllRead: () => api.delete("/notifications/clear-all"),
};

// Analytics API functions
export const analyticsAPI = {
  // Get dashboard analytics data
  getDashboard: () => api.get("/analytics/dashboard"),

  // Get monthly task trends
  getMonthlyTrends: () => api.get("/analytics/monthly-trends"),

  // Get user analytics
  getUserAnalytics: (userId: string) => api.get(`/analytics/user/${userId}`),
};

export default api;
