import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { PopulatedNotification } from "../types";
import { notificationAPI } from "../lib/api";
import { useToast } from "../components/ui/toast";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  notifications: PopulatedNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (notificationIds?: string[]) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<PopulatedNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchNotifications = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        type?: string;
      } = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await notificationAPI.getNotifications(params);
        if (response.data.success) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount);
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch notifications";
        setError(errorMessage);
        console.error("Fetch notifications error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err: any) {
      console.error("Fetch unread count error:", err);
    }
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const response = await notificationAPI.markAsRead(id);
        if (response.data.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notification) =>
              notification._id === id
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : notification
            )
          );

          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));

          showSuccess("Notification marked as read");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to mark notification as read";
        showError(errorMessage);
        console.error("Mark as read error:", err);
      }
    },
    [showSuccess, showError]
  );

  const markAllAsRead = useCallback(
    async (notificationIds?: string[]) => {
      try {
        const response = await notificationAPI.markAllAsRead(notificationIds);
        if (response.data.success) {
          // Update local state
          if (notificationIds && notificationIds.length > 0) {
            setNotifications((prev) =>
              prev.map((notification) =>
                notificationIds.includes(notification._id)
                  ? {
                      ...notification,
                      isRead: true,
                      readAt: new Date().toISOString(),
                    }
                  : notification
              )
            );
          } else {
            // Mark all as read
            setNotifications((prev) =>
              prev.map((notification) => ({
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }))
            );
          }

          // Update unread count
          const markedCount = notificationIds?.length || unreadCount;
          setUnreadCount((prev) => Math.max(0, prev - markedCount));

          showSuccess(response.data.message);
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to mark notifications as read";
        showError(errorMessage);
        console.error("Mark all as read error:", err);
      }
    },
    [unreadCount, showSuccess, showError]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const response = await notificationAPI.deleteNotification(id);
        if (response.data.success) {
          // Update local state
          const deletedNotification = notifications.find((n) => n._id === id);
          setNotifications((prev) =>
            prev.filter((notification) => notification._id !== id)
          );

          // Update unread count if deleted notification was unread
          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          showSuccess("Notification deleted");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to delete notification";
        showError(errorMessage);
        console.error("Delete notification error:", err);
      }
    },
    [notifications, showSuccess, showError]
  );

  const clearAllRead = useCallback(async () => {
    try {
      const response = await notificationAPI.clearAllRead();
      if (response.data.success) {
        // Remove read notifications from local state
        setNotifications((prev) =>
          prev.filter((notification) => !notification.isRead)
        );

        showSuccess(response.data.message);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to clear notifications";
      showError(errorMessage);
      console.error("Clear all read error:", err);
    }
  }, [showSuccess, showError]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications({ limit: 10 });
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Fetch initial data on component mount, but only when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchNotifications({ limit: 10 });
      fetchUnreadCount();
    }
  }, [user, authLoading, fetchNotifications, fetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
