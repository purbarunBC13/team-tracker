import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { Task, PopulatedTask } from "../../types";
import { Calendar, Clock, Edit, Trash2, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

interface TaskCardProps {
  task: Task | PopulatedTask;
  memberName?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { canEditTasks, canDeleteTasks, canUpdateTaskStatus } = useAuth();

  // Helper function to convert PopulatedTask back to Task for editing
  const getTaskForEdit = (task: Task | PopulatedTask): Task => {
    if (typeof task.assignee_id === "object") {
      // It's a PopulatedTask, convert back to Task
      return {
        ...task,
        assignee_id: task.assignee_id._id,
        project_id:
          typeof task.project_id === "object"
            ? task.project_id._id
            : task.project_id,
        createdBy:
          typeof task.createdBy === "object"
            ? task.createdBy._id
            : task.createdBy,
      } as Task;
    }
    return task as Task;
  };

  // Helper function to get assignee name
  const getAssigneeName = (): string | undefined => {
    if (typeof task.assignee_id === "object" && task.assignee_id?.name) {
      return task.assignee_id.name;
    }
    return undefined;
  };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "completed";

  // Check if this task has a valid ObjectId format
  const hasValidObjectId = /^[0-9a-fA-F]{24}$/.test(task._id);

  // Log warning for invalid tasks
  if (!hasValidObjectId) {
    console.warn("Task with invalid ObjectId detected:", {
      id: task._id,
      title: task.title,
    });
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task._id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        className={`h-full transition-all duration-300 hover:shadow-lg ${
          isOverdue
            ? "border-red-200 bg-red-50/50"
            : !hasValidObjectId
            ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10"
            : "border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold pr-2">
              {task.title}
            </CardTitle>
            <div className="flex space-x-1">
              <Badge className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              {!hasValidObjectId && (
                <Badge
                  className="bg-yellow-100 text-yellow-800"
                  title="Invalid task ID - editing disabled"
                >
                  ⚠️ Corrupted
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          {getAssigneeName() && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{getAssigneeName()}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between pt-4">
            {canUpdateTaskStatus() ? (
              <select
                value={task.status}
                onChange={(e) => {
                  // Validate ObjectId format before status change
                  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(task._id);
                  if (!isValidObjectId) {
                    console.error(
                      "Cannot update task with invalid ObjectId format:",
                      task._id
                    );
                    alert(
                      `Cannot update task status: Invalid ID format (${task._id}). This task may be corrupted.`
                    );
                    return;
                  }
                  onStatusChange(task._id, e.target.value as Task["status"]);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                  statusColors[task.status]
                }`}
                title="Update task status"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <Badge className={statusColors[task.status]}>
                {task.status === "todo"
                  ? "To Do"
                  : task.status === "in-progress"
                  ? "In Progress"
                  : "Completed"}
              </Badge>
            )}

            <div className="flex space-x-2">
              {canEditTasks() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Validate ObjectId format before editing
                    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(task._id);
                    if (!isValidObjectId) {
                      console.error(
                        "Cannot edit task with invalid ObjectId format:",
                        task._id
                      );
                      alert(
                        `Cannot edit task: Invalid ID format (${task._id}). This task may be corrupted.`
                      );
                      return;
                    }
                    onEdit(getTaskForEdit(task));
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canDeleteTasks() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </motion.div>
  );
};
