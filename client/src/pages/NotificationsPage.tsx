import React, { useState, useEffect } from "react";
import { Bell, Filter, CheckSquare, Trash2, RefreshCw } from "lucide-react";
import { useNotificationContext } from "../contexts/NotificationContext";
import { NotificationItem } from "../components/notifications/NotificationItem";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    clearAllRead,
  } = useNotificationContext();

  const [filter, setFilter] = useState<
    "all" | "unread" | "task_assigned" | "task_updated" | "task_completed"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);

  useEffect(() => {
    const params: any = {
      page: currentPage,
      limit: 20,
    };

    if (filter === "unread") {
      params.unreadOnly = true;
    } else if (filter !== "all") {
      params.type = filter;
    }

    fetchNotifications(params);
  }, [currentPage, filter, fetchNotifications]);

  const handleRefresh = () => {
    setCurrentPage(1);
    const params: any = {
      page: 1,
      limit: 20,
    };

    if (filter === "unread") {
      params.unreadOnly = true;
    } else if (filter !== "all") {
      params.type = filter;
    }

    fetchNotifications(params);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length > 0) {
      await markAllAsRead(unreadNotifications.map((n) => n._id));
      handleRefresh();
    }
  };

  const handleClearAllRead = async () => {
    await clearAllRead();
    handleRefresh();
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const hasUnread = notifications.some((n) => !n.isRead);
  const hasRead = notifications.some((n) => n.isRead);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with your tasks and projects
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              {hasUnread && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Mark All Read</span>
                </button>
              )}
              {hasRead && (
                <button
                  onClick={handleClearAllRead}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filter by:
              </span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Notifications" },
                { key: "unread", label: "Unread Only" },
                { key: "task_assigned", label: "Task Assigned" },
                { key: "task_updated", label: "Task Updated" },
                { key: "task_completed", label: "Task Completed" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilter(key as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Failed to load notifications
                </p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </p>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : filter === "all"
                  ? "You don't have any notifications yet."
                  : `No ${filter.replace("_", " ")} notifications found.`}
              </p>
            </div>
          )}

          {!loading && !error && filteredNotifications.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  showActions={true}
                  onClick={() => {
                    // Handle notification click - could navigate to related task/project
                    console.log("Clicked notification:", notification);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination would go here if needed */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
