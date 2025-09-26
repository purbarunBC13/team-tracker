import React, { useRef, useEffect } from "react";
import { CheckSquare, Trash2 } from "lucide-react";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { NotificationItem } from "./NotificationItem";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onViewAll,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    loading,
    error,
    markAllAsRead,
    clearAllRead,
    refreshNotifications,
  } = useNotificationContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length > 0) {
      await markAllAsRead(unreadNotifications.map((n) => n._id));
    }
  };

  const handleClearAllRead = async () => {
    await clearAllRead();
  };

  const recentNotifications = notifications.slice(0, 5);
  const hasUnread = notifications.some((n) => !n.isRead);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {hasUnread && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="Mark all as read"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleClearAllRead}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Clear all read notifications"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-600">
            <p>Failed to load notifications</p>
            <button
              onClick={refreshNotifications}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && recentNotifications.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        )}

        {!loading && !error && recentNotifications.length > 0 && (
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                showActions={true}
                onClick={() => {
                  // Handle notification click - could navigate to related task/project
                  if (!notification.isRead) {
                    // Mark as read when clicked
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={() => {
              onViewAll();
              onClose();
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all notifications ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
};
