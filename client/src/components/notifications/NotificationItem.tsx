import React from "react";
import {
  Clock,
  CheckCircle,
  X,
  User,
  FileText,
  MessageSquare,
} from "lucide-react";
import { PopulatedNotification } from "../../types";
import { useNotificationContext } from "../../contexts/NotificationContext";

interface NotificationItemProps {
  notification: PopulatedNotification;
  showActions?: boolean;
  onClick?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  showActions = true,
  onClick,
}) => {
  const { markAsRead, deleteNotification } = useNotificationContext();

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification._id);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "task_assigned":
      case "task_reassigned":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "task_updated":
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case "task_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "comment_added":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "project_assigned":
        return <User className="h-5 w-5 text-indigo-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const senderName =
    typeof notification.sender === "object"
      ? notification.sender.name
      : "Unknown";

  return (
    <div
      className={`p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        notification.isRead
          ? "bg-white border-l-gray-200"
          : "bg-blue-50 border-l-blue-500"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className={`text-sm font-medium ${
                notification.isRead
                  ? "text-gray-900"
                  : "text-gray-900 font-semibold"
              }`}
            >
              {notification.title}
            </h4>
            {showActions && (
              <div className="flex items-center space-x-1">
                {!notification.isRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Delete notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <p
            className={`text-sm ${
              notification.isRead ? "text-gray-600" : "text-gray-700"
            } mt-1`}
          >
            {notification.message}
          </p>
          <div className="flex items-center text-xs text-gray-500 mt-2 space-x-2">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>from {senderName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(notification.createdAt)}</span>
            </div>
          </div>
          {notification.relatedTask && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Task:{" "}
                {typeof notification.relatedTask === "object"
                  ? notification.relatedTask.title
                  : "Unknown"}
              </span>
            </div>
          )}
          {notification.relatedProject && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Project:{" "}
                {typeof notification.relatedProject === "object"
                  ? notification.relatedProject.title
                  : "Unknown"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
